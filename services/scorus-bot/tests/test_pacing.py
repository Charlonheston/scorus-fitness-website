import time
import threading
from concurrent.futures import ThreadPoolExecutor
from types import SimpleNamespace
from unittest.mock import patch
import pytest
from test_workflows import clean, make_lead
from app.store import Config, Job, Lead, Record, Session, engine
from app.domain import RuleError, cancel_sales, handoff, message, scoped_token, token_scope
from app.main import inbound, mcp_rpc
from app import worker
from app.queueing import budget_due, claim, delivery, pacing, permitted, recover, response_target, transport_result, validate_pacing

def contact(db,number='+34600900001'):
    lead=make_lead(db,number)
    for job in db.query(Job).filter_by(lead_id=lead.id):job.status='cancelled'
    lead.last_inbound=time.time()-1
    runtime=delivery(db);runtime.data={**runtime.data,'connection':'open','connected_since':time.time()-60}
    return lead

def due_all(kind):
    with Session.begin() as db:
        for j in db.query(Job).filter_by(kind=kind,status='pending'):j.due=time.time()-1

def get_claim(lane):
    with Session.begin() as db:return claim(db,lane)

def test_batch_combines_messages_and_generation_cancels_old_reply(monkeypatch):
    captured=[]
    monkeypatch.setenv('HERMES_BRIDGE_KEY','test')
    monkeypatch.setattr(worker,'mark_read',lambda records:captured.append(('read',[r.id for r in records])))
    def model(*args,**kwargs):
        captured.append(('prompt',kwargs['json']['prompt']))
        return SimpleNamespace(raise_for_status=lambda:None,json=lambda:{'reply':'Entrenar en casa es posible. ¿Cuántos días tienes?','usage':{}})
    monkeypatch.setattr(worker.httpx,'post',model)
    with Session.begin() as db:
        lead=contact(db)
        for i,txt in enumerate(['Hola','Quiero información','Entreno en casa']):
            inbound(db,lead.phone,txt,'batch-'+str(i),provider_key={'id':str(i),'fromMe':False,'remoteJid':'34600900001@s.whatsapp.net'})
        db.flush()
        assert db.query(Job).filter_by(kind='respond',status='pending').count()==1
        job=db.query(Job).filter_by(kind='respond',status='pending').one()
        assert 5<job.due-time.time()<=6
    due_all('respond');worker.execute_claim(*get_claim('respond'))
    assert captured[1][1]=='Hola\nQuiero información\nEntreno en casa'
    assert len(captured[0][1])==3
    with Session.begin() as db:
        reply=db.query(Job).filter_by(kind='send',status='pending').one()
        assert len(reply.data['message_ids'])==3
        inbound(db,lead.phone,'Solo tengo dos días','batch-new')
        assert reply.status=='cancelled'

def test_budget_survives_restart_and_limits_both_windows():
    now=time.time()
    with Session.begin() as db:
        cfg=pacing(db);runtime=delivery(db)
        runtime.data={**runtime.data,'last_send':now,'contacts':{'a':now},'attempts':[now-i for i in range(6)]}
    with Session.begin() as db:
        state=delivery(db).data
        assert budget_due(state,pacing(db),'a',now)==pytest.approx(now+55)
        state={**state,'attempts':[now-100-i for i in range(120)],'last_send':0,'contacts':{}}
        assert budget_due(state,cfg,'b',now)==pytest.approx(now+3381)
        assert budget_due({'last_send':now,'contacts':{'a':now}},cfg,'a',now)==now+12

def test_no_recovery_of_live_lease_and_no_resend_of_uncertain_send():
    with Session.begin() as db:
        lead=contact(db);message(db,lead,'Respuesta','uncertain')
    claimed=get_claim('send')
    with Session.begin() as db:
        job=db.get(Job,claimed[0]);recover(db);assert job.status=='running'
        job.lease_until=time.time()-1;job.data={**job.data,'dispatching':True};db.flush()
        recover(db);assert job.status=='review'
    assert get_claim('send') is None

def test_expired_inference_can_be_claimed_with_new_owner():
    with Session.begin() as db:
        lead=contact(db);inbound(db,lead.phone,'Hola','lease-input')
    due_all('respond');first=get_claim('respond')
    with Session.begin() as db:
        db.get(Job,first[0]).lease_until=time.time()-1;db.flush();recover(db)
    second=get_claim('respond');assert first[0]==second[0] and first[1]!=second[1]

def test_typing_takeover_cancels_before_send(monkeypatch):
    events=[]
    monkeypatch.setattr(worker,'presence',lambda phone,status,*args:events.append(status))
    monkeypatch.setattr(worker,'send_whatsapp',lambda *args:pytest.fail('Must not deliver after takeover'))
    with Session.begin() as db:
        lead=contact(db);job=message(db,lead,'Texto preparado','typing-test');job.data={**job.data,'guard_generation':True}
    worker.execute_claim(*get_claim('send'))
    assert events==['composing','paused']
    with Session.begin() as db:
        lead=db.get(Lead,lead.id);handoff(db,lead,'Atender',notify=False)
    worker.housekeeping([])
    assert get_claim('send') is None
    assert events[-1]=='paused'

def test_stop_cancels_queued_sends_and_mcp_turn(monkeypatch):
    monkeypatch.setenv('MCP_SECRET','test-scoped-secret')
    with Session.begin() as db:
        lead=contact(db);inbound(db,lead.phone,'Hola','mcp-start')
    due_all('respond');job_id,owner=get_claim('respond')
    with Session.begin() as db:
        lead=db.get(Lead,lead.id);generation=lead.generation
        reply=message(db,lead,'Esperando','stop-reply');reply.data={**reply.data,'guard_generation':True}
    scope=token_scope(scoped_token(lead.id,'test-scoped-secret',turn=job_id,owner=owner,generation=generation),'test-scoped-secret')
    args={'jsonrpc':'2.0','id':1,'method':'tools/call','params':{'name':'update_profile','arguments':{'answers':{'days':'3'}}}}
    assert 'isError":false' in mcp_rpc(scope,args).body.decode()
    with Session() as db:assert db.get(Lead,lead.id).profile['days']=='3'
    with Session.begin() as db:inbound(db,lead.phone,'baja','mcp-stop')
    assert 'isError":true' in mcp_rpc(scope,args).body.decode()
    with Session.begin() as db:
        assert db.get(Lead,lead.id).opted_out
        assert db.get(Job,reply.id).status=='cancelled'

def test_new_input_rejects_old_mcp_even_without_takeover():
    with Session.begin() as db:
        lead=contact(db);inbound(db,lead.phone,'Hola','old-token')
    due_all('respond');job_id,owner=get_claim('respond')
    with Session.begin() as db:
        lead=db.get(Lead,lead.id);scope={'lead':lead.id,'turn':job_id,'owner':owner,'generation':lead.generation}
        inbound(db,lead.phone,'Mejor cuatro días','new-token')
    body={'id':1,'method':'tools/call','params':{'name':'update_profile','arguments':{'answers':{'days':'2'}}}}
    assert 'Turno desactualizado' in mcp_rpc(scope,body).body.decode()

def test_no_promotion_without_consent_but_requested_transaction_allowed():
    with Session.begin() as db:
        lead=contact(db)
        assert not db.query(Job).filter_by(lead_id=lead.id,kind='followup',status='pending').count()
        promo=message(db,lead,'Promoción','promo',commercial=True)
        payment=message(db,lead,'Reserva solicitada','payment','payment_reminder',commercial=True)
        assert not permitted(db,promo,lead)
        assert permitted(db,payment,lead)
        lead.consent={**lead.consent,'marketing':True}
        assert permitted(db,promo,lead)

def test_provider_errors_open_circuit_and_restriction_requires_resume():
    with Session.begin() as db:
        for i in range(3):transport_result(db,RuntimeError())
        assert delivery(db).data['pause_until']>=time.time()+299
        transport_result(db,RuntimeError(),600,True)
        assert delivery(db).data['restricted'] and delivery(db).data['pause_until']>=time.time()+599

def test_delivery_records_accepted_receipt_and_marks_batch_answered(monkeypatch):
    monkeypatch.setattr(worker,'presence',lambda *args:None)
    monkeypatch.setattr(worker,'send_whatsapp',lambda *args:{'key':{'id':'provider-1'}})
    with Session.begin() as db:
        lead=contact(db);inbound(db,lead.phone,'Consulta','delivery-input')
        for job in db.query(Job).filter_by(kind='respond'):job.status='cancelled'
        job=message(db,lead,'Respuesta','delivery-reply');job.data={**job.data,'phase':'typing','message_ids':['inbound:delivery-input'],'first_inbound':time.time()-20}
        db.add(Record(id='receipt:provider-1',kind='receipt',data={'status':3}))
    worker.execute_claim(*get_claim('send'))
    with Session.begin() as db:
        assert db.get(Record,'sent:provider-1').data['delivery_status']==3
        assert db.get(Record,'inbound:delivery-input').data['answered']
        assert db.get(Job,job.id).status=='done'
    assert get_claim('send') is None

def test_manual_echo_waits_for_inflight_send_then_reconciles(monkeypatch):
    from app.store import enqueue
    with Session.begin() as db:
        lead=contact(db);send=message(db,lead,'Text','inflight');send.status='running';send.lease_until=time.time()+180
        echo=enqueue(db,'echo','manual_echo','',{'provider_id':'late-provider','phone':lead.phone})
        worker.process(db,echo);assert echo.status=='pending' and not lead.paused
        db.add(Record(id='sent:late-provider',kind='message',lead_id=lead.id,data={'direction':'out','text':'Text'}));db.flush()
        send.status='done';worker.process(db,echo);assert not lead.paused

def test_phone_reply_is_paused_and_preserved_without_fixed_delay(monkeypatch):
    from app.main import evolution_event
    monkeypatch.setenv('EVOLUTION_INSTANCE','scorus-test')
    with Session.begin() as db:
        lead=contact(db);inbound(db,lead.phone,'Consulta pendiente','before-human')
    evolution_event({'instance':'scorus-test','event':'MESSAGES_UPSERT','data':{'key':{'id':'human-phone','remoteJid':'34600900001@s.whatsapp.net','fromMe':True},'message':{'conversation':'Hola, soy Bernat. Lo reviso contigo.'}}})
    assert worker.once('maintenance')
    with Session() as db:
        assert db.get(Lead,lead.id).paused
        assert db.get(Record,'manual-message:human-phone').data['human']
        assert db.get(Record,'inbound:before-human').data['answered']
        assert db.query(Job).filter_by(kind='respond',status='pending').count()==0

def test_paused_global_control_keeps_inbound_but_prevents_actions():
    with Session.begin() as db:
        lead=contact(db);cfg=db.get(Config,'settings');cfg.data={**cfg.data,'pacing':{**pacing(db),'automatic_paused':True}}
        inbound(db,lead.phone,'Hola','paused-input')
        assert db.get(Record,'inbound:paused-input')
    due_all('respond');assert get_claim('respond') is None

def test_timing_bounds_and_configuration_limits():
    assert response_target(10,True)==21 and response_target(10000,True)==40
    assert response_target(10,False)==11 and response_target(10000,False)==25
    for setting in ({'inference_limit':3},{'global_gap':0},{'enabled':False},{'hour_limit':121}):
        with pytest.raises(RuleError):validate_pacing(setting)

def test_disconnect_keeps_send_pending_until_stable_connection(monkeypatch):
    monkeypatch.setattr(worker,'send_whatsapp',lambda *args:pytest.fail('Disconnected or unstable connection'))
    with Session.begin() as db:
        lead=contact(db);job=message(db,lead,'Pendiente','disconnect')
        runtime=delivery(db);runtime.data={**runtime.data,'connection':'close','connected_since':0}
    worker.execute_claim(*get_claim('send'))
    with Session.begin() as db:
        job=db.get(Job,job.id);assert job.status=='pending'
        job.due=time.time()-1;runtime=delivery(db);runtime.data={**runtime.data,'connection':'open','connected_since':time.time()}
    worker.execute_claim(*get_claim('send'))
    with Session.begin() as db:assert db.get(Job,job.id).status=='pending'

def test_ambiguous_http_send_is_reviewed_not_retried(monkeypatch):
    import httpx
    monkeypatch.setattr(worker,'presence',lambda *args:None)
    def failed(*args):raise httpx.ReadTimeout('Private provider detail omitted')
    monkeypatch.setattr(worker,'send_whatsapp',failed)
    with Session.begin() as db:
        lead=contact(db);job=message(db,lead,'Texto','timeout');job.data={**job.data,'phase':'typing'}
    worker.execute_claim(*get_claim('send'))
    with Session.begin() as db:
        assert db.get(Job,job.id).status=='review'
        assert len(delivery(db).data['attempts'])==1
    assert get_claim('send') is None

def test_receipts_connections_calls_and_audio_share_backend(monkeypatch):
    from app.main import evolution_event
    monkeypatch.setenv('EVOLUTION_INSTANCE','scorus-test')
    monkeypatch.delenv('STT_URL',raising=False);monkeypatch.delenv('STT_API_KEY',raising=False)
    with Session.begin() as db:
        lead=contact(db)
        db.add(Record(id='sent:status-id',kind='message',lead_id=lead.id,data={'direction':'out','text':'Texto'}))
    evolution_event({'instance':'scorus-test','event':'MESSAGES_UPDATE','data':{'key':{'id':'status-id'},'update':{'status':4}}})
    with Session() as db:assert db.get(Record,'sent:status-id').data['delivery_status']==4
    evolution_event({'instance':'scorus-test','event':'CONNECTION_UPDATE','data':{'state':'close'}})
    with Session() as db:assert delivery(db).data['connection']=='close'
    for i in range(2):evolution_event({'instance':'scorus-test','event':'CALL','data':{'from':'34600900001@s.whatsapp.net','status':'offer'}})
    with Session() as db:assert db.query(Record).filter_by(kind='call').count()==1
    evolution_event({'instance':'scorus-test','event':'MESSAGES_UPSERT','data':{'key':{'id':'audio-test','remoteJid':'34600900001@s.whatsapp.net','fromMe':False},'message':{'audioMessage':{'mimetype':'audio/ogg'}}}})
    with Session.begin() as db:
        job=db.query(Job).filter_by(kind='audio',status='pending').one();worker.process(db,job)
        assert 'no inventes' in db.get(Record,'inbound:audio-test').data['text']
        assert db.query(Job).filter_by(kind='respond',status='pending').count()==1

def test_global_pause_preserves_queued_reply_and_human_can_respond():
    with Session.begin() as db:
        lead=contact(db);bot=message(db,lead,'Bot','paused-bot');human=message(db,lead,'Persona','paused-human');human.data={**human.data,'human':True}
        cfg=db.get(Config,'settings');cfg.data={**cfg.data,'pacing':{**pacing(db),'automatic_paused':True}}
    claimed=get_claim('send');assert claimed[0]==human.id
    with Session() as db:assert db.get(Job,bot.id).status=='pending'

def test_provider_completion_time_preserves_gap_after_slow_send(monkeypatch):
    now=time.time()
    monkeypatch.setattr(worker.time,'time',lambda:now+25)
    with Session.begin() as db:
        runtime=delivery(db);runtime.data={**runtime.data,'attempts':[now],'last_send':now}
        worker.finish_delivery(db,'lead',now)
        assert budget_due(delivery(db).data,pacing(db),'other',now+25)==now+35

def test_confirmed_mcp_booking_is_replayed_without_second_provider_call(monkeypatch):
    from app import main
    calls=[]
    monkeypatch.setattr(main,'book',lambda *args:calls.append(1) or {'status':'booked','start':'chosen'})
    with Session.begin() as db:
        lead=contact(db);inbound(db,lead.phone,'Reserva elegida','operation-input')
    due_all('respond');job_id,owner=get_claim('respond')
    with Session() as db:scope={'lead':lead.id,'turn':job_id,'owner':owner,'generation':db.get(Lead,lead.id).generation}
    body={'id':1,'method':'tools/call','params':{'name':'book_call','arguments':{'kind':'valuation','start_time':'chosen','timezone':'Europe/Madrid','email':'test@example.com'}}}
    for i in range(2):assert 'isError":false' in mcp_rpc(scope,body).body.decode()
    assert len(calls)==1

def test_uncertain_mcp_operation_stays_pending_and_never_reexecutes(monkeypatch):
    from app import main
    import httpx
    calls=[]
    def failed(*args):calls.append(1);raise httpx.ReadTimeout('No confirmed outcome')
    monkeypatch.setattr(main,'checkout',failed)
    with Session.begin() as db:
        lead=contact(db);inbound(db,lead.phone,'Pago elegido','uncertain-input')
    due_all('respond');job_id,owner=get_claim('respond')
    with Session() as db:scope={'lead':lead.id,'turn':job_id,'owner':owner,'generation':db.get(Lead,lead.id).generation}
    body={'id':1,'method':'tools/call','params':{'name':'prepare_checkout','arguments':{'payment_mode':'full'}}}
    assert 'isError":true' in mcp_rpc(scope,body).body.decode()
    with Session.begin() as db:
        current=db.get(Lead,lead.id);current.paused=False;scope['generation']=current.generation
    assert 'isError":true' in mcp_rpc(scope,body).body.decode()
    with Session() as db:assert db.query(Record).filter_by(kind='operation').one().data['status']=='pending'
    assert len(calls)==1

@pytest.mark.skipif(engine.dialect.name!='postgresql',reason='Requires real PostgreSQL concurrency')
def test_ten_simultaneous_clients_have_two_inferences_and_one_sender(monkeypatch):
    monkeypatch.setenv('HERMES_BRIDGE_KEY','test');monkeypatch.setattr(worker,'mark_read',lambda *args:None)
    barrier=threading.Barrier(2);lock=threading.Lock();active=0;peak=0;seen=[]
    def model(*args,**kwargs):
        nonlocal active,peak
        scope=token_scope(kwargs['json']['mcp_token'],'test-scoped-secret')
        with lock:active+=1;peak=max(peak,active);seen.append((scope['lead'],kwargs['json']['prompt']))
        barrier.wait(timeout=10)
        with lock:active-=1
        return SimpleNamespace(raise_for_status=lambda:None,json=lambda:{'reply':'Respuesta para '+scope['lead'],'usage':{}})
    monkeypatch.setattr(worker.httpx,'post',model)
    def receive(index):
        with Session.begin() as db:
            lead=contact(db,'+346009001'+str(index).zfill(2));inbound(db,lead.phone,'Consulta cliente '+str(index),'parallel-'+str(index))
            return lead.id
    with ThreadPoolExecutor(10) as pool:ids=list(pool.map(receive,range(10)))
    due_all('respond')
    with ThreadPoolExecutor(2) as pool:
        for i in range(5):
            a=get_claim('respond');b=get_claim('respond');assert a and b and get_claim('respond') is None
            fa=pool.submit(worker.execute_claim,*a);fb=pool.submit(worker.execute_claim,*b);fa.result(15);fb.result(15)
    assert peak==2 and len({x[0] for x in seen})==10
    assert {x[0] for x in seen}==set(ids)
    due_all('send');first=get_claim('send');assert first and get_claim('send') is None

@pytest.mark.skipif(engine.dialect.name!='postgresql',reason='Requires advisory locks')
def test_concurrent_first_messages_same_phone_are_both_persisted():
    with Session.begin() as db:
        cfg=db.get(Config,'settings');cfg.data={**cfg.data,'launch_approved':True}
    def receive(index):
        with Session.begin() as db:inbound(db,'+34600900999','Texto '+str(index),'same-phone-'+str(index))
    with ThreadPoolExecutor(2) as pool:list(pool.map(receive,range(2)))
    with Session.begin() as db:
        assert db.query(Lead).filter_by(phone='+34600900999').count()==1
        assert db.query(Record).filter(Record.id.in_(['inbound:same-phone-0','inbound:same-phone-1'])).count()==2
        assert db.query(Job).filter_by(kind='respond',status='pending').count()==1
