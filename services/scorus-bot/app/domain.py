import base64
import hashlib
import hmac
import json
import os
import re
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo
from dateutil.relativedelta import relativedelta
from sqlalchemy import select
from .store import Config, Job, Lead, Record, add_record, enqueue

CATALOG = json.loads(Path(os.getenv('CATALOG_PATH', '/app/catalog.json')).read_text(encoding='utf-8'))
PROGRAMS = {p['id']:p for p in CATALOG['programs']}
DAY = 86400

class RuleError(Exception):
    pass

def require(condition, reason):
    if not condition:
        raise RuleError(reason)

def settings(db, lock=False):
    query = select(Config).where(Config.id=='settings')
    if lock:
        query = query.with_for_update()
    return db.execute(query).scalar_one().data

def phone_number(value):
    value = re.sub(r'[\s()-]', '', value)
    require(bool(re.fullmatch(r'\+[1-9]\d{7,14}', value)), 'Indica el teléfono con prefijo internacional, por ejemplo +34.')
    return value

def cancel_sales(db, lead):
    lead.generation += 1
    for job in db.query(Job).filter(Job.lead_id==lead.id, Job.status=='pending').all():
        if job.kind in ('followup','hold_reminder','respond') or job.data.get('commercial') or job.data.get('guard_generation'):
            job.status='cancelled'

def handoff(db, lead, reason, notify=True):
    already_paused=lead.paused
    cancel_sales(db, lead)
    lead.paused = True
    add_record(db,'task',lead.id,{'type':'human','reason':reason,'status':'open'})
    add_record(db,'audit',lead.id,{'action':'handoff','reason':reason})
    if notify and not already_paused and not lead.opted_out:
        from .i18n import text
        job=message(db,lead,text('handoff',lead),f'handoff:{lead.id}:{lead.generation}','human_handoff')
        job.data={**job.data,'system':True}

def message(db, lead, text, key, template='', params=None, commercial=False, due=None):
    category='marketing' if commercial else 'service'
    if template=='payment_reminder': category='transactional'
    job=enqueue(db,key,'send',lead.id,{'text':text,'template':template,'params':params or [],'commercial':commercial,'category':category,'generation':lead.generation},due)
    return job

def create_lead(db, payload):
    cfg=settings(db)
    require(cfg['public_form_enabled'], 'La solicitud de valoración todavía no está abierta. Inténtalo más adelante.')
    require(payload['adult'] and payload['contact_consent'], 'Confirma mayoría de edad y autorización de contacto.')
    phone=phone_number(payload['phone'])
    if cfg['mode']=='test': require(phone in cfg['test_recipients'],'El formulario está en pruebas; este teléfono no está autorizado.')
    lead=db.query(Lead).filter_by(phone=phone).first()
    require(not lead or not lead.opted_out, 'Para reanudar el contacto, escribe al WhatsApp de Scorus Team.')
    if lead:
        # Never overwrite an existing customer's identity or contractual state from a public form.
        add_record(db,'form_repeat',lead.id,{'received':time.time()})
        return lead
    lead=Lead(phone=phone,name=payload['name'],profile=payload['answers'],attribution=payload['attribution'],consent={'adult':True,'contact':True,'marketing':payload['marketing_consent'],'version':payload['consent_version'],'at':time.time(),'source':'landing'})
    db.add(lead); db.flush()
    add_record(db,'audit',lead.id,{'action':'lead_created','catalog_version':CATALOG['version']})
    message(db,lead,'Hola, soy el asistente virtual de Scorus Team. Hemos recibido tu solicitud de valoración. ¿Seguimos por aquí?',f'lead:{lead.id}:welcome','welcome',[lead.name])
    schedule_followups(db,lead)
    return lead

def schedule_followups(db, lead):
    if not lead.consent.get('marketing') or lead.paused or lead.opted_out or lead.state in ('paid','active','ended','not_interested'):
        return
    for index,days in enumerate((1,3,7,14),1):
        if index+lead.followups>4:
            break
        enqueue(db,f'followup:{lead.id}:{lead.generation}:{index}','followup',lead.id,{'generation':lead.generation,'index':index,'expires_at':time.time()+(days+1)*DAY},time.time()+days*DAY)

def within_sales_window(ts):
    local=datetime.fromtimestamp(ts,ZoneInfo('Europe/Madrid'))
    minutes=local.hour*60+local.minute
    return 600<=minutes<810 or 1020<=minutes<1230

def next_sales_window(ts):
    local=datetime.fromtimestamp(ts,ZoneInfo('Europe/Madrid'))
    if within_sales_window(ts): return ts
    for days in (0,1):
        for hour in (10,17):
            target=(local+timedelta(days=days)).replace(hour=hour,minute=0,second=0,microsecond=0)
            if target.timestamp()>ts: return target.timestamp()
    raise RuleError('No se pudo calcular el horario.')

def approve(db, lead, program, actor):
    require(program in PROGRAMS,'Programa desconocido.')
    require(not any(r.data.get('status') in ('paid','active') for r in db.query(Record).filter_by(kind='contract',lead_id=lead.id)), 'El periodo actual sigue vigente. Bernat puede revisar la continuidad; el nuevo contrato se aprobará al finalizar el actual.')
    require(any(r.data.get('status')=='completed' and r.data.get('type')=='valuation' for r in db.query(Record).filter_by(kind='booking',lead_id=lead.id)), 'Completa y registra primero la valoración de Bernat.')
    require(not lead.opted_out,'El cliente ha solicitado dejar de recibir mensajes.')
    lead.profile={**lead.profile,'approved_program':program,'approved_at':time.time(),'approved_by':actor}
    lead.state='approved'
    add_record(db,'audit',lead.id,{'action':'program_approved','program':program,'actor':actor})

def latest_contract(db, lead):
    return db.query(Record).filter_by(kind='contract',lead_id=lead.id).order_by(Record.created.desc()).first()

def prepare_contract(db, lead, payment_mode):
    cfg=settings(db,lock=True)
    require(not lead.paused and not lead.opted_out, 'Conversación bajo atención humana o sin permiso de contacto.')
    require(lead.state=='approved', 'La contratación requiere valoración y aprobación de Bernat.')
    pid=lead.profile.get('approved_program')
    require(pid in cfg['catalog_approved'], 'Esta tarifa todavía necesita confirmación de Bernat.')
    require(cfg['billing_approved'] and cfg['terms_url'] and cfg['terms_version'], 'La contratación todavía no tiene condiciones y facturación validadas.')
    require(payment_mode in ('full','installments'), 'Modalidad de pago desconocida.')
    require(not any(r.data.get('status') in ('paid','active') for r in db.query(Record).filter_by(kind='contract',lead_id=lead.id)), 'Ya existe un programa pagado o activo. La continuidad necesita un nuevo contrato después del periodo actual.')
    existing=latest_contract(db,lead)
    if existing and existing.data['status'] in ('held','checkout') and existing.data['hold_until']>time.time():
        require(existing.data['payment_mode']==payment_mode,'Existe otro pago reservado; consulta a Bernat para cambiarlo.')
        require(existing.data['program']==pid,'Existe una reserva con otro programa. Bernat debe revisar su cambio antes de generar otro pago.')
        return existing
    occupied=0
    for rec in db.query(Record).filter_by(kind='contract').all():
        if rec.data['status'] in ('paid','active') or (rec.data['status'] in ('held','checkout') and rec.data['hold_until']>time.time()): occupied+=1
    require(occupied<cfg['capacity'], 'No hay plazas disponibles. Podemos solicitar lista de espera.')
    program=PROGRAMS[pid]
    contract=add_record(db,'contract',lead.id,{'program':pid,'price':program,'catalog_version':CATALOG['version'],'terms_version':cfg['terms_version'],'payment_mode':payment_mode,'status':'held','hold_until':time.time()+DAY,'paid_at':None,'activated_at':None,'service_end':None})
    db.flush()
    return contract

def paid_contract(db, contract, session, now=None):
    now=now or time.time()
    if contract.data['status'] in ('paid','active','ended'): return
    lead=db.get(Lead,contract.lead_id)
    expected=contract.data['price']['total_cents'] if contract.data['payment_mode']=='full' else contract.data['price']['monthly_cents']
    require(session.get('payment_status')=='paid','El proveedor todavía no confirma el pago.')
    require(session.get('amount_total')==expected and session.get('currency')=='eur','El pago no coincide con el contrato.')
    require(session.get('id')==contract.data.get('checkout_id'),'Identificador de pago inesperado.')
    if now>contract.data['hold_until']:
        contract.data={**contract.data,'status':'review','paid_at':now}
        handoff(db,lead,'Pago recibido fuera de la reserva; revisar plaza y devolución antes del alta.')
        return
    contract.data={**contract.data,'status':'paid','paid_at':now,'subscription':session.get('subscription'),'customer':session.get('customer')}
    lead.state='paid'; cancel_sales(db,lead)
    add_record(db,'task',lead.id,{'type':'harbiz','status':'open','reason':'Crear acceso y confirmar entrega de instrucciones. No activar el plan sin revisión.'})
    add_record(db,'task',lead.id,{'type':'invoice','status':'open','reason':'Verificar emisión de factura legal y documentación de contratación.'})
    if session.get('subscription'):
        enqueue(db,f'schedule:{contract.id}','stripe_schedule',lead.id,{'contract_id':contract.id})
    from .i18n import text
    message(db,lead,text('paid',lead),f'paid:{contract.id}','payment_confirmed')

def activate(db, lead, actor):
    contract=latest_contract(db,lead)
    require(contract is not None and contract.data['status']=='paid','Primero debe confirmarse el pago.')
    require(lead.profile.get('harbiz_access_confirmed') and lead.profile.get('onboarding_complete'),'Confirma acceso a Harbiz y onboarding completo.')
    start=datetime.now(timezone.utc)
    end=start+relativedelta(months=contract.data['price']['months'])
    contract.data={**contract.data,'status':'active','activated_at':start.timestamp(),'service_end':end.timestamp()}
    lead.state='active'
    add_record(db,'audit',lead.id,{'action':'plan_activated','actor':actor})
    from .i18n import text
    message(db,lead,text('active',lead),f'activated:{contract.id}','plan_active')
    for days in (30,14,7):
        enqueue(db,f'renewal:{contract.id}:{days}','renewal',lead.id,{'contract_id':contract.id,'days':days},end.timestamp()-days*DAY)
    enqueue(db,f'end:{contract.id}','end_service',lead.id,{'contract_id':contract.id},end.timestamp())

def scoped_token(lead_id, secret, expires=None, **scope):
    body=base64.urlsafe_b64encode(json.dumps({'lead':lead_id,'exp':expires or int(time.time())+300,**scope}).encode()).decode().rstrip('=')
    sig=hmac.new(secret.encode(),body.encode(),hashlib.sha256).hexdigest()
    return body+'.'+sig

def token_scope(token, secret):
    require(bool(secret),'MCP no configurado.')
    try:
        body,sig=token.split('.')
        expected=hmac.new(secret.encode(),body.encode(),hashlib.sha256).hexdigest()
        require(hmac.compare_digest(sig,expected),'Token inválido.')
        data=json.loads(base64.urlsafe_b64decode(body+'='*(-len(body)%4)))
        require(data['exp']>time.time(),'Token caducado.')
        require(isinstance(data.get('lead'),str),'Token inválido.')
        return data
    except (ValueError,KeyError,TypeError):
        raise RuleError('Token inválido.')

def token_lead(token, secret):return token_scope(token,secret)['lead']
