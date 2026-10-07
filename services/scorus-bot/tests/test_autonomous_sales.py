import json
import time
from types import SimpleNamespace
import pytest
from test_workflows import clean, make_lead
from app import main, providers, worker
from app.domain import PROGRAMS, RuleError, paid_contract, prepare_contract
from app.main import inbound, mcp_rpc
from app.sales import flag_health, offer_summary, request_review
from app.store import Config, Job, Lead, Record, Session


def autonomous(db, monkeypatch):
    monkeypatch.setenv('STRIPE_SECRET_KEY', 'sk_test_fake')
    cfg=db.get(Config,'settings');cfg.data={**cfg.data,'sales_mode':'autonomous'}
    lead=make_lead(db)
    lead.profile={**lead.profile,'experience':'6 días por semana','days':'6','duration':'45','location':'gym','timing':'ahora'}
    return lead


@pytest.mark.parametrize('program',list(PROGRAMS))
@pytest.mark.parametrize('payment_mode',['full','installments'])
def test_autonomous_sale_all_terms_need_customer_acceptance_but_no_trainer_approval(program,payment_mode,monkeypatch):
    with Session.begin() as db:
        lead=autonomous(db,monkeypatch)
        # Model claiming confirmation in its first call cannot create a payment.
        result,offer=offer_summary(db,lead,program,payment_mode,True,'turn-offer')
        assert result['status']=='needs_confirmation'
        assert db.query(Record).filter_by(kind='contract').count()==0
        offer.data={**offer.data,'delivered_at':time.time()-5}
        db.add(Record(id='acceptance',kind='message',lead_id=lead.id,data={'direction':'in','text':'Sí, quiero contratar esta oferta'}));db.flush()
        result,_=offer_summary(db,lead,program,payment_mode,True,'turn-accept')
        assert result is None and not lead.paused
        assert lead.profile['approved_by']=='autonomous_sales'
        assert db.query(Record).filter_by(kind='booking').count()==0
        contract=prepare_contract(db,lead,payment_mode)
        assert contract.data['price']['total_cents']==PROGRAMS[program]['total_cents']
        contract.data={**contract.data,'checkout_id':'cs_verified'}
        amount=PROGRAMS[program]['total_cents' if payment_mode=='full' else 'monthly_cents']
        paid_contract(db,contract,{'id':'cs_verified','payment_status':'paid','amount_total':amount,'currency':'eur'})
        assert lead.state=='paid' and contract.data['activated_at'] is None


@pytest.mark.parametrize('answer',['¿Cuánto cuesta?','Sí, pero con descuento','No quiero contratar'])
def test_model_cannot_claim_customer_accepted_on_a_price_question_or_conditional_answer(answer,monkeypatch):
    with Session.begin() as db:
        lead=autonomous(db,monkeypatch)
        _,offer=offer_summary(db,lead,'core-6','installments',False,'quote')
        offer.data={**offer.data,'delivered_at':time.time()-5}
        db.add(Record(kind='message',lead_id=lead.id,data={'direction':'in','text':answer}));db.flush()
        with pytest.raises(RuleError):offer_summary(db,lead,'core-6','installments',True,'attempt')
        assert lead.state!='approved' and not lead.paused
        assert db.query(Record).filter_by(kind='contract').count()==0


def test_unsent_offer_or_changed_terms_need_a_fresh_quote(monkeypatch):
    with Session.begin() as db:
        lead=autonomous(db,monkeypatch)
        _,old=offer_summary(db,lead,'core-6','full',False,'old')
        db.add(Record(kind='message',lead_id=lead.id,data={'direction':'in','text':'Sí'}));db.flush()
        result,_=offer_summary(db,lead,'core-6','full',True,'new')
        assert result['status']=='needs_confirmation'
        old.data={**old.data,'delivered_at':time.time()-5}
        cfg=db.get(Config,'settings');cfg.data={**cfg.data,'terms_version':'changed'}
        result,_=offer_summary(db,lead,'core-6','full',True,'changed')
        assert result['status']=='needs_confirmation'


def test_bernat_regression_general_training_uncertainty_is_commercial_not_handoff(monkeypatch):
    with Session.begin() as db:
        lead=autonomous(db,monkeypatch)
        inbound(db,lead.phone,'Entreno si 6 días por semana pero no sé si lo hago bien o no y cual servicio vuestro sería para mí lo óptimo','bernat-regression')
        db.flush()
        result=request_review(db,lead,'professional','Dudas de técnica y encaje')
        assert result['status']=='within_commercial_scope' and not lead.paused
        assert db.query(Job).filter_by(kind='respond',status='pending').count()==1
        assert not db.query(Record).filter_by(kind='task',lead_id=lead.id).count()


@pytest.mark.parametrize('text',['No tengo lesiones ni dolor, ¿qué incluye nutrición?','No tengo diabetes, ¿qué incluye Core?','¿Tenéis política de devoluciones?','Tienes precios !?','¿Cómo hago para contratar?'])
def test_product_questions_do_not_trigger_keyword_handoffs(text,monkeypatch):
    with Session.begin() as db:
        lead=autonomous(db,monkeypatch)
        inbound(db,lead.phone,text,'faq');db.flush()
        assert not lead.paused and not lead.profile.get('professional_review_required')
        assert db.query(Job).filter_by(kind='respond',status='pending').count()==1
        assert not request_review(db,lead,'professional','Consulta general')['handed_off']


@pytest.mark.parametrize('text,category',[
    ('Me duele la rodilla, ¿qué ejercicios puedo hacer?', 'professional'),
    ('Quiero un reembolso del pago', 'billing_dispute'),
    ('Quiero hablar directamente con Bernat', 'customer_request'),
    ('Necesito pausar mi contrato', 'contract_exception'),
])
def test_real_exceptions_and_explicit_person_requests_still_pause(text,category,monkeypatch):
    with Session.begin() as db:
        lead=autonomous(db,monkeypatch)
        inbound(db,lead.phone,text,'exception');db.flush()
        assert request_review(db,lead,category,'Caso fuera de atribuciones')['handed_off']
        assert lead.paused


def test_declared_health_concern_blocks_checkout_but_keeps_product_conversation_open(monkeypatch):
    with Session.begin() as db:
        lead=autonomous(db,monkeypatch)
        flag_health(db,lead,'No tengo lesiones, pero estoy embarazada')
        assert lead.profile['professional_review_required'] and not lead.paused
        with pytest.raises(RuleError):offer_summary(db,lead,'core-6','full',False,'risk')
        assert db.query(Record).filter_by(kind='contract').count()==0


def test_unconfigured_payments_or_unapproved_tariff_do_not_pause_or_reserve_capacity(monkeypatch):
    with Session.begin() as db:
        lead=autonomous(db,monkeypatch)
        monkeypatch.delenv('STRIPE_SECRET_KEY')
        result,_=offer_summary(db,lead,'core-6','full',True,'setup')
        assert result['status']=='configuration_pending'
        assert not lead.paused and db.query(Record).filter_by(kind='contract').count()==0
        assert not request_review(db,lead,'technical_incident','Falta conectar Stripe')['handed_off']
        cfg=db.get(Config,'settings');cfg.data={**cfg.data,'catalog_approved':['core-6']}
        result,_=offer_summary(db,lead,'elite-6','full',True,'tariff')
        assert result['status']=='tariff_pending' and not lead.paused


def test_mcp_pending_calendar_keeps_sales_open_and_profile_cannot_change_authority(monkeypatch):
    from app.queueing import claim
    with Session.begin() as db:
        lead=autonomous(db,monkeypatch);inbound(db,lead.phone,'Quiero ver horarios','slots');db.flush()
        for j in db.query(Job).filter_by(kind='respond',status='pending'):j.due=time.time()-1
    with Session.begin() as db:job_id,owner=claim(db,'respond')
    with Session() as db:scope={'lead':lead.id,'turn':job_id,'owner':owner,'generation':db.get(Lead,lead.id).generation}
    monkeypatch.delenv('CALENDLY_TOKEN',raising=False)
    def call(name,args):
        body={'id':1,'method':'tools/call','params':{'name':name,'arguments':args}}
        return json.loads(mcp_rpc(scope,body).body)['result']
    result=call('get_slots',{'kind':'valuation'})
    assert not result['isError'] and 'configuration_pending' in result['content'][0]['text']
    assert call('update_profile',{'answers':{'approved_by':'bernat'}})['isError']
    assert not call('update_profile',{'answers':{'name':'Synthetic Tester','email':'synthetic@example.org'}})['isError']
    with Session() as db:
        lead=db.get(Lead,lead.id)
        assert not lead.paused and lead.name=='Synthetic Tester'


def test_worker_sends_canonical_offer_and_marks_it_delivered_only_on_provider_acceptance(monkeypatch):
    from app.queueing import claim, delivery
    monkeypatch.setenv('HERMES_BRIDGE_KEY','fake')
    monkeypatch.setattr(worker,'mark_read',lambda *args:None)
    with Session.begin() as db:
        lead=autonomous(db,monkeypatch);inbound(db,lead.phone,'Quiero contratar','quote-request');db.flush()
        for j in db.query(Job).filter_by(lead_id=lead.id):j.status='cancelled'
        job=Job(kind='respond',key='quote-job',lead_id=lead.id,data={'generation':lead.generation},due=time.time()-1);db.add(job);db.flush()
        job_id=job.id
    def model(*args,**kwargs):
        with Session.begin() as db:offer_summary(db,db.get(Lead,lead.id),'core-6','installments',False,job_id)
        return SimpleNamespace(raise_for_status=lambda:None,json=lambda:{'reply':'Wrong model price €1','usage':{}})
    monkeypatch.setattr(worker.httpx,'post',model)
    with Session.begin() as db:job_id,owner=claim(db,'respond')
    worker.execute_claim(job_id,owner)
    with Session.begin() as db:
        out=db.query(Job).filter_by(kind='send',status='pending').one()
        assert '1182 €' in out.data['text'] and '6 cuotas mensuales de 197 €' in out.data['text']
        assert not db.query(Record).filter_by(kind='sales_offer').one().data['delivered_at']
        cfg=db.get(Config,'settings');cfg.data={**cfg.data,'pacing':{**cfg.data['pacing'],'typing':False}}
        runtime=delivery(db);runtime.data={**runtime.data,'connection':'open','connected_since':time.time()-60}
        out.due=time.time()-1
    monkeypatch.setattr(worker,'send_whatsapp',lambda *args:{'key':{'id':'provider-quote'}})
    monkeypatch.setattr(worker,'clear_typing',lambda *args:None)
    with Session.begin() as db:out_id,owner=claim(db,'send')
    worker.execute_claim(out_id,owner)
    with Session() as db:
        offer=db.query(Record).filter_by(kind='sales_offer').one()
        assert offer.data['delivered_at'] and offer.data['sent_message_id']=='sent:provider-quote'


def test_mcp_autonomous_quote_acceptance_checkout_and_link_replay_are_idempotent(monkeypatch):
    from app.queueing import claim
    calls=[]
    def create(**kwargs):
        calls.append(kwargs)
        return SimpleNamespace(id='cs_mock',url='https://checkout.stripe.com/c/pay/mock')
    fake=SimpleNamespace(checkout=SimpleNamespace(Session=SimpleNamespace(create=create)))
    monkeypatch.setattr(providers,'stripe_client',lambda:fake)
    with Session.begin() as db:
        lead=autonomous(db,monkeypatch);inbound(db,lead.phone,'Quiero contratar Core de seis meses a cuotas','mcp-start');db.flush()
        for j in db.query(Job).filter_by(kind='respond',status='pending'):j.due=time.time()-1
    def scope_for_new_turn():
        with Session.begin() as db:job_id,owner=claim(db,'respond')
        with Session() as db:return {'lead':lead.id,'turn':job_id,'owner':owner,'generation':db.get(Lead,lead.id).generation}
    def checkout(scope):
        body={'id':1,'method':'tools/call','params':{'name':'prepare_checkout','arguments':{'program_id':'core-6','payment_mode':'installments','confirmed':True}}}
        result=json.loads(mcp_rpc(scope,body).body)['result']
        assert not result['isError'],result
        return json.loads(result['content'][0]['text'])
    first=scope_for_new_turn()
    assert checkout(first)['status']=='needs_confirmation' and not calls
    with Session.begin() as db:
        offer=db.query(Record).filter_by(kind='sales_offer').one();offer.data={**offer.data,'delivered_at':time.time()-.1}
        db.get(Job,first['turn']).status='done'
        lead=db.get(Lead,lead.id);inbound(db,lead.phone,'Sí, adelante','mcp-yes');db.flush()
        for j in db.query(Job).filter_by(kind='respond',status='pending'):j.due=time.time()-1
    second=scope_for_new_turn()
    for _ in range(2):assert checkout(second)['url']=='https://checkout.stripe.com/c/pay/mock'
    assert len(calls)==1
    assert calls[0]['line_items'][0]['price_data']['unit_amount']==19700
    with Session.begin() as db:
        assert db.query(Record).filter_by(kind='contract').count()==1
        assert db.query(Record).filter_by(kind='booking').count()==0
        db.get(Job,second['turn']).status='done'
        lead=db.get(Lead,lead.id);inbound(db,lead.phone,'¿Puedes repetirme el enlace?','mcp-link');db.flush()
        for j in db.query(Job).filter_by(kind='respond',status='pending'):j.due=time.time()-1
    assert checkout(scope_for_new_turn())['url']=='https://checkout.stripe.com/c/pay/mock'
    assert len(calls)==1


def test_calendar_query_transport_failure_does_not_pause_customer(monkeypatch):
    from app.queueing import claim
    import httpx
    with Session.begin() as db:
        lead=autonomous(db,monkeypatch);inbound(db,lead.phone,'Quiero una llamada opcional','calendar-failure');db.flush()
        cfg=db.get(Config,'settings');cfg.data={**cfg.data,'event_types':{'valuation':'test-event'},'published_blocks':[{'type':'valuation','start':1,'end':2}]}
        for j in db.query(Job).filter_by(kind='respond',status='pending'):j.due=time.time()-1
    monkeypatch.setenv('CALENDLY_TOKEN','fake')
    monkeypatch.setattr(main,'slots',lambda *args:(_ for _ in ()).throw(httpx.ReadTimeout('simulated')))
    with Session.begin() as db:job_id,owner=claim(db,'respond')
    with Session() as db:scope={'lead':lead.id,'turn':job_id,'owner':owner,'generation':db.get(Lead,lead.id).generation}
    body={'id':1,'method':'tools/call','params':{'name':'get_slots','arguments':{'kind':'valuation'}}}
    result=json.loads(mcp_rpc(scope,body).body)['result']
    assert result['isError'] and 'continúa' in result['content'][0]['text']
    with Session() as db:assert not db.get(Lead,lead.id).paused
