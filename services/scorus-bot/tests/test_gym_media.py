import json
import time
from types import SimpleNamespace
import pytest
from test_workflows import clean
from test_pacing import contact, due_all, get_claim
from app import providers, worker
from app.domain import DAY, RuleError, handoff, message
from app.main import inbound, mcp_rpc
from app.media import activate_gallery, asset, gallery, gallery_status, prepare_gallery
from app.queueing import delivery, permitted, priority
from app.store import Config, Job, Lead, Record, Session


def start(db,lead):
    inbound(db,lead.phone,'¿Qué cuesta entrenar en persona en Alicante?','gym-'+lead.id)
    db.flush()
    turn=db.query(Job).filter_by(kind='respond',lead_id=lead.id,status='pending').one()
    turn.status='running';turn.owner='media-test';turn.lease_until=time.time()+180
    turn.data={**turn.data,'message_ids':['inbound:gym-'+lead.id]}
    return turn


def stage(db,lead):
    turn=start(db,lead);prepare_gallery(db,lead,turn.id)
    reply=message(db,lead,'Bonos presenciales: 242 €, 344,85 € y 435,60 €. Te paso las fotos.','explain:'+turn.id)
    reply.data={**reply.data,'turn_id':turn.id,'guard_generation':True,'category':'conversation','phase':'typing'}
    return turn,reply


def test_gallery_starts_after_text_acceptance_and_is_persistent_and_private(monkeypatch):
    monkeypatch.setattr(worker,'send_whatsapp',lambda *a:{'key':{'id':'gym-explanation'}})
    monkeypatch.setattr(worker,'presence',lambda *a:None)
    with Session.begin() as db:
        lead=contact(db);other=contact(db,'+34600900002');turn,reply=stage(db,lead)
        assert not gallery_jobs(db,lead)
        assert gallery_status(db,other)['pending']==0
    worker.execute_claim(*get_claim('send'))
    with Session.begin() as db:
        lead=db.get(Lead,lead.id);jobs=gallery_jobs(db,lead)
        assert len(jobs)==9 and len({j.data['media_id'] for j in jobs})==9
        assert all(j.status=='pending' and priority(j)==2 for j in jobs)
        assert gallery_status(db,lead)['pending']==9
        assert gallery_status(db,db.get(Lead,other.id))['pending']==0
        activate_gallery(db,lead,db.get(Job,reply.id))
        assert len(gallery_jobs(db,lead))==9
        # The next customer's question does not repeat or truncate a useful gallery.
        inbound(db,lead.phone,'¿Dónde está el gimnasio?','gym-following')
        assert all(permitted(db,j,lead) for j in jobs)
        turn=start_again(db,lead)
        assert prepare_gallery(db,lead,turn.id)['status']=='already_shared_or_queued'


def gallery_jobs(db,lead):
    return [j for j in db.query(Job).filter_by(kind='send',lead_id=lead.id) if j.data.get('media_id')]


def start_again(db,lead):
    db.flush()
    turn=db.query(Job).filter_by(kind='respond',lead_id=lead.id,status='pending').first()
    if not turn:turn=start(db,lead)
    turn.status='running';turn.owner='media-test';turn.lease_until=time.time()+180
    return turn


@pytest.mark.parametrize('stop',['No me mandes fotos, solo precios','baja','No gracias','Lo pienso y te digo'])
def test_customer_can_stop_queued_gallery_without_unnecessary_handoff(stop):
    with Session.begin() as db:
        lead=contact(db);turn,reply=stage(db,lead);activate_gallery(db,lead,reply)
        inbound(db,lead.phone,stop,'stop-gallery')
        assert not lead.paused
        assert all(j.status=='cancelled' for j in gallery_jobs(db,lead))
        assert not any(permitted(db,j,lead) and j.status=='pending' for j in gallery_jobs(db,lead))
        if 'fotos' in stop:
            assert not lead.opted_out and lead.consent['contact']
            with pytest.raises(RuleError):prepare_gallery(db,lead,start_again(db,lead).id)


def test_takeover_expiry_and_global_pause_prevent_photos():
    with Session.begin() as db:
        lead=contact(db);turn,reply=stage(db,lead);activate_gallery(db,lead,reply)
        job=gallery_jobs(db,lead)[0];job.data={**job.data,'expires_at':time.time()-1}
        assert not permitted(db,job,lead)
        handoff(db,lead,'Atención humana',notify=False)
        assert all(j.status=='cancelled' for j in gallery_jobs(db,lead))
        assert all(not permitted(db,j,lead) for j in gallery_jobs(db,lead))


def test_mcp_gallery_requires_active_turn_and_rejects_other_recipients():
    with Session.begin() as db:
        lead=contact(db);turn=start(db,lead)
        scope={'lead':lead.id,'turn':turn.id,'owner':turn.owner,'generation':lead.generation}
    def call(arguments,scope):
        return json.loads(mcp_rpc(scope,{'id':1,'method':'tools/call','params':{'name':'share_gym_photos','arguments':arguments}}).body)['result']
    assert call({'phone':'+34600900002'},scope)['isError']
    assert call({}, {'lead':lead.id})['isError']
    assert not call({},scope)['isError']
    assert not call({},scope)['isError']
    with Session() as db:
        assert db.query(Record).filter_by(kind='media_request',lead_id=lead.id).count()==1
        assert not gallery_jobs(db,db.get(Lead,lead.id))


def test_customer_can_request_remaining_photos_after_declining():
    with Session.begin() as db:
        lead=contact(db);inbound(db,lead.phone,'No me envíes fotos','no-pictures')
        assert lead.profile['gym_photos_opt_out']
        inbound(db,lead.phone,'Ahora sí, mándame las fotos del gimnasio','yes-pictures')
        assert not lead.profile['gym_photos_opt_out']
        assert prepare_gallery(db,lead,start_again(db,lead).id)['status']=='prepared'


def test_cancelled_turn_cannot_activate_photos_or_call_tool():
    with Session.begin() as db:
        lead=contact(db);turn,reply=stage(db,lead)
        scope={'lead':lead.id,'turn':turn.id,'owner':turn.owner,'generation':lead.generation}
        inbound(db,lead.phone,'Me interesa solo online','change-direction')
        activate_gallery(db,lead,reply)
        assert not gallery_jobs(db,lead)
    result=mcp_rpc(scope,{'id':1,'method':'tools/call','params':{'name':'share_gym_photos','arguments':{}}})
    assert json.loads(result.body)['result']['isError']


def test_no_repetition_of_accepted_or_uncertain_photos():
    with Session.begin() as db:
        lead=contact(db);turn,reply=stage(db,lead);activate_gallery(db,lead,reply)
        jobs=gallery_jobs(db,lead)
        jobs[0].status='done';jobs[0].data={**jobs[0].data,'provider_id':'accepted-image'}
        jobs[1].status='review'
        for job in jobs[2:]:job.status='cancelled'
        inbound(db,lead.phone,'Mándame fotos del gimnasio','ask-again')
        turn=start_again(db,lead);prepare_gallery(db,lead,turn.id)
        again=message(db,lead,'Te paso las fotos restantes.','remaining');again.data={**again.data,'turn_id':turn.id}
        activate_gallery(db,lead,again)
        pending=[j for j in gallery_jobs(db,lead) if j.status=='pending']
        assert len(pending)==7
        assert jobs[0].data['media_id'] not in {j.data['media_id'] for j in pending}
        assert jobs[1].data['media_id'] not in {j.data['media_id'] for j in pending}


def test_media_delivery_uses_budget_and_records_photo_without_typing(monkeypatch):
    sent=[]
    monkeypatch.setattr(worker,'presence',lambda phone,status,*a:sent.append(status))
    monkeypatch.setattr(worker,'send_whatsapp',lambda db,lead,payload:{'key':{'id':'photo-id'}})
    with Session.begin() as db:
        lead=contact(db);turn,reply=stage(db,lead);activate_gallery(db,lead,reply);reply.status='done'
    worker.execute_claim(*get_claim('send'))
    with Session() as db:
        assert db.get(Record,'sent:photo-id').data['media_id']=='gym-01'
        assert len(delivery(db).data['attempts'])==1
        assert 'composing' not in sent
        assert len(gallery_jobs(db,db.get(Lead,lead.id)))==9


def test_photo_records_do_not_crowd_text_history_or_response_metrics(monkeypatch):
    captured=[]
    monkeypatch.setenv('HERMES_BRIDGE_KEY','test')
    monkeypatch.setattr(worker,'mark_read',lambda *a:None)
    def model(*a,**kw):
        captured.append(kw['json'])
        return SimpleNamespace(raise_for_status=lambda:None,json=lambda:{'reply':'Sí, el bono mensual de ocho sesiones es 242 €.'})
    monkeypatch.setattr(worker.httpx,'post',model)
    with Session.begin() as db:
        lead=contact(db)
        db.add(Record(kind='message',lead_id=lead.id,created=time.time()-20,data={'direction':'out','text':'Recuerda: ocho sesiones, 242 €.'}))
        for i in range(22):db.add(Record(kind='message',lead_id=lead.id,created=time.time()-10+i/100,data={'direction':'out','text':'Gym photo','media_id':'gym-01'}))
        inbound(db,lead.phone,'¿Ocho sesiones?','after-photos')
    due_all('respond');worker.execute_claim(*get_claim('respond'))
    assert captured[0]['history']==[{'role':'assistant','content':'Recuerda: ocho sesiones, 242 €.'}]
    from app.metrics import snapshot
    with Session() as db:assert snapshot(db)['response_samples']==0


def test_evolution_media_uses_only_approved_asset_and_own_phone(monkeypatch):
    monkeypatch.setenv('EVOLUTION_API_KEY','fake-key');monkeypatch.setenv('EVOLUTION_INSTANCE','scorus-test')
    monkeypatch.setenv('PRODUCTION_PHONE','+34600909999');monkeypatch.setenv('WHATSAPP_TRANSPORT','evolution')
    calls=[]
    def api(method,url,**kwargs):
        calls.append((method,url,kwargs))
        return [{'name':'scorus-test','connectionStatus':'open','ownerJid':'34600909999@s.whatsapp.net'}] if method=='GET' else {'key':{'id':'image'}}
    monkeypatch.setattr(providers,'api',api)
    with Session.begin() as db:
        lead=contact(db);cfg=db.get(Config,'settings');cfg.data={**cfg.data,'launch_approved':True}
        providers.send_whatsapp(db,lead,{'text':'Gym','media_id':'gym-01','url':'https://malicious.example/photo.jpg'})
        assert calls[-1][1].endswith('/message/sendMedia/scorus-test')
        body=calls[-1][2]['json'];assert body['media']==asset('gym-01')['url'] and body['mediatype']=='image'
        assert body['number']==lead.phone.lstrip('+') and body['delay']==0
        with pytest.raises(RuleError):providers.send_whatsapp(db,lead,{'text':'Other','media_id':'https://malicious.example/photo.jpg'})


def test_cloud_image_requires_open_service_window(monkeypatch):
    monkeypatch.setenv('WHATSAPP_TRANSPORT','cloud');monkeypatch.setenv('META_ACCESS_TOKEN','fake')
    calls=[];monkeypatch.setattr(providers,'api',lambda *a,**kw:calls.append(kw['json']) or {'messages':[{'id':'cloud-photo'}]})
    with Session.begin() as db:
        lead=contact(db);cfg=db.get(Config,'settings');cfg.data={**cfg.data,'launch_approved':True}
        providers.send_whatsapp(db,lead,{'text':'Gym','media_id':'gym-01'})
        assert calls[0]['type']=='image' and 'text' not in calls[0]
        lead.last_inbound=time.time()-DAY-1
        with pytest.raises(RuleError):providers.send_whatsapp(db,lead,{'text':'Gym','media_id':'gym-01'})
        assert len(calls)==1
