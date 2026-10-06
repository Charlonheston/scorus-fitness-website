import base64
import json
import logging
import os
import time
import httpx
from sqlalchemy import select
from .store import Config, Job, Lead, Record, Session, add_record, enqueue, init
from .domain import CATALOG, DAY, RuleError, cancel_sales, handoff, latest_contract, message, next_sales_window, paid_contract, require, scoped_token, settings
from .providers import api, cap_installments, send_whatsapp
from .i18n import text

log=logging.getLogger('scorus.worker')

def stripe_event(db,event):
    obj=event['data']['object']; kind=event['type']
    if kind in ('checkout.session.completed','checkout.session.async_payment_succeeded'):
        contract=db.get(Record,obj.get('client_reference_id'))
        if contract and contract.kind=='contract': paid_contract(db,contract,obj)
    elif kind=='customer.subscription.created':
        contract=db.get(Record,obj.get('metadata',{}).get('contract_id'))
        if contract and contract.kind=='contract':
            contract.data={**contract.data,'subscription':obj['id']}
            enqueue(db,f'schedule:{contract.id}','stripe_schedule',contract.lead_id,{'contract_id':contract.id})
    elif kind=='invoice.payment_failed':
        subscription=obj.get('subscription') or obj.get('parent',{}).get('subscription_details',{}).get('subscription')
        for contract in db.query(Record).filter_by(kind='contract'):
            if subscription and contract.data.get('subscription')==subscription:
                lead=db.get(Lead,contract.lead_id);handoff(db,lead,'Pago de cuota fallido; revisar regularización. Sin suspensión automática.')
    elif kind in ('charge.dispute.created','charge.refunded'):
        add_record(db,'alert','',{'reason':'Evento financiero requiere revisión administrativa.','event_id':event['id'],'type':kind})

def calendly_event(db,event):
    obj=event.get('payload',{}); uri=obj.get('uri');kind=event.get('event')
    if kind=='invitee.created':
        # Reservations made through reschedule URLs are reconciled by old_invitee, never by email alone.
        previous=obj.get('old_invitee')
        if previous:
            for booking in db.query(Record).filter_by(kind='booking'):
                if booking.data.get('invitee_uri')==previous:
                    lead=db.get(Lead,booking.lead_id)
                    handoff(db,lead,'Reserva cambiada en Calendly; comprobar nuevo horario y derecho Elite antes de confirmar.')
        return
    if kind!='invitee.canceled': return
    for booking in db.query(Record).filter_by(kind='booking'):
        if booking.data.get('invitee_uri')!=uri: continue
        lead=db.get(Lead,booking.lead_id)
        late=time.time()>booking.data['start']-DAY
        booking.data={**booking.data,'status':'review' if late else 'cancelled'}
        for job in db.query(Job).filter_by(lead_id=lead.id,status='pending'):
            if job.key.startswith('booking:'+booking.id+':'):job.status='cancelled'
        if late: handoff(db,lead,'Cancelación tardía; Bernat debe resolverla sin sanción automática.')

def respond(db,job,lead):
    if lead.paused or lead.opted_out or lead.generation!=job.data['generation']:return
    rec=db.get(Record,job.data['message_id'])
    history=db.query(Record).filter_by(kind='message',lead_id=lead.id).order_by(Record.created.desc()).limit(20).all()
    messages=[{'role':'user' if r.data['direction']=='in' else 'assistant','content':r.data['text']} for r in reversed(history) if r.id!=rec.id]
    secret=os.getenv('HERMES_BRIDGE_KEY',''); require(bool(secret),'Hermes pendiente de configuración.')
    response=httpx.post(os.getenv('HERMES_URL','http://hermes:8642')+'/respond',headers={'Authorization':'Bearer '+secret},json={'prompt':rec.data['text'],'history':messages,'lead_context':{'name':lead.name,'answers':lead.profile,'state':lead.state},'mcp_token':scoped_token(lead.id,os.getenv('MCP_SECRET',''))},timeout=160)
    response.raise_for_status();result=response.json()
    # Release/reload after slow model invocation: a human takeover or new inbound invalidates the response.
    db.expire(lead);db.refresh(lead)
    if lead.paused or lead.opted_out or lead.generation!=job.data['generation']:return
    reply=result.get('reply','').strip();require(bool(reply) and len(reply)<=4000,'Hermes no devolvió una respuesta válida.')
    sent=message(db,lead,reply,'reply:'+job.id)
    sent.data={**sent.data,'guard_generation':True}
    add_record(db,'usage',lead.id,{'job':job.id,'tokens':result.get('usage',{})})

def audio(db,job,lead):
    require(os.getenv('STT_URL') and os.getenv('STT_API_KEY'),'Transcripción pendiente de configurar; derivar audio a Bernat.')
    if job.data.get('message'):
        media=api('POST',os.getenv('EVOLUTION_URL','http://evolution:8080')+'/chat/getBase64FromMediaMessage/'+os.getenv('EVOLUTION_INSTANCE','scorus-test'),headers={'apikey':os.getenv('EVOLUTION_API_KEY','')},json={'message':job.data['message'],'convertToMp4':False})
        binary=base64.b64decode(media['base64'].split(',')[-1]); external=job.data['message']['key']['id']
    else:
        headers={'Authorization':'Bearer '+os.getenv('META_ACCESS_TOKEN','')}
        media=api('GET',f"https://graph.facebook.com/{os.getenv('META_API_VERSION','v23.0')}/{job.data['meta_media_id']}",headers=headers)
        response=httpx.get(media['url'],headers=headers,timeout=25);response.raise_for_status();binary=response.content;external=job.data['external_id']
    require(len(binary)<=12*1024*1024,'Audio demasiado grande; revisión humana.')
    response=httpx.post(os.getenv('STT_URL'),headers={'Authorization':'Bearer '+os.getenv('STT_API_KEY')},data={'model':os.getenv('STT_MODEL','whisper-1')},files={'file':('voice.ogg',binary,'audio/ogg')},timeout=45)
    response.raise_for_status();text=response.json()['text']
    from .main import inbound
    inbound(db,lead.phone,text,external)

def process(db,job):
    lead=db.get(Lead,job.lead_id) if job.lead_id else None
    if job.kind=='stripe_event':stripe_event(db,job.data)
    elif job.kind=='calendly_event':calendly_event(db,job.data)
    elif job.kind=='stripe_schedule':
        contract=db.get(Record,job.data['contract_id']);cap_installments(contract)
    elif job.kind=='manual_echo':
        if not db.get(Record,'sent:'+job.data['provider_id']):
            target=db.query(Lead).filter_by(phone=job.data['phone']).first()
            if target:handoff(db,target,'Respuesta manual desde WhatsApp.')
    elif job.kind=='respond':respond(db,job,lead)
    elif job.kind=='audio':audio(db,job,lead)
    elif job.kind=='hold_reminder':
        contract=db.get(Record,job.data['contract_id'])
        if lead.paused or lead.opted_out or lead.followups>=4 or contract.data['status']!='checkout' or contract.data['hold_until']<=time.time():return
        due=next_sales_window(time.time())
        if due>=contract.data['hold_until']:return
        if due>time.time()+1:job.due=due;job.status='pending';return
        lead.followups+=1
        sent=message(db,lead,'Tu reserva provisional sigue disponible hasta '+time.strftime('%d/%m %H:%M',time.gmtime(contract.data['hold_until']))+' UTC. Si quieres continuar, utiliza el enlace de pago; si necesitas aclaraciones, escríbenos.',f'hold-send:{job.id}','payment_reminder',commercial=True)
        sent.data={**sent.data,'hold_until':contract.data['hold_until']}
    elif job.kind=='expire_hold':
        contract=db.get(Record,job.data['contract_id'])
        if contract.data['status'] in ('held','checkout'):contract.data={**contract.data,'status':'expired'}
    elif job.kind=='followup':
        if lead.paused or lead.opted_out or lead.generation!=job.data['generation'] or lead.followups>=4 or lead.state in ('paid','active','ended','not_interested'):return
        contract=latest_contract(db,lead)
        if contract and contract.data['status'] in ('held','checkout') and contract.data['hold_until']>time.time():return
        due=next_sales_window(time.time())
        if due>time.time()+1:job.due=due;job.status='pending';return
        lead.followups+=1
        message(db,lead,text('followup',lead),f'followup-send:{job.id}','lead_followup',commercial=True)
    elif job.kind=='renewal':
        contract=db.get(Record,job.data['contract_id'])
        if contract.data['status']!='active' or lead.opted_out or lead.paused:return
        message(db,lead,text('renewal',lead,days=job.data['days']),f'renewal-send:{job.id}','renewal_notice',[str(job.data['days'])],commercial=True)
    elif job.kind=='end_service':
        contract=db.get(Record,job.data['contract_id'])
        if contract.data['status']=='active':
            contract.data={**contract.data,'status':'ended'}
            if latest_contract(db,lead).id==contract.id: lead.state='ended'
            add_record(db,'task',lead.id,{'type':'service_end','status':'open','reason':'Final del periodo; revisar acceso Harbiz sin renovar automáticamente.'})
    elif job.kind=='send':
        if lead.opted_out or (lead.paused and not (job.data.get('human') or job.data.get('system'))):return
        if (job.data.get('commercial') or job.data.get('guard_generation')) and lead.generation!=job.data['generation']:return
        if job.data.get('hold_until',time.time()+1)<=time.time():return
        if job.data.get('commercial'):
            due=next_sales_window(time.time())
            if due>time.time()+1:job.due=due;job.status='pending';return
        result=send_whatsapp(db,lead,job.data)
        provider_id=result.get('key',{}).get('id') or (result.get('messages') or [{}])[0].get('id')
        require(bool(provider_id),'Proveedor sin identificador de envío; comprobar entrega antes de repetir.')
        db.add(Record(id='sent:'+provider_id,kind='message',lead_id=lead.id,data={'direction':'out','text':job.data['text'],'provider_id':provider_id}))

def once():
    with Session() as db:
        job=db.execute(select(Job).where(Job.status=='pending',Job.due<=time.time()).order_by(Job.due).with_for_update(skip_locked=True).limit(1)).scalar_one_or_none()
        if not job:return False
        job.status='running';job.attempts+=1;db.commit();job_id=job.id
        try:
            process(db,job)
            if job.status=='running':job.status='done'
            db.commit()
        except Exception as error:
            db.rollback();job=db.get(Job,job_id)
            # Provider failure bodies may contain customer data or credentials: log only exception type.
            job.error=type(error).__name__+(': '+str(error) if isinstance(error,RuleError) else '')
            if job.kind=='send':
                job.status='review'
                add_record(db,'alert',job.lead_id,{'reason':'Envío no confirmado; verificar antes de repetir para evitar duplicados.','job_id':job.id})
            elif job.attempts>=3 or isinstance(error,RuleError):
                job.status='failed'
                lead=db.get(Lead,job.lead_id) if job.lead_id else None
                if lead:handoff(db,lead,'Automatización requiere revisión: '+job.error)
                else:add_record(db,'alert','',{'reason':job.error,'job_id':job.id})
            else:job.status='pending';job.due=time.time()+min(300,30*job.attempts)
            db.commit();log.warning('Job %s %s',job_id,job.error)
    return True

def recovery():
    with Session.begin() as db:
        for job in db.query(Job).filter_by(status='running'):
            if job.kind=='send':
                job.status='review';add_record(db,'alert',job.lead_id,{'reason':'Reinicio durante envío; verificar entrega antes de repetir.','job_id':job.id})
            else:job.status='pending'

if __name__=='__main__':
    logging.basicConfig(level=logging.INFO);init();recovery()
    while True:
        try:
            if not once():time.sleep(1)
        except Exception:
            log.exception('Worker cycle failed');time.sleep(5)
