import json
import pytest
from test_workflows import clean,make_lead
from app.domain import CATALOG,PROGRAMS,RuleError
from app.main import TOOLS,mcp_rpc
from app.sales import offer_summary
from app.store import Session,Record


def test_published_services_are_separate_from_authorized_training_contracts():
    services=CATALOG['other_services']
    assert services['vat_included'] and services['currency']=='EUR'
    assert services['status']=='published_pending_trainer_confirmation'
    assert services['checkout_enabled'] is False
    assert services['in_person']['billing']=='monthly_session_pack'
    assert services['consulting']['billing']=='one_off_session_pack'
    assert services['consulting']['session_minutes']==60
    assert [(p['sessions'],p['price_cents']) for p in services['in_person']['offers']]==[(8,24200),(12,34485),(16,43560)]
    assert [(p['sessions'],p['price_cents']) for p in services['consulting']['offers']]==[(1,7260),(4,26620),(8,50820)]
    assert set(PROGRAMS)=={'core-3','core-6','core-12','elite-3','elite-6','elite-12'}


def test_mcp_exposes_the_same_service_catalog_without_checkout_permissions():
    with Session.begin() as db:
        lead=make_lead(db)
    response=mcp_rpc({'lead':lead.id},{'id':1,'method':'tools/call','params':{'name':'get_offer','arguments':{}}})
    result=json.loads(response.body)['result']
    assert not result['isError']
    offer=json.loads(result['content'][0]['text'])
    assert offer['other_services']==CATALOG['other_services']
    checkout_enum=TOOLS['prepare_checkout'][1]['program_id']['enum']
    assert set(checkout_enum)==set(PROGRAMS)


@pytest.mark.parametrize('service_id',['in-person-8','in-person-12','in-person-16','consulting-1','consulting-4','consulting-8'])
def test_informational_price_cannot_create_a_core_or_elite_checkout(service_id):
    with Session.begin() as db:
        lead=make_lead(db)
        with pytest.raises(RuleError,match='Programa desconocido'):
            offer_summary(db,lead,service_id,'full',True,'synthetic-turn')
        assert db.query(Record).filter_by(kind='contract').count()==0
        assert not lead.paused
