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
        assert len(jobs)==1 and len(set(jobs[0].data['media_ids']))==9
        assert all(j.status=='pending' and priority(j)==2 for j in jobs)
        assert gallery_status(db,lead)['pending']==9
        assert gallery_status(db,db.get(Lead,other.id))['pending']==0
        activate_gallery(db,lead,db.get(Job,reply.id))
        assert len(gallery_jobs(db,lead))==1
        # The next customer's question does not repeat or truncate a useful gallery.
        inbound(db,lead.phone,'¿Dónde está el gimnasio?','gym-following')
        assert all(permitted(db,j,lead) for j in jobs)
        turn=start_again(db,lead)
        assert prepare_gallery(db,lead,turn.id)['status']=='already_shared_or_queued'


def gallery_jobs(db,lead):
    return [j for j in db.query(Job).filter_by(kind='send',lead_id=lead.id) if j.data.get('media_id') or j.data.get('media_ids')]


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
        job=gallery_jobs(db,lead)[0];job.status='review'
        job.data={**job.data,'provider_id':'parent','accepted_media_ids':['gym-01']}
        status=gallery_status(db,lead)
        assert status['accepted']==1 and status['uncertain']==8
        inbound(db,lead.phone,'Mándame fotos del gimnasio','ask-again')
        turn=start_again(db,lead)
        assert prepare_gallery(db,lead,turn.id)['status']=='already_shared_or_queued'
        assert len(gallery_jobs(db,lead))==1


def test_media_delivery_uses_budget_and_records_photo_without_typing(monkeypatch):
    sent=[]
    monkeypatch.setattr(worker,'presence',lambda phone,status,*a:sent.append(status))
    monkeypatch.setattr(worker,'send_whatsapp',lambda db,lead,payload:{'key':{'id':'album-id'},'scorus_album':{'status':'accepted','total':9,'items':[{'media_id':v,'key':{'id':'photo-'+v}} for v in payload['media_ids']]}})
    with Session.begin() as db:
        lead=contact(db);turn,reply=stage(db,lead);activate_gallery(db,lead,reply);reply.status='done'
    worker.execute_claim(*get_claim('send'))
    with Session() as db:
        assert db.get(Record,'sent:album-id').data['media_ids']==[p['id'] for p in gallery()['photos']]
        assert db.get(Record,'sent:photo-gym-01').data['album_parent']=='album-id'
        assert db.query(Record).filter_by(kind='provider_message').count()==9
        assert gallery_status(db,db.get(Lead,lead.id))['accepted']==9
        assert len(delivery(db).data['attempts'])==1
        assert 'composing' not in sent
        assert len(gallery_jobs(db,db.get(Lead,lead.id)))==1


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


def test_album_uses_fixed_catalog_ids_and_persistent_provider_request(monkeypatch):
    monkeypatch.setenv('EVOLUTION_API_KEY','fake-key');monkeypatch.setenv('EVOLUTION_INSTANCE','scorus-test')
    monkeypatch.setenv('PRODUCTION_PHONE','+34600909999');monkeypatch.setenv('WHATSAPP_TRANSPORT','evolution')
    calls=[]
    def api(method,url,**kwargs):
        calls.append((method,url,kwargs))
        return [{'name':'scorus-test','connectionStatus':'open','ownerJid':'34600909999@s.whatsapp.net'}] if method=='GET' else {}
    monkeypatch.setattr(providers,'api',api)
    with Session.begin() as db:
        lead=contact(db);cfg=db.get(Config,'settings');cfg.data={**cfg.data,'launch_approved':True}
        payload={'text':'Scorus gym','media_ids':['gym-01','gym-02'],'album_request_id':'stable-request'}
        providers.send_whatsapp(db,lead,payload)
        body=calls[-1][2]['json']
        assert body['scorusAlbum']=={'requestId':'stable-request','mediaIds':['gym-01','gym-02']}
        assert body['media']==asset('gym-01')['url'] and calls[-1][2]['timeout']==120
        with pytest.raises(RuleError):providers.send_whatsapp(db,lead,{**payload,'media_ids':['gym-01','https://other.example/image.jpg']})
        monkeypatch.setenv('WHATSAPP_TRANSPORT','cloud')
        with pytest.raises(RuleError):providers.send_whatsapp(db,lead,payload)


def test_partial_album_preserves_provider_ids_and_never_retries(monkeypatch):
    monkeypatch.setattr(worker,'presence',lambda *a:None)
    monkeypatch.setattr(worker,'send_whatsapp',lambda *a:{'key':{'id':'partial-parent'},'scorus_album':{
        'status':'review','total':9,'items':[{'media_id':'gym-01','key':{'id':'partial-child'}}]}})
    with Session.begin() as db:
        lead=contact(db);turn,reply=stage(db,lead);activate_gallery(db,lead,reply);reply.status='done'
    worker.execute_claim(*get_claim('send'))
    with Session() as db:
        job=db.query(Job).filter_by(kind='send',status='review',lead_id=lead.id).one()
        assert job.data['accepted_media_ids']==['gym-01']
        assert db.get(Record,'sent:partial-child').data['album_parent']=='partial-parent'
        assert db.get(Record,'sent:partial-parent').data['delivery_status']=='review'
        assert gallery_status(db,db.get(Lead,lead.id))['uncertain']==8
    assert get_claim('send') is None


def test_album_echoes_and_receipts_are_not_human_takeovers(monkeypatch):
    from app.main import evolution_event
    monkeypatch.setenv('EVOLUTION_INSTANCE','scorus-test')
    with Session.begin() as db:
        lead=contact(db)
        db.add(Record(id='sent:album-child',kind='provider_message',lead_id=lead.id,data={'media_id':'gym-01','album_parent':'parent'}))
    evolution_event({'instance':'scorus-test','event':'MESSAGES_UPSERT','data':{'key':{'id':'album-child','remoteJid':lead.phone.lstrip('+')+'@s.whatsapp.net','fromMe':True},'messageTimestamp':time.time(),'source':'android','message':{'imageMessage':{'caption':''}}}})
    evolution_event({'instance':'scorus-test','event':'MESSAGES_UPDATE','data':{'key':{'id':'album-child'},'status':'READ'}})
    with Session() as db:
        assert not db.get(Lead,lead.id).paused
        assert not db.query(Job).filter_by(kind='manual_echo').count()
        assert db.get(Record,'sent:album-child').data['delivery_status']=='READ'


def test_completed_album_repeats_only_on_explicit_photo_request():
    with Session.begin() as db:
        lead=contact(db);turn,reply=stage(db,lead);activate_gallery(db,lead,reply)
        job=gallery_jobs(db,lead)[0];job.status='done';job.data={**job.data,'provider_id':'parent','accepted_media_ids':job.data['media_ids']}
        inbound(db,lead.phone,'¿Cuánto cuesta el bono presencial?','repeat-prices')
        turn=start_again(db,lead)
        assert prepare_gallery(db,lead,turn.id)['status']=='already_shared_or_queued'
        turn.status='done'
        inbound(db,lead.phone,'Mándame las fotos en galería','repeat-photos')
        turn=start_again(db,lead)
        assert prepare_gallery(db,lead,turn.id)['status']=='prepared'
        again=message(db,lead,'Te paso el álbum.','album-again');again.data={**again.data,'turn_id':turn.id}
        activate_gallery(db,lead,again)
        assert len(gallery_jobs(db,lead))==2
        assert gallery_status(db,lead)['pending']==9


def test_pending_legacy_images_migrate_without_replaying_delivered_photos():
    from app.media import migrate_pending_galleries
    with Session.begin() as db:
        lead=contact(db)
        for index in range(3):
            j=message(db,lead,'Gym','old-image-'+str(index))
            j.data={**j.data,'media_id':f'gym-0{index+1}','gallery_version':gallery()['version'],'expires_at':time.time()+3600}
            if index==0:j.status='done';j.data={**j.data,'provider_id':'old-accepted'}
        migrate_pending_galleries(db);db.flush();migrate_pending_galleries(db)
        pending=[j for j in gallery_jobs(db,lead) if j.status=='pending']
        assert len(pending)==1 and pending[0].data['media_ids']==['gym-02','gym-03']
