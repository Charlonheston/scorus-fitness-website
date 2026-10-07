import base64
import json
import logging
import os
import time
import signal
import threading
from concurrent.futures import ThreadPoolExecutor
import httpx
from sqlalchemy import select
from .store import Config, Job, Lead, Record, Session, add_record, enqueue, init
from .domain import CATALOG, DAY, RuleError, cancel_sales, handoff, latest_contract, message, next_sales_window, paid_contract, require, scoped_token, settings
from .providers import api, cap_installments, send_whatsapp, mark_read, presence, connection_state
from .i18n import text
from .queueing import LEASE_SECONDS, budget_due, claim, delivery, pacing, permitted, priority, recover, response_target, transport_result, typing_seconds, unanswered

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
    batch=unanswered(db,lead.id)
    if not batch:return
    ids=[r.id for r in batch];prompt='\n'.join(r.data['text'] for r in batch)
    history=db.query(Record).filter_by(kind='message',lead_id=lead.id).order_by(Record.created.desc()).limit(20).all()
    messages=[{'role':'user' if r.data['direction']=='in' else 'assistant','content':r.data['text']} for r in reversed(history) if r.id not in ids]
    previous=next((r for r in history if r.data.get('direction')=='out'),None)
    target=response_target(len(prompt),not previous or time.time()-previous.created>=21600)
    first=batch[0].created;owner=job.owner
    from .sales import readiness
    context={'name':lead.name,'answers':lead.profile,'state':lead.state,'commercial':readiness(db)}
    cfg=pacing(db);token=scoped_token(lead.id,os.getenv('MCP_SECRET',''),turn=job.id,generation=lead.generation,owner=owner)
    job.data={**job.data,'message_ids':ids,'first_inbound':first};db.commit()
    if cfg['read_receipts']:
        try:mark_read(batch)
        except Exception:log.warning('Read receipt unavailable')
    secret=os.getenv('HERMES_BRIDGE_KEY',''); require(bool(secret),'Hermes pendiente de configuración.')
    response=httpx.post(os.getenv('HERMES_URL','http://hermes:8642')+'/respond',headers={'Authorization':'Bearer '+secret},json={'prompt':prompt,'history':messages,'lead_context':context,'mcp_token':token},timeout=160)
    response.raise_for_status();result=response.json()
    # Release/reload after slow model invocation: a human takeover or new inbound invalidates the response.
    db.expire_all();db.refresh(lead);db.refresh(job)
    if job.owner!=owner or job.status!='running':return
    add_record(db,'usage',lead.id,{'job':job.id,'tokens':result.get('usage',{})})
    if lead.paused or lead.opted_out or pacing(db)['automatic_paused'] or lead.generation!=job.data['generation']:
        add_record(db,'turn',lead.id,{'status':'discarded','job':job.id});return
    reply=result.get('reply','').strip();require(bool(reply) and len(reply)<=4000,'Hermes no devolvió una respuesta válida.')
    # The exact contractual quote is rendered in code, never reconstructed by the model.
    proposals=db.query(Record).filter_by(kind='sales_offer',lead_id=lead.id).order_by(Record.created.desc()).all()
    proposal=next((r for r in proposals if r.data.get('source_turn')==job.id and not r.data.get('accepted_at')),None)
    if proposal:
        from .sales import quote_text
        reply=quote_text(proposal.data,lead.language)
    sent=message(db,lead,reply,'reply:'+job.id,due=max(time.time(),first+target-(typing_seconds(reply) if cfg['typing'] else 0)))
    sent.data={**sent.data,'guard_generation':True,'message_ids':ids,'first_inbound':first,'category':'conversation','turn_id':job.id}
    add_record(db,'turn',lead.id,{'status':'prepared','job':job.id,'batch_count':len(ids),'target_seconds':target})

def audio(db,job,lead):
    if lead.paused or lead.opted_out:return
    if not (os.getenv('STT_URL') and os.getenv('STT_API_KEY')):
        rec=db.get(Record,job.data.get('record_id'))
        if rec:rec.data={**rec.data,'text':'[Nota de voz sin transcripción disponible. Pide al cliente un texto breve u ofrece atención de Bernat; no inventes el contenido.]'}
        queue_audio_turn(db,lead,job);return
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
    rec=db.get(Record,job.data.get('record_id'))
    if rec:
        rec.data={**rec.data,'answered':True,'transcript':text}
        inbound(db,lead.phone,text,external+':transcript',provider_key=rec.data.get('provider_key'))
    else:inbound(db,lead.phone,text,external)

def queue_audio_turn(db,lead,job):
    from .queueing import queue_turn
    if lead.generation==job.data.get('generation'):queue_turn(db,lead,'audio-ready:'+job.id)

def process(db,job):
    lead=db.get(Lead,job.lead_id) if job.lead_id else None
    if job.kind=='stripe_event':stripe_event(db,job.data)
    elif job.kind=='calendly_event':calendly_event(db,job.data)
    elif job.kind=='stripe_schedule':
        contract=db.get(Record,job.data['contract_id']);cap_installments(contract)
    elif job.kind=='manual_echo':
        if not db.get(Record,'sent:'+job.data['provider_id']):
            target=db.query(Lead).filter_by(phone=job.data['phone']).first()
            if target:
                active=db.query(Job).filter_by(kind='send',lead_id=target.id,status='running').first()
                if active:job.status='pending';job.due=time.time()+5;return
                uncertain=db.query(Job).filter_by(kind='send',lead_id=target.id,status='review').first()
                handoff(db,target,'Envío pendiente de verificar.' if uncertain else 'Respuesta manual desde WhatsApp.',notify=False)
                if not uncertain:
                    identifier='manual-message:'+job.data['provider_id']
                    if job.data.get('text') and not db.get(Record,identifier):
                        db.add(Record(id=identifier,kind='message',lead_id=target.id,data={'direction':'out','text':job.data['text'],'provider_id':job.data['provider_id'],'human':True}))
                    for rec in unanswered(db,target.id):rec.data={**rec.data,'answered':True,'handled_by':'human'}
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
        if not lead.consent.get('marketing') or job.data.get('expires_at',float('inf'))<=time.time() or lead.paused or lead.opted_out or lead.generation!=job.data['generation'] or lead.followups>=4 or lead.state in ('paid','active','ended','not_interested'):return
        contract=latest_contract(db,lead)
        if contract and contract.data['status'] in ('held','checkout') and contract.data['hold_until']>time.time():return
        due=next_sales_window(time.time())
        if due>time.time()+1:job.due=due;job.status='pending';return
        lead.followups+=1
        sent=message(db,lead,text('followup',lead),f'followup-send:{job.id}','lead_followup',commercial=True)
        sent.data={**sent.data,'expires_at':job.data.get('expires_at',time.time()+DAY)}
    elif job.kind=='renewal':
        contract=db.get(Record,job.data['contract_id'])
        if contract.data['status']!='active' or lead.opted_out or lead.paused:return
        sent=message(db,lead,text('renewal',lead,days=job.data['days']),f'renewal-send:{job.id}','renewal_notice',[str(job.data['days'])],commercial=True)
        sent.data={**sent.data,'expires_at':min(time.time()+DAY,contract.data['service_end'])}
    elif job.kind=='end_service':
        contract=db.get(Record,job.data['contract_id'])
        if contract.data['status']=='active':
            contract.data={**contract.data,'status':'ended'}
            if latest_contract(db,lead).id==contract.id: lead.state='ended'
            add_record(db,'task',lead.id,{'type':'service_end','status':'open','reason':'Final del periodo; revisar acceso Harbiz sin renovar automáticamente.'})
    elif job.kind=='send':
        dispatch(db,job,lead)

def clear_typing(phone):
    try:presence(phone,'paused')
    except Exception:log.warning('Presence cleanup unavailable')

def dispatch(db,job,lead):
    cfg=pacing(db);now=time.time();runtime=delivery(db,lock=True);state=dict(runtime.data)
    if cfg['automatic_paused'] and not job.data.get('human'):
        job.status='pending';job.due=now+15;job.data={k:v for k,v in job.data.items() if k!='phase'}
        runtime.data={**state,'typing_job':''};db.commit();clear_typing(lead.phone);return
    if not permitted(db,job,lead):
        job.status='cancelled';runtime.data={**state,'typing_job':''};db.commit()
        if job.data.get('phase')=='typing':clear_typing(lead.phone)
        return
    due=budget_due(state,cfg,lead.id,now)
    if job.data.get('commercial'):due=max(due,next_sales_window(now))
    if state.get('restricted') or state.get('connection')!='open':due=max(due,now+15)
    elif now-state.get('connected_since',0)<30:due=max(due,state.get('connected_since',now)+30)
    if due>now+.1:
        job.status='pending';job.due=due;db.commit();return
    owner=job.owner
    if cfg['typing'] and not job.data.get('phase') and not job.data.get('human') and not priority(job)==0:
        seconds=typing_seconds(job.data['text'])
        job.data={**job.data,'phase':'typing'};job.due=now+seconds
        runtime.data={**state,'typing_job':job.id};db.commit()
        try:presence(lead.phone,'composing',seconds)
        except Exception:log.warning('Typing indicator unavailable')
        finally:clear_typing(lead.phone)
        db.refresh(job)
        if job.owner==owner and job.status=='running':job.status='pending'
        return
    # Durable attempt/budget reservation precedes network I/O. Ambiguous results never retry.
    state['attempts']=[t for t in state.get('attempts',[]) if t>now-3600]+[now]
    state['last_send']=now
    state['contacts']={k:v for k,v in state.get('contacts',{}).items() if v>now-86400}
    state['contacts'][lead.id]=now;state['typing_job']=''
    runtime.data=state;job.data={**job.data,'dispatching':True}
    add_record(db,'send_attempt',lead.id,{'job_id':job.id,'status':'dispatching'})
    db.commit()
    db.refresh(lead);db.refresh(job)
    if job.owner!=owner or not permitted(db,job,lead):
        job.status='cancelled';job.data={**job.data,'dispatching':False};db.commit();clear_typing(lead.phone);return
    try:
        result=send_whatsapp(db,lead,job.data)
        provider_id=result.get('key',{}).get('id') or (result.get('messages') or [{}])[0].get('id')
        require(bool(provider_id),'Proveedor sin identificador de envío; comprobar entrega antes de repetir.')
        db.expire_all();db.refresh(job)
        receipt=db.get(Record,'receipt:'+provider_id)
        if not db.get(Record,'sent:'+provider_id):
            db.add(Record(id='sent:'+provider_id,kind='message',lead_id=lead.id,data={'direction':'out','text':job.data['text'],'provider_id':provider_id,'delivery_status':receipt.data.get('status') if receipt else 'accepted','response_seconds':max(0,time.time()-job.data['first_inbound']) if job.data.get('first_inbound') else None}))
        for identifier in job.data.get('message_ids',[]):
            rec=db.get(Record,identifier)
            if rec:rec.data={**rec.data,'answered':True,'answered_by':job.id}
        for offer in db.query(Record).filter_by(kind='sales_offer',lead_id=lead.id):
            if offer.data.get('source_turn')==job.data.get('turn_id') and job.data.get('turn_id'):
                offer.data={**offer.data,'delivered_at':time.time(),'sent_message_id':'sent:'+provider_id}
        job.data={**job.data,'provider_id':provider_id,'dispatching':False}
        for attempt in db.query(Record).filter_by(kind='send_attempt',lead_id=lead.id):
            if attempt.data.get('job_id')==job.id:attempt.data={**attempt.data,'status':'accepted','provider_id':provider_id}
        finish_delivery(db,lead.id,now);db.commit()
    except Exception as error:
        db.rollback()
        retry_after=0;restricted=False
        if isinstance(error,httpx.HTTPStatusError):
            try:retry_after=int(error.response.headers.get('retry-after','0'))
            except ValueError:retry_after=300
            restricted=error.response.status_code in (401,403)
            if error.response.status_code==429:retry_after=max(300,retry_after)
        finish_delivery(db,lead.id,now,error,retry_after,restricted);db.commit();raise
    finally:clear_typing(lead.phone)

def finish_delivery(db,lead_id,started,error=None,retry_after=0,restricted=False):
    transport_result(db,error,retry_after,restricted)
    runtime=delivery(db,lock=True);state=dict(runtime.data);finished=time.time()
    state['last_send']=finished;state['contacts']={**state.get('contacts',{}),lead_id:finished}
    state['attempts']=[finished if t==started else t for t in state.get('attempts',[])]
    runtime.data=state

def execute_claim(job_id,owner):
    with Session() as db:
        job=db.get(Job,job_id)
        if not job or job.owner!=owner or job.status!='running' or job.lease_until<=time.time():return
        try:
            process(db,job)
            with db.no_autoflush:
                current_owner=db.execute(select(Job.owner).where(Job.id==job.id)).scalar_one()
            if current_owner!=owner:db.rollback();return
            if job.status=='running':job.status='done'
            job.owner='';job.lease_until=0
            db.commit()
        except Exception as error:
            db.rollback();job=db.get(Job,job_id)
            # Provider failure bodies may contain customer data or credentials: log only exception type.
            job.error=type(error).__name__+(': '+str(error) if isinstance(error,RuleError) else '')
            if job.owner!=owner:return
            if job.kind=='send':
                job.status='review'
                add_record(db,'alert',job.lead_id,{'reason':'Envío no confirmado; verificar antes de repetir para evitar duplicados.','job_id':job.id})
            elif job.kind=='respond' and (db.get(Lead,job.lead_id).generation!=job.data.get('generation') or db.get(Lead,job.lead_id).paused):job.status='cancelled'
            elif job.attempts>=3 or isinstance(error,RuleError):
                job.status='failed'
                lead=db.get(Lead,job.lead_id) if job.lead_id else None
                if lead:handoff(db,lead,'Automatización requiere revisión: '+job.error)
                else:add_record(db,'alert','',{'reason':job.error,'job_id':job.id})
            else:job.status='pending';job.due=time.time()+min(300,30*job.attempts)
            job.owner='';job.lease_until=0
            db.commit();log.warning('Job %s %s',job_id,job.error)

def once(lane='maintenance'):
    with Session.begin() as db:claimed=claim(db,lane)
    if claimed:execute_claim(*claimed)
    return bool(claimed)

def recovery():
    with Session.begin() as db:
        recover(db)

def housekeeping(active):
    now=time.time();clear_phone=None
    with Session.begin() as db:
        for job_id,owner in active:
            db.query(Job).filter_by(id=job_id,owner=owner,status='running').update({'lease_until':now+LEASE_SECONDS})
        recover(db,now)
        runtime=delivery(db,lock=True);typing=runtime.data.get('typing_job')
        if typing:
            job=db.get(Job,typing)
            lead=db.get(Lead,job.lead_id) if job else None
            paused=pacing(db)['automatic_paused'] and job and not job.data.get('human')
            if paused or not job or job.status=='cancelled' or not permitted(db,job,lead):
                if job:
                    job.status='pending' if paused else 'cancelled'
                    if paused:job.due=now+15;job.data={k:v for k,v in job.data.items() if k!='phase'}
                clear_phone=lead.phone if lead else None
                runtime.data={**runtime.data,'typing_job':''}
        for job in db.query(Job).filter(Job.kind.in_(['respond','send','audio']),Job.status.in_(['pending','running'])):
            if now-job.data.get('first_inbound',job.due)>300 and not db.get(Record,'wait-alert:'+job.id):
                db.add(Record(id='wait-alert:'+job.id,kind='alert',lead_id=job.lead_id,data={'reason':'Conversación pendiente durante más de cinco minutos.','job_id':job.id}))
    if clear_phone:clear_typing(clear_phone)

def poll_connection():
    try:state=connection_state()
    except Exception:state='unknown'
    with Session.begin() as db:
        runtime=delivery(db,lock=True);old=runtime.data
        since=old.get('connected_since',0) if old.get('connection')=='open' else time.time()
        runtime.data={**old,'connection':state,'connected_since':since if state=='open' else 0,'restricted':old.get('restricted',False) or state=='mismatch'}

def run():
    pools={'respond':ThreadPoolExecutor(2),'send':ThreadPoolExecutor(1),'maintenance':ThreadPoolExecutor(1)}
    futures={};heartbeat=0;connection_poll=0
    stopping=threading.Event()
    signal.signal(signal.SIGTERM,lambda *_:stopping.set())
    signal.signal(signal.SIGINT,lambda *_:stopping.set())
    while not stopping.is_set() or futures:
        try:
            for future in list(futures):
                if future.done():
                    try:future.result()
                    except Exception:log.exception('Worker task failed')
                    del futures[future]
            now=time.time()
            # Check cancelled typing promptly; renew active leases at most every 15 seconds.
            housekeeping(list(futures.values()) if now-heartbeat>=15 else [])
            if now-heartbeat>=15:heartbeat=now
            if now-connection_poll>=15:poll_connection();connection_poll=now
            for lane,pool in pools.items():
                if stopping.is_set():continue
                local_limit=2 if lane=='respond' else 1
                if sum(1 for f,(j,o) in futures.items() if getattr(f,'scorus_lane',None)==lane)>=local_limit:continue
                with Session.begin() as db:claimed=claim(db,lane)
                if claimed:
                    future=pool.submit(execute_claim,*claimed);future.scorus_lane=lane;futures[future]=claimed
            time.sleep(.5)
        except Exception:log.exception('Worker cycle failed');time.sleep(2)
    for pool in pools.values():pool.shutdown(wait=True)

if __name__=='__main__':
    logging.basicConfig(level=logging.INFO);init();recovery()
    run()
