import os
import time
from datetime import datetime, timezone
import httpx
import stripe
from .domain import DAY, RuleError, PROGRAMS, latest_contract, prepare_contract, require, settings
from .store import Record, add_record

def api(method, url, **kwargs):
    response=httpx.request(method,url,timeout=25,**kwargs)
    response.raise_for_status()
    return response.json()

def stripe_client():
    key=os.getenv('STRIPE_SECRET_KEY','')
    require(bool(key),'Stripe pendiente de configuración.')
    require(settings_mode_matches_key(key),'Clave Stripe incompatible con el modo del servicio.')
    stripe.api_key=key
    stripe.api_version='2025-03-31.basil'
    return stripe

def settings_mode_matches_key(key):
    return key.startswith('sk_test_') if os.getenv('SCORUS_MODE','test')=='test' else key.startswith('sk_live_')

def checkout(db, lead, payment_mode):
    contract=prepare_contract(db,lead,payment_mode)
    if contract.data.get('checkout_url'): return {'url':contract.data['checkout_url'],'expires':contract.data['hold_until']}
    db.commit()
    client=stripe_client(); program=contract.data['price']; cfg=settings(db)
    amount=program['total_cents'] if payment_mode=='full' else program['monthly_cents']
    price={'currency':'eur','unit_amount':amount,'product_data':{'name':f"Scorus {program['tier'].title()} · {program['months']} meses",'description':f"Compromiso total {program['total_cents']/100:.2f} EUR, IVA incluido. Renovación manual."}}
    if payment_mode=='installments': price['recurring']={'interval':'month'}
    base=os.getenv('PUBLIC_SITE_URL','https://scorusfitness.com')
    params={'mode':'payment' if payment_mode=='full' else 'subscription','line_items':[{'price_data':price,'quantity':1}],'client_reference_id':contract.id,'metadata':{'contract_id':contract.id,'terms_version':cfg['terms_version']},'success_url':base+'/es/scorus-team?payment=received#valoracion','cancel_url':base+'/es/scorus-team#valoracion','expires_at':int(contract.data['hold_until']),'consent_collection':{'terms_of_service':'required'},'custom_text':{'terms_of_service_acceptance':{'message':f"Acepto las [condiciones del programa]({cfg['terms_url']}). Periodo cerrado; renovación manual."}}}
    if lead.email: params['customer_email']=lead.email
    if payment_mode=='installments':
        # Provider cancellation is installed at subscription.created, before releasing onboarding.
        params['subscription_data']={'metadata':{'contract_id':contract.id}}
    session=client.checkout.Session.create(**params,idempotency_key=f'scorus-checkout-{contract.id}')
    contract.data={**contract.data,'status':'checkout','checkout_id':session.id,'checkout_url':session.url}
    from .store import enqueue
    for hours in (12,23):
        enqueue(db,f'hold:{contract.id}:{hours}','hold_reminder',lead.id,{'contract_id':contract.id},contract.created+hours*3600)
    enqueue(db,f'hold:{contract.id}:expire','expire_hold',lead.id,{'contract_id':contract.id},contract.data['hold_until'])
    return {'url':session.url,'expires':contract.data['hold_until']}

def cap_installments(contract):
    client=stripe_client()
    sub=client.Subscription.retrieve(contract.data['subscription'])
    if sub.get('schedule'):
        schedule=client.SubscriptionSchedule.retrieve(sub['schedule'])
    else:
        schedule=client.SubscriptionSchedule.create(from_subscription=sub.id,idempotency_key=f'scorus-schedule-{contract.id}')
    phase=schedule.phases[0]
    # Anchor at first charge and include that first paid month in the finite term.
    from dateutil.relativedelta import relativedelta
    end=int((datetime.fromtimestamp(phase.start_date,timezone.utc)+relativedelta(months=contract.data['price']['months'])).timestamp())
    client.SubscriptionSchedule.modify(schedule.id,end_behavior='cancel',phases=[{'start_date':phase.start_date,'end_date':end,'items':[{'price':sub['items']['data'][0]['price']['id'],'quantity':1}],'proration_behavior':'none'}],idempotency_key=f'scorus-cap-{contract.id}')
    contract.data={**contract.data,'schedule_id':schedule.id,'billing_end':end,'schedule_confirmed':True}

def calendly(method,path,**kwargs):
    token=os.getenv('CALENDLY_TOKEN','')
    require(bool(token),'Calendario pendiente de conexión.')
    return api(method,'https://api.calendly.com'+path,headers={'Authorization':'Bearer '+token},**kwargs)

def eligibility(db,lead,kind):
    require(kind in ('valuation','elite','group'),'Tipo de cita desconocido.')
    require(lead.consent.get('adult') is True,'Confirma primero que tienes 18 años o más.')
    if kind in ('elite','group'):
        contract=latest_contract(db,lead)
        require(contract is not None and contract.data['status']=='active','La llamada requiere un programa activo.')
        if kind=='elite': require(contract.data['price']['tier']=='elite','Core no incluye llamadas privadas Elite.')
        return contract
    require(lead.state not in ('paid','active','ended'),'Para clientes activos, solicita atención de Bernat.')
    require(all(lead.profile.get(key) for key in ('goal','experience','days','duration','location','timing')),'Completa primero objetivo, experiencia y disponibilidad para preparar la valoración.')
    return None

def slots(db,lead,kind):
    contract=eligibility(db,lead,kind); cfg=settings(db)
    event_type=cfg['event_types'].get(kind)
    require(bool(event_type),'Bernat todavía no ha publicado reservas de este tipo.')
    start=time.time()+DAY; end=start+6*DAY
    data=calendly('GET','/event_type_available_times',params={'event_type':event_type,'start_time':datetime.fromtimestamp(start,timezone.utc).isoformat(),'end_time':datetime.fromtimestamp(end,timezone.utc).isoformat()})
    result=[]
    for item in data.get('collection',[]):
        stamp=datetime.fromisoformat(item['start_time'].replace('Z','+00:00')).timestamp()
        duration=1800 if kind=='valuation' else 3600
        if stamp<start: continue
        if contract and (stamp<contract.data['activated_at'] or stamp+duration>contract.data['service_end']): continue
        blocks=cfg['published_blocks']
        if not any(b['type']==kind and b['start']<=stamp and stamp+duration<=b['end'] for b in blocks): continue
        if contract and kind=='elite':
            cycle=int((stamp-contract.data['activated_at'])//(28*DAY))
            if stamp>=contract.data['service_end']: continue
            if any(r.data.get('contract_id')==contract.id and r.data.get('type')=='elite' and r.data.get('cycle')==cycle and r.data.get('status') in ('booked','completed','review') for r in db.query(Record).filter_by(kind='booking',lead_id=lead.id)): continue
        conflicts=False
        if kind!='group':
            for record in db.query(Record).filter_by(kind='booking').all():
                booking=record.data
                if booking.get('status')=='booked' and booking.get('type')!='group' and stamp<booking['end']+900 and stamp+duration+900>booking['start']: conflicts=True
        if not conflicts: result.append({'start_time':item['start_time'],'type':kind,'duration_minutes':duration//60})
    return result[:20]

def book(db,lead,kind,start_time,tz,email):
    from zoneinfo import ZoneInfo
    require('@' in email and len(email)<=254,'Necesitamos un correo válido para la reserva.')
    try: ZoneInfo(tz)
    except Exception: raise RuleError('Zona horaria desconocida.')
    settings(db,lock=True)
    existing=db.query(Record).filter_by(kind='booking',lead_id=lead.id).all()
    if any(r.data.get('type')==kind and r.data.get('status')=='booked' for r in existing): raise RuleError('Ya tienes una reserva; utiliza su enlace de cambio o consulta a Bernat.')
    offered=slots(db,lead,kind)
    require(any(s['start_time']==start_time for s in offered),'Ese horario ya no está disponible o no está autorizado.')
    cfg=settings(db); timestamp=datetime.fromisoformat(start_time.replace('Z','+00:00')).timestamp()
    contract=latest_contract(db,lead) if kind!='valuation' else None
    cycle=int((timestamp-contract.data['activated_at'])//(28*DAY)) if kind=='elite' else None
    record=add_record(db,'booking',lead.id,{'type':kind,'start':timestamp,'end':timestamp+(1800 if kind=='valuation' else 3600),'cycle':cycle,'contract_id':contract.id if contract else None,'status':'requesting'})
    db.flush()
    try:
        result=calendly('POST','/invitees',json={'event_type':cfg['event_types'][kind],'start_time':start_time,'invitee':{'name':lead.name,'email':email,'timezone':tz}})['resource']
    except Exception:
        record.data={**record.data,'status':'review'}
        from .domain import handoff
        handoff(db,lead,'Calendly no confirmó la reserva. Verificar antes de reintentar para evitar duplicados.')
        return {'status':'review','message':'Bernat comprobará la reserva. Todavía no está confirmada.'}
    lead.email=email
    record.data={**record.data,'status':'booked','invitee_uri':result.get('uri'),'event_uri':result.get('event'),'reschedule_url':result.get('reschedule_url'),'cancel_url':result.get('cancel_url')}
    from .domain import message
    for hours in (24,2):
        message(db,lead,f"Recordatorio: tu llamada de Scorus Team es a las {start_time}. Revisa la invitación y su enlace de videollamada.",f'booking:{record.id}:{hours}','appointment_reminder',[start_time],due=timestamp-hours*3600)
    if kind=='valuation': lead.state='valuation_booked'
    return record.data

def send_whatsapp(db,lead,payload):
    cfg=settings(db)
    require(lead.consent.get('contact') and not lead.opted_out,'Sin autorización de contacto.')
    if cfg['mode']=='test': require(lead.phone in cfg['test_recipients'],'Destinatario fuera de la lista de pruebas.')
    else: require(cfg['launch_approved'],'Producción pendiente de validación.')
    transport=os.getenv('WHATSAPP_TRANSPORT','evolution')
    if transport=='evolution':
        url=os.getenv('EVOLUTION_URL','http://evolution:8080')
        key=os.getenv('EVOLUTION_API_KEY',''); require(bool(key),'Evolution no configurado.')
        instance=os.getenv('EVOLUTION_INSTANCE','scorus-test')
        instances=api('GET',url+'/instance/fetchInstances',headers={'apikey':key})
        mine=next((i for i in instances if i.get('name')==instance),None)
        require(mine is not None and mine.get('connectionStatus')=='open','Teléfono Scorus todavía sin vincular.')
        expected=os.getenv('TEST_PHONE') if cfg['mode']=='test' else os.getenv('PRODUCTION_PHONE')
        require(bool(expected) and mine.get('ownerJid','').split('@')[0]==expected.lstrip('+'),'El número vinculado no coincide con el configurado para este entorno.')
        return api('POST',url+'/message/sendText/'+instance,headers={'apikey':key},json={'number':lead.phone.lstrip('+'),'text':payload['text'],'delay':1200,'linkPreview':False})
    require(transport=='cloud','Transporte desconocido.')
    key=os.getenv('META_ACCESS_TOKEN',''); require(bool(key),'Meta no configurado.')
    body={'messaging_product':'whatsapp','to':lead.phone.lstrip('+'),'type':'text','text':{'body':payload['text']}}
    if time.time()-lead.last_inbound>=DAY:
        name=cfg['template_names'].get(payload.get('template'))
        require(cfg['templates_approved'] and name,'Plantilla aprobada pendiente; no enviar fuera de la ventana de atención.')
        body={**body,'type':'template','template':{'name':name,'language':{'code':lead.language},'components':[{'type':'body','parameters':[{'type':'text','text':p} for p in payload['params']]}] if payload.get('params') else []}}
        body.pop('text',None)
    return api('POST',f"https://graph.facebook.com/{os.getenv('META_API_VERSION','v23.0')}/{os.getenv('META_PHONE_ID','')}/messages",headers={'Authorization':'Bearer '+key},json=body)
