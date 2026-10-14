import time
from datetime import datetime
from zoneinfo import ZoneInfo
import pytest
from test_workflows import clean,make_lead
from test_autonomous_sales import autonomous
from app.store import Config,Job,Lead,Record,Session,init
from app.main import inbound
from app.sales import offer_summary,request_review
from app.domain import RuleError,within_sales_window,next_sales_window
from app.conversation import POLICY_VERSION,after_reply,context_for,ingest,intent,schedule_followup
from app.queueing import permitted


@pytest.mark.parametrize('choice',['Me gusta Core','¿Cuánto cuesta Core 6?'])
def test_exploring_or_choosing_is_not_authority_to_start_checkout(choice,monkeypatch):
    with Session.begin() as db:
        lead=autonomous(db,monkeypatch);inbound(db,lead.phone,choice,'explore');db.flush()
        result,offer=offer_summary(db,lead,'core-6','installments',True,'unknown-turn')
        assert result['status']=='information_only' and offer is None
        assert not db.query(Record).filter_by(kind='sales_offer').count()


def test_mixed_burst_prioritizes_deferral_even_when_last_message_is_yes(monkeypatch):
    with Session.begin() as db:
        lead=autonomous(db,monkeypatch)
        _,offer=offer_summary(db,lead,'core-6','installments',False,'quote')
        offer.data={**offer.data,'delivered_at':time.time()-1}
        texts=['Sí, quiero contratar','Mejor lo pienso y te digo','Sí']
        ids=[]
        for i,text in enumerate(texts):inbound(db,lead.phone,text,'mixed-'+str(i));ids.append('inbound:mixed-'+str(i))
        job=Job(key='mixed-turn',kind='respond',lead_id=lead.id,data={'message_ids':ids});db.add(job);db.flush()
        assert context_for(db,lead,job.id)['current_intent']=='deferred'
        result,_=offer_summary(db,lead,'core-6','installments',True,job.id)
        assert result['status']=='customer_deferred'
        assert not db.query(Record).filter_by(kind='contract').count()


@pytest.mark.parametrize('text',['Adelante, lo contratamos','Vamos a por ello','Let’s proceed'])
def test_explicit_advance_can_prepare_offer_but_not_skip_acceptance(text,monkeypatch):
    with Session.begin() as db:
        lead=autonomous(db,monkeypatch);inbound(db,lead.phone,text,'advance');db.flush()
        result,offer=offer_summary(db,lead,'core-6','installments',False,'first')
        assert result['status']=='needs_confirmation' and offer is not None
        assert not db.query(Record).filter_by(kind='contract').count()


@pytest.mark.parametrize('acceptance',['Sí, quiero Core 3','Sí, por 1 euro','Sí, quiero Elite'])
def test_another_program_or_amount_is_not_acceptance_of_existing_offer(acceptance,monkeypatch):
    with Session.begin() as db:
        lead=autonomous(db,monkeypatch)
        _,offer=offer_summary(db,lead,'core-6','installments',False,'quote')
        offer.data={**offer.data,'delivered_at':time.time()-1}
        inbound(db,lead.phone,acceptance,'conditional');db.flush()
        with pytest.raises(RuleError):offer_summary(db,lead,'core-6','installments',True,'accept')
        assert not db.query(Record).filter_by(kind='contract').count()


def test_no_thanks_gets_courtesy_response_without_reopening_sale():
    with Session.begin() as db:
        lead=make_lead(db);inbound(db,lead.phone,'No gracias','courtesy');db.flush()
        assert db.query(Job).filter_by(lead_id=lead.id,kind='respond',status='pending').count()==1
        assert lead.state=='not_interested' and not lead.paused
        assert lead.profile['commercial_context']['status']=='dormant'
        assert schedule_followup(db,lead) is None
        inbound(db,lead.phone,'¿Y Core incluye seguimiento?','return');db.flush()
        assert lead.state=='new' and lead.profile['commercial_context']['status']=='negotiating'


def test_courtesy_never_downgrades_paid_contract_state():
    with Session.begin() as db:
        lead=make_lead(db);lead.state='active'
        inbound(db,lead.phone,'No gracias','active-thanks');db.flush()
        assert lead.state=='active'
        assert context_for(db,lead,None)['customer']


def test_optout_still_stops_without_courtesy_or_followup():
    with Session.begin() as db:
        lead=make_lead(db);inbound(db,lead.phone,'baja','stop');db.flush()
        assert lead.opted_out
        assert not db.query(Job).filter_by(kind='respond',status='pending').count()


def test_price_exception_is_a_nonblocking_proposal_not_a_silent_handoff(monkeypatch):
    with Session.begin() as db:
        lead=autonomous(db,monkeypatch);inbound(db,lead.phone,'¿Puedes hacerme un descuento?','discount');db.flush()
        result=request_review(db,lead,'contract_exception','Cliente solicita descuento')
        assert result['status']=='proposal_pending' and not lead.paused
        task=db.query(Record).filter_by(kind='task',lead_id=lead.id).one()
        assert task.data['type']=='commercial_proposal' and task.data['current_price_unchanged']
        assert not db.query(Record).filter_by(kind='contract').count()


def test_followup_begins_only_after_an_offer_and_is_one_touch():
    now=datetime(2026,10,14,12,0,tzinfo=ZoneInfo('Europe/Madrid')).timestamp()
    with Session.begin() as db:
        lead=make_lead(db);lead.consent={**lead.consent,'marketing':True}
        assert not db.query(Job).filter_by(kind='followup').count() # Form receipt is not an offer.
        db.add(Record(kind='message',lead_id=lead.id,data={'direction':'in','text':'¿Cuál es el precio?'}));db.flush()
        reply=Job(key='reply',kind='send',lead_id=lead.id,data={'category':'conversation','generation':lead.generation,'text':'Core 6, 197 € al mes, 1182 € total.'})
        after_reply(db,lead,reply,now);db.flush()
        follow=db.query(Job).filter_by(kind='followup').one()
        assert follow.due==now+20*60 and follow.data['policy_version']==POLICY_VERSION
        assert schedule_followup(db,lead,now) is None
        follow.status='done'
        sent=Job(key='follow-sent',kind='send',lead_id=lead.id,data={'sales_followup':True,'generation':lead.generation})
        after_reply(db,lead,sent,now+1200)
        assert lead.followups==1 and lead.profile['commercial_context']['status']=='dormant'
        assert schedule_followup(db,lead,now+2000) is None
        inbound(db,lead.phone,'Me interesa Core','reactivate');db.flush()
        assert lead.followups==0


def test_no_promotion_without_consent_but_explicit_requested_return_can_be_scheduled():
    now=datetime(2026,10,14,12,0,tzinfo=ZoneInfo('Europe/Madrid')).timestamp()
    with Session.begin() as db:
        lead=make_lead(db)
        assert schedule_followup(db,lead,now) is None
        ingest(lead,'Escríbeme mañana a las 11',now)
        expected=datetime(2026,10,15,11,0,tzinfo=ZoneInfo('Europe/Madrid')).timestamp()
        assert lead.profile['commercial_context']['defer_until']==expected
        job=schedule_followup(db,lead,now,'requested',expected,True)
        assert job and job.due==expected and job.data['customer_requested']


def test_thinking_does_not_schedule_an_immediate_nudge():
    with Session.begin() as db:
        lead=make_lead(db);lead.consent={**lead.consent,'marketing':True}
        ingest(lead,'Lo pienso y te digo')
        assert schedule_followup(db,lead) is None


def test_uncertain_proactive_delivery_cannot_create_another_followup():
    with Session.begin() as db:
        lead=make_lead(db);lead.consent={**lead.consent,'marketing':True}
        db.add(Job(key='uncertain',kind='send',lead_id=lead.id,status='review',data={'sales_followup':True}));db.flush()
        assert schedule_followup(db,lead) is None


def test_language_follows_text_and_switches_back_from_english():
    with Session.begin() as db:
        lead=make_lead(db)
        ingest(lead,'Hello, what is the price?');assert lead.language=='en'
        ingest(lead,'Hola, quiero saber el precio');assert lead.language=='es'
        ingest(lead,'ok');assert lead.language=='es'
        ingest(lead,'Szia, szeretnék edzést');assert lead.language=='hu'


def test_client_timezone_and_daylight_saving_for_one_touch_window():
    stamp=datetime(2026,10,14,20,20,tzinfo=ZoneInfo('Europe/London')).timestamp()
    assert within_sales_window(stamp,'Europe/London')
    assert not within_sales_window(stamp,'Europe/Madrid')
    for day in ('2026-03-29','2026-10-25'):
        stamp=datetime.fromisoformat(day+'T08:00:00').replace(tzinfo=ZoneInfo('Europe/London')).timestamp()
        future=next_sales_window(stamp,'Europe/London')
        assert datetime.fromtimestamp(future,ZoneInfo('Europe/London')).hour==10


def test_legacy_four_touch_jobs_cancel_without_retroactive_rescheduling():
    with Session.begin() as db:
        lead=make_lead(db)
        db.add(Job(key='legacy',kind='followup',lead_id=lead.id,data={'index':4}))
        db.add(Job(key='current',kind='followup',lead_id=lead.id,data={'policy_version':POLICY_VERSION}))
    init()
    with Session() as db:
        assert db.query(Job).filter_by(key='legacy').one().status=='cancelled'
        assert db.query(Job).filter_by(key='current').one().status=='pending'


def test_payment_reminder_is_transactional_and_not_repeated(monkeypatch):
    from app import worker
    from app.queueing import claim,delivery
    now=datetime(2026,10,14,12,0,tzinfo=ZoneInfo('Europe/Madrid')).timestamp()
    monkeypatch.setattr(worker.time,'time',lambda:now)
    monkeypatch.setattr(worker,'send_whatsapp',lambda *args:{'key':{'id':'reminder-provider'}})
    monkeypatch.setattr(worker,'clear_typing',lambda *args:None)
    with Session.begin() as db:
        lead=make_lead(db)
        for job in db.query(Job):job.status='cancelled'
        contract=Record(kind='contract',lead_id=lead.id,data={'status':'checkout','hold_until':now+7200});db.add(contract);db.flush()
        reminder=Job(key='hold-test',kind='hold_reminder',lead_id=lead.id,data={'contract_id':contract.id})
        worker.process(db,reminder);db.flush()
        sent=db.query(Job).filter_by(kind='send',status='pending').one()
        assert sent.data['category']=='transactional' and not sent.data['commercial']
        assert permitted(db,sent,lead)
        runtime=delivery(db);runtime.data={**runtime.data,'connection':'open','connected_since':now-60}
    with Session.begin() as db:identifier,owner=claim(db,'send',now)
    worker.execute_claim(identifier,owner)
    with Session.begin() as db:
        contract=db.get(Record,contract.id);lead=db.get(Lead,lead.id)
        assert contract.data['reminders_sent']==1
        worker.process(db,Job(key='second',kind='hold_reminder',lead_id=lead.id,data={'contract_id':contract.id}))
        assert not db.query(Job).filter_by(kind='send',status='pending').count()
