import time
import pytest
from test_workflows import clean
from test_pacing import contact
from app import worker
from app.main import evolution_event, inbound
from app.store import Session,Lead,Job,Record
from app.queueing import delivery
from app.evolution_events import message_timestamp,phone_event,phone_origin


def outgoing(identifier='phone-message', timestamp=None, **metadata):
    data={'key':{'id':identifier,'remoteJid':'34600900001@s.whatsapp.net','fromMe':True},
          'message':{'conversation':'Hola'},'source':'android',**metadata}
    if timestamp is not None:data['messageTimestamp']=timestamp
    return {'instance':'scorus-test','event':'MESSAGES_UPSERT','data':data}


@pytest.mark.parametrize('timestamp,metadata,origin',[
    (lambda now:now-86400,{},'history'),
    (lambda now:now-120,{},'history'),  # Before this connection, although still recent.
    (lambda now:now,{'type':'append'},'history'),
    (lambda now:now,{'source':'api'},'api_echo'),
    (lambda now:None,{},'unverified'),
    (lambda now:'not-a-date',{},'unverified'),
    (lambda now:now+3600,{},'unverified'),
])
def test_sync_and_unverified_phone_events_do_not_pause_or_consume_customer_question(monkeypatch,timestamp,metadata,origin):
    monkeypatch.setenv('EVOLUTION_INSTANCE','scorus-test')
    with Session.begin() as db:
        lead=contact(db);inbound(db,lead.phone,'¿Cómo funciona Core?','live-customer')
        generation=lead.generation
    event=outgoing(timestamp=timestamp(time.time()),**metadata)
    for _ in range(2):evolution_event(event)
    assert worker.once('maintenance')
    with Session() as db:
        lead=db.get(Lead,lead.id)
        assert not lead.paused and lead.generation==generation
        assert not db.get(Record,'inbound:live-customer').data['answered']
        assert db.query(Job).filter_by(kind='respond',status='pending').count()==1
        assert db.get(Record,'phone-echo:phone-message').data['origin']==origin
        assert not db.get(Record,'manual-message:phone-message')
        assert not db.query(Record).filter_by(kind='task',lead_id=lead.id).count()
        assert db.query(Job).filter_by(key='manual:phone-message').count()==1


def test_known_provider_echo_is_not_a_manual_phone_intervention(monkeypatch):
    monkeypatch.setenv('EVOLUTION_INSTANCE','scorus-test')
    with Session.begin() as db:
        lead=contact(db)
        db.add(Record(id='sent:accepted-echo',kind='message',lead_id=lead.id,data={'direction':'out','text':'Hola'}))
    evolution_event(outgoing('accepted-echo',time.time()))
    with Session() as db:
        assert not db.get(Lead,lead.id).paused
        assert not db.query(Job).filter_by(kind='manual_echo').count()


def test_fresh_manual_job_from_previous_connection_cannot_take_over_new_connection(monkeypatch):
    monkeypatch.setenv('EVOLUTION_INSTANCE','scorus-test')
    with Session.begin() as db:lead=contact(db)
    evolution_event(outgoing(timestamp=time.time()))
    with Session.begin() as db:
        runtime=delivery(db);runtime.data={**runtime.data,'connected_since':time.time()}
    assert worker.once('maintenance')
    with Session() as db:
        assert not db.get(Lead,lead.id).paused
        assert db.get(Record,'phone-echo:phone-message').data['origin']=='history'


def test_fresh_manual_message_does_not_mark_a_later_customer_reply_answered(monkeypatch):
    monkeypatch.setenv('EVOLUTION_INSTANCE','scorus-test')
    timestamp=time.time()-5
    with Session.begin() as db:
        lead=contact(db)
        db.add(Record(id='earlier-question',kind='message',lead_id=lead.id,created=timestamp-2,data={'direction':'in','text':'Antes','answered':False}))
        inbound(db,lead.phone,'Mi nueva pregunta','after-manual')
    evolution_event(outgoing(timestamp=timestamp))
    assert worker.once('maintenance')
    with Session() as db:
        assert db.get(Lead,lead.id).paused
        assert db.get(Record,'earlier-question').data['answered']
        assert not db.get(Record,'inbound:after-manual').data['answered']
        record=db.get(Record,'manual-message:phone-message')
        assert record.created==pytest.approx(timestamp)
        assert record.data['provider_timestamp']==timestamp


@pytest.mark.parametrize('value,expected',[
    (1792053221,1792053221),('1792053221',1792053221),
    (1792053221000,1792053221),({'low':1792053221,'high':0,'unsigned':True},1792053221),
    (True,None),(None,None),(float('nan'),None),(float('inf'),None),
    ({'low':'invalid'},None),(-1,None),('invalid',None),
])
def test_provider_timestamp_formats(value,expected):
    assert message_timestamp(value)==expected


def test_delayed_worker_uses_original_receipt_time_and_rejects_disconnected_evidence():
    now=time.time();runtime={'connection':'open','connected_since':now-60}
    evidence=phone_event(outgoing(timestamp=now)['data'],{},runtime,now)
    assert phone_origin(evidence,runtime)=='manual_live'
    evidence={**evidence,'connection_state':'close'}
    assert phone_origin(evidence,runtime)=='unverified'
