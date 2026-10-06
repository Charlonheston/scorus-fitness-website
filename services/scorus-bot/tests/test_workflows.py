import json
import os
import time
from pathlib import Path
import pytest

os.environ['DATABASE_URL']=os.getenv('SCORUS_TEST_DATABASE_URL','sqlite://')
if os.getenv('SCORUS_TEST_DATABASE_URL') and 'scorus_acceptance' not in os.environ['DATABASE_URL']:
    raise RuntimeError('Tests may only use the dedicated acceptance database')
if not os.getenv('CATALOG_PATH'):
    os.environ['CATALOG_PATH']=str(Path(__file__).resolve().parents[3]/'src/data/scorus-team.json')
os.environ['FORM_API_KEY']='test-form'
os.environ['MCP_SECRET']='test-scoped-secret'
from app.store import Base, Config, Job, Lead, Record, Session, engine, init
from app.domain import CATALOG, PROGRAMS, DAY, RuleError, activate, approve, cancel_sales, create_lead, handoff, next_sales_window, paid_contract, prepare_contract, scoped_token, token_lead, within_sales_window

@pytest.fixture(autouse=True)
def clean():
    Base.metadata.drop_all(engine);init()
    with Session.begin() as db:
        cfg=db.get(Config,'settings');cfg.data={**cfg.data,'mode':'production','public_form_enabled':True,'terms_url':'https://scorusfitness.com/es/condiciones','privacy_url':'https://scorusfitness.com/es/privacidad','terms_version':'test-1','billing_approved':True,'catalog_approved':list(PROGRAMS)}

def make_lead(db,number='+34600000001'):
    return create_lead(db,{'name':'Test Client','phone':number,'adult':True,'contact_consent':True,'marketing_consent':False,'consent_version':'2026-10-06.1','answers':{'goal':'muscle'},'attribution':{'utm_campaign':'test'}})

def valued(db,lead,program='core-6'):
    db.add(Record(kind='booking',lead_id=lead.id,data={'type':'valuation','status':'completed'}));db.flush();approve(db,lead,program,'bernat')

@pytest.mark.parametrize('program',list(PROGRAMS))
def test_full_lifecycle_and_exact_total(program):
    with Session.begin() as db:
        lead=make_lead(db);valued(db,lead,program);contract=prepare_contract(db,lead,'installments')
        assert contract.data['price']['monthly_cents']*contract.data['price']['months']==contract.data['price']['total_cents']
        contract.data={**contract.data,'checkout_id':'cs_test'}
        paid_contract(db,contract,{'id':'cs_test','payment_status':'paid','amount_total':PROGRAMS[program]['monthly_cents'],'currency':'eur'})
        assert lead.state=='paid' and contract.data['activated_at'] is None
        with pytest.raises(RuleError):activate(db,lead,'bernat')
        lead.profile={**lead.profile,'harbiz_access_confirmed':True,'onboarding_complete':True};activate(db,lead,'bernat')
        assert lead.state=='active' and contract.data['service_end']>contract.data['activated_at']

def test_no_checkout_without_valuation_or_approval():
    with Session.begin() as db:
        lead=make_lead(db)
        with pytest.raises(RuleError):approve(db,lead,'core-6','bernat')
        with pytest.raises(RuleError):prepare_contract(db,lead,'full')

def test_capacity_counts_holds_and_paid_clients():
    with Session.begin() as db:
        for i in range(10):
            lead=make_lead(db,'+346000000'+str(10+i));valued(db,lead);prepare_contract(db,lead,'full')
        lead=make_lead(db,'+34600000030');valued(db,lead)
        with pytest.raises(RuleError):prepare_contract(db,lead,'full')

def test_unconfirmed_price_cannot_sell():
    with Session.begin() as db:
        cfg=db.get(Config,'settings');cfg.data={**cfg.data,'catalog_approved':['core-6']}
        lead=make_lead(db);valued(db,lead,'elite-6')
        with pytest.raises(RuleError):prepare_contract(db,lead,'full')

def test_duplicate_form_does_not_overwrite_customer_or_repeat_welcome():
    with Session.begin() as db:
        lead=make_lead(db);lead.state='active';again=make_lead(db)
        assert lead.id==again.id and again.state=='active'
        assert db.query(Job).filter_by(key=f'lead:{lead.id}:welcome').count()==1

def test_handoff_and_inbound_cancel_followups():
    with Session.begin() as db:
        lead=make_lead(db);generation=lead.generation;handoff(db,lead,'Professional question')
        assert lead.paused and lead.generation>generation
        assert not db.query(Job).filter_by(lead_id=lead.id,kind='followup',status='pending').count()

def test_payment_screenshot_wrong_amount_pending_and_late_payment():
    with Session.begin() as db:
        lead=make_lead(db);valued(db,lead);contract=prepare_contract(db,lead,'full');contract.data={**contract.data,'checkout_id':'cs_test'}
        payload={'id':'cs_test','payment_status':'paid','amount_total':118200,'currency':'eur'}
        for invalid in ({**payload,'payment_status':'unpaid'},{**payload,'amount_total':19700},{**payload,'id':'fake'}):
            with pytest.raises(RuleError):paid_contract(db,contract,invalid)
        paid_contract(db,contract,payload,now=contract.data['hold_until']+1)
        assert contract.data['status']=='review' and lead.paused and lead.state!='paid'

def test_duplicate_paid_event_has_one_onboarding_task():
    with Session.begin() as db:
        lead=make_lead(db);valued(db,lead);contract=prepare_contract(db,lead,'full');contract.data={**contract.data,'checkout_id':'cs_test'}
        for i in range(2):paid_contract(db,contract,{'id':'cs_test','payment_status':'paid','amount_total':118200,'currency':'eur'})
        assert db.query(Record).filter_by(kind='task',lead_id=lead.id).count()==2

def test_scoped_tokens_cannot_change_lead_or_outlive_expiry():
    token=scoped_token('lead-a','secret');assert token_lead(token,'secret')=='lead-a'
    for bad in (token[:-1]+'x',scoped_token('lead-a','secret',expires=1)):
        with pytest.raises(RuleError):token_lead(bad,'secret')

def test_daylight_saving_sales_windows():
    from datetime import datetime
    from zoneinfo import ZoneInfo
    for day in ('2026-03-29','2026-10-25'):
        stamp=datetime.fromisoformat(day+'T08:00:00').replace(tzinfo=ZoneInfo('Europe/Madrid')).timestamp()
        next_time=next_sales_window(stamp)
        assert datetime.fromtimestamp(next_time,ZoneInfo('Europe/Madrid')).hour==10 and within_sales_window(next_time)

def test_inbound_dedup_stop_and_manual_takeover():
    from app.main import inbound
    with Session.begin() as db:
        lead=make_lead(db)
        inbound(db,lead.phone,'Hola','msg1');db.flush();inbound(db,lead.phone,'Hola','msg1')
        assert db.query(Job).filter_by(key='respond:msg1').count()==1
        inbound(db,lead.phone,'baja','msg2');assert lead.opted_out

def test_mcp_rejects_cross_client_args():
    from fastapi.testclient import TestClient
    from app.main import app
    # In-memory SQLite shared by the API thread.
    from sqlalchemy.pool import StaticPool
    from sqlalchemy import create_engine
    from unittest.mock import patch
    shared=create_engine('sqlite://',connect_args={'check_same_thread':False},poolclass=StaticPool)
    Base.metadata.create_all(shared)
    from sqlalchemy.orm import sessionmaker
    shared_session=sessionmaker(shared,expire_on_commit=False)
    with shared_session.begin() as db:
        db.add(Lead(id='a',name='A',phone='+34600000001',consent={'contact':True}))
        db.add(Lead(id='b',name='B',phone='+34600000002',consent={'contact':True}))
    with patch('app.main.Session',shared_session):
        client=TestClient(app)
        headers={'Authorization':'Bearer '+scoped_token('a','test-scoped-secret')}
        result=client.post('/mcp',headers=headers,json={'jsonrpc':'2.0','id':1,'method':'tools/call','params':{'name':'get_profile','arguments':{'lead_id':'b'}}})
        assert result.json()['result']['isError']
        result=client.post('/mcp',headers=headers,json={'jsonrpc':'2.0','id':2,'method':'tools/call','params':{'name':'get_profile','arguments':{}}})
        assert '"name": "A"' in result.json()['result']['content'][0]['text']

@pytest.mark.parametrize('program',list(PROGRAMS))
def test_stripe_schedule_finishes_at_exact_term(program,monkeypatch):
    from app import providers
    from datetime import datetime,timezone
    from dateutil.relativedelta import relativedelta
    from types import SimpleNamespace
    class Obj(dict):
        def __getattr__(self,key):return self[key]
    start=int(datetime(2026,1,31,tzinfo=timezone.utc).timestamp());captured={}
    sub=Obj(id='sub_test',schedule=None,items={'data':[{'price':{'id':'price_test'}}]})
    schedule=Obj(id='schedule_test',phases=[Obj(start_date=start)])
    def modify(identifier,**kwargs):captured.update(kwargs)
    fake=SimpleNamespace(Subscription=SimpleNamespace(retrieve=lambda identifier:sub),SubscriptionSchedule=SimpleNamespace(create=lambda **kwargs:schedule,modify=modify))
    monkeypatch.setattr(providers,'stripe_client',lambda:fake)
    with Session.begin() as db:
        lead=make_lead(db);valued(db,lead,program);contract=prepare_contract(db,lead,'installments');contract.data={**contract.data,'subscription':'sub_test'}
        providers.cap_installments(contract)
        expected=int((datetime.fromtimestamp(start,timezone.utc)+relativedelta(months=PROGRAMS[program]['months'])).timestamp())
        assert captured['end_behavior']=='cancel' and captured['phases'][0]['end_date']==expected
        assert contract.data['schedule_confirmed']

def test_slots_only_published_blocks_and_core_cannot_book_elite(monkeypatch):
    from app import providers
    from datetime import datetime,timezone
    start=time.time()+2*DAY
    iso=datetime.fromtimestamp(start,timezone.utc).isoformat()
    outside=datetime.fromtimestamp(start+DAY,timezone.utc).isoformat()
    monkeypatch.setattr(providers,'calendly',lambda *args,**kwargs:{'collection':[{'start_time':iso},{'start_time':outside}]})
    with Session.begin() as db:
        cfg=db.get(Config,'settings');cfg.data={**cfg.data,'event_types':{'valuation':'https://api.calendly.com/event_types/test'},'published_blocks':[{'type':'valuation','start':start-1,'end':start+3600}]}
        lead=make_lead(db);lead.profile={**lead.profile,'experience':'regular','days':'3','duration':'30-45','location':'gym','timing':'soon'}
        offered=providers.slots(db,lead,'valuation');assert len(offered)==1 and offered[0]['start_time']==iso
        with pytest.raises(RuleError):providers.slots(db,lead,'elite')

def test_stale_reply_and_restart_dont_resend(monkeypatch):
    from app import worker
    from app.store import enqueue
    with Session.begin() as db:
        lead=make_lead(db);job=enqueue(db,'old-reply','send',lead.id,{'text':'Old','guard_generation':True,'generation':lead.generation})
        cancel_sales(db,lead)
        monkeypatch.setattr(worker,'send_whatsapp',lambda *args:pytest.fail('Stale message must not be sent'))
        worker.process(db,job)

@pytest.mark.skipif(engine.dialect.name!='postgresql',reason='Requires PostgreSQL row locks')
def test_concurrent_reservations_never_oversell():
    from concurrent.futures import ThreadPoolExecutor
    def reserve(index):
        try:
            with Session.begin() as db:
                lead=make_lead(db,'+346001000'+str(index+10));valued(db,lead);prepare_contract(db,lead,'full')
            return True
        except RuleError:return False
    with ThreadPoolExecutor(max_workers=6) as pool:results=list(pool.map(reserve,range(12)))
    assert sum(results)==10

def test_renewal_never_overlaps_an_active_commitment():
    with Session.begin() as db:
        lead=make_lead(db);valued(db,lead);contract=prepare_contract(db,lead,'full')
        contract.data={**contract.data,'status':'active'};lead.state='active'
        with pytest.raises(RuleError):approve(db,lead,'core-6','bernat')
        lead.state='approved'
        with pytest.raises(RuleError):prepare_contract(db,lead,'full')
        contract.data={**contract.data,'status':'ended'};lead.state='ended'
        approve(db,lead,'core-6','bernat');renewal=prepare_contract(db,lead,'full')
        assert renewal.id!=contract.id

def test_call_rights_are_per_contract_and_end_with_service(monkeypatch):
    from app import providers
    from datetime import datetime,timezone
    start=time.time()+2*DAY
    iso=datetime.fromtimestamp(start,timezone.utc).isoformat()
    monkeypatch.setattr(providers,'calendly',lambda *args,**kwargs:{'collection':[{'start_time':iso}]})
    with Session.begin() as db:
        lead=make_lead(db);valued(db,lead,'elite-6');contract=prepare_contract(db,lead,'full')
        contract.data={**contract.data,'status':'active','activated_at':time.time(),'service_end':start+DAY};lead.state='active'
        db.add(Record(kind='booking',lead_id=lead.id,data={'type':'elite','cycle':0,'contract_id':'previous-contract','status':'completed'}));db.flush()
        cfg=db.get(Config,'settings');cfg.data={**cfg.data,'event_types':{'elite':'https://api.calendly.com/event_types/elite','group':'https://api.calendly.com/event_types/group'},'published_blocks':[{'type':kind,'start':start-1,'end':start+4000} for kind in ('elite','group')]}
        assert len(providers.slots(db,lead,'elite'))==1
        contract.data={**contract.data,'service_end':start+1800}
        assert providers.slots(db,lead,'group')==[]

def test_metrics_distinguish_unknown_cost_and_response_time():
    from app.metrics import snapshot
    with Session.begin() as db:
        lead=make_lead(db)
        db.add_all([Record(kind='message',lead_id=lead.id,created=100,data={'direction':'in','text':'Hello'}),Record(kind='message',lead_id=lead.id,created=160,data={'direction':'out','text':'Hello back'}),Record(kind='usage',lead_id=lead.id,data={'tokens':{'total_tokens':300,'cost_status':'unknown','estimated_cost_usd':0}})])
        db.flush();metrics=snapshot(db)
        assert metrics['response_seconds']==60 and metrics['model_tokens']==300
        assert metrics['estimated_model_cost_usd'] is None
