"""Durable conversation scheduling. PostgreSQL owns concurrency and delivery budgets."""
import math
import time
import uuid
from sqlalchemy import select
from .store import Config, Job, Lead, Record, add_record, enqueue

DEFAULT_PACING={'enabled':True,'inference_limit':2,'quiet_seconds':6,'batch_seconds':25,
    'global_gap':10,'contact_gap':12,'minute_limit':6,'hour_limit':120,
    'read_receipts':True,'typing':True,'automatic_paused':False}
LEASE_SECONDS=180

def pacing(db):
    return {**DEFAULT_PACING,**db.get(Config,'settings').data.get('pacing',{})}

def validate_pacing(values):
    from .domain import require
    require(isinstance(values,dict) and set(values)<=set(DEFAULT_PACING),'Ritmo no permitido.')
    ranges={'inference_limit':(1,2),'quiet_seconds':(2,15),'batch_seconds':(15,60),
        'global_gap':(10,120),'contact_gap':(12,180),'minute_limit':(1,6),'hour_limit':(1,120)}
    for key,value in values.items():
        if key in ranges:
            low,high=ranges[key];require(type(value) is int and low<=value<=high,'Valor de ritmo fuera de los límites iniciales: '+key)
        else: require(type(value) is bool,'El control '+key+' requiere un valor booleano.')
    # The delivery guard cannot be disabled through a UI setting.
    require(values.get('enabled',True),'El control de envíos debe permanecer activo.')
    return values

def delivery(db,lock=False):
    query=select(Config).where(Config.id=='delivery')
    if lock:query=query.with_for_update()
    return db.execute(query).scalar_one()

def unanswered(db,lead_id):
    records=db.query(Record).filter_by(kind='message',lead_id=lead_id).order_by(Record.created,Record.id).all()
    return [r for r in records if r.data.get('direction')=='in' and not r.data.get('answered')]

def queue_turn(db,lead,external_id):
    db.flush()
    pending=unanswered(db,lead.id)
    if not pending:return
    cfg=pacing(db);first=pending[0].created
    due=min(time.time()+cfg['quiet_seconds'],first+cfg['batch_seconds'])
    return enqueue(db,'respond:'+external_id,'respond',lead.id,{'generation':lead.generation,'first_inbound':first},due)

def response_target(chars,first):
    return min(40,20+math.ceil(chars/100)) if first else min(25,10+math.ceil(chars/120))

def typing_seconds(text):return max(2,min(6,math.ceil(len(text)/100)))

def priority(job):
    if job.data.get('human') or job.data.get('category')=='transactional' or job.data.get('template') in ('payment_confirmed','appointment_reminder'):return 0
    return 2 if job.data.get('commercial') else 1

def permitted(db,job,lead):
    if not lead or lead.opted_out or not lead.consent.get('contact'):return False
    if pacing(db)['automatic_paused'] and not job.data.get('human'):return False
    if lead.paused and not (job.data.get('human') or job.data.get('system')):return False
    if (job.data.get('commercial') or job.data.get('guard_generation')) and lead.generation!=job.data.get('generation'):return False
    if job.data.get('category')=='marketing' or (job.data.get('commercial') and job.data.get('template')!='payment_reminder'):
        if not lead.consent.get('marketing'):return False
    if job.data.get('expires_at',float('inf'))<=time.time() or job.data.get('hold_until',float('inf'))<=time.time():return False
    return True

def budget_due(state,cfg,lead_id,now):
    attempts=sorted(t for t in state.get('attempts',[]) if t>now-3600)
    minute=[t for t in attempts if t>now-60]
    due=max(now,state.get('last_send',0)+cfg['global_gap'],state.get('contacts',{}).get(lead_id,0)+cfg['contact_gap'],state.get('pause_until',0))
    if len(minute)>=cfg['minute_limit']:due=max(due,minute[-cfg['minute_limit']]+60)
    if len(attempts)>=cfg['hour_limit']:due=max(due,attempts[-cfg['hour_limit']]+3600)
    return due

def claim(db,lane,now=None):
    now=time.time() if now is None else now
    runtime=delivery(db,lock=True) # serializes claims across all worker processes
    cfg=pacing(db)
    running=db.query(Job).filter(Job.status=='running',Job.lease_until>now).all()
    if lane=='respond' and (cfg['automatic_paused'] or sum(j.kind=='respond' for j in running)>=cfg['inference_limit']):return None
    if lane=='send' and any(j.kind=='send' for j in running):return None
    query=db.query(Job).filter(Job.status=='pending',Job.due<=now)
    if lane in ('respond','send'):query=query.filter(Job.kind==lane)
    else:query=query.filter(~Job.kind.in_(['respond','send']))
    candidates=query.order_by(Job.due,Job.id).limit(200).all()
    if lane=='send':
        typing=runtime.data.get('typing_job')
        if typing:
            current=db.get(Job,typing)
            if current and current.status=='pending':candidates=[j for j in candidates if j.id==typing]
            else:runtime.data={**runtime.data,'typing_job':''}
        contacts=runtime.data.get('contacts',{})
        candidates.sort(key=lambda j:(priority(j),contacts.get(j.lead_id,0),j.due,j.id))
        if cfg['automatic_paused']:candidates=[j for j in candidates if j.data.get('human')]
    for job in candidates:
        if lane=='respond':
            if any(j.lead_id==job.lead_id and (j.kind=='respond' or (j.kind=='send' and j.data.get('dispatching'))) for j in running):continue
            lead=db.get(Lead,job.lead_id)
            if not lead or lead.paused or lead.opted_out or lead.generation!=job.data.get('generation'):
                job.status='cancelled';continue
        job.status='running';job.owner=str(uuid.uuid4());job.lease_until=now+LEASE_SECONDS
        if not job.data.get('phase'):job.attempts+=1
        db.flush();return (job.id,job.owner)
    return None

def recover(db,now=None):
    now=time.time() if now is None else now
    delivery(db,lock=True)
    for job in db.query(Job).filter(Job.status=='running',Job.lease_until<=now).with_for_update():
        if job.kind=='send' and (job.data.get('dispatching') or not job.owner):
            job.status='review';add_record(db,'alert',job.lead_id,{'reason':'Envío interrumpido; verificar entrega antes de repetir.','job_id':job.id})
        else:job.status='pending'
        job.owner='';job.lease_until=0

def transport_result(db,error=None,retry_after=0,restricted=False):
    runtime=delivery(db,lock=True);state=dict(runtime.data);now=time.time()
    if not error:state['failures']=[]
    else:
        failures=[t for t in state.get('failures',[]) if t>now-300]+[now]
        state['failures']=failures
        if len(failures)>=3 or retry_after:state['pause_until']=max(state.get('pause_until',0),now+max(300,retry_after))
        if restricted:state['restricted']=True
        if len(failures)==3 or restricted or retry_after:
            add_record(db,'alert','',{'reason':'Salida de WhatsApp pausada por errores o restricción; revisar conexión.','restricted':restricted})
    runtime.data=state

def queue_snapshot(db):
    now=time.time();jobs=db.query(Job).filter(Job.status.in_(['pending','running','review'])).all();runtime=delivery(db).data
    leads={}
    labels={'respond':'preparando','send':'pendiente de envío','audio':'preparando'}
    for j in jobs:
        if j.status=='review':state='revisión'
        elif j.kind=='respond' and j.status=='pending':state='agrupando' if j.due>now else 'en cola'
        else:state=labels.get(j.kind,'gestión pendiente')
        if j.kind in ('respond','send','audio'):
            item={'state':state,'estimated_wait_seconds':max(0,round(j.due-now)),'age_seconds':round(max(0,now-j.data.get('first_inbound',j.due)))}
            if j.lead_id not in leads or j.kind=='respond':leads[j.lead_id]=item
    pending=[j for j in jobs if j.kind in ('respond','send','audio') and j.status in ('pending','running')]
    return {'pending':len(pending),'running_inferences':sum(j.kind=='respond' and j.status=='running' for j in jobs),
        'review':sum(j.status=='review' for j in jobs),'connection':runtime.get('connection','unknown'),
        'pause_until':runtime.get('pause_until',0),'restricted':runtime.get('restricted',False),'leads':leads}
