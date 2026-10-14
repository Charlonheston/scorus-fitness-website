"""Sales behaviour adapted from the boats department; customer intent stays in code."""
import re
import time
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from .store import Job, Record, add_record, enqueue

POLICY_VERSION='scorus-sales-2026-10-14.1'
PAUSE=r'\b(lo pienso|lo pensar[eé]|pensarlo|d[eé]jame pensar|lo consulto|consultarlo|te digo|te escribo|m[aá]s adelante|a[uú]n no|todav[ií]a no|let me think|think about it|i.ll let you know|not yet|later|[aá]tgondolom|k[eé]s[oő]bb)\b'
DECLINE=r'^\s*(no|no gracias|no me interesa|not interested|no thanks|nem [eé]rdekel)[.!]?\s*$|\b(he contratado (?:otra|otro)|ya tengo (?:otro|otra)|eleg[ií] (?:otro|otra)|chose another)\b'
PURCHASE=r'\b(quiero (?:contratar|pagar|empezar|reservar)|c[oó]mo (?:pago|contrato|lo hacemos)|vamos a (?:contratar|empezar|por ello)|adelante|lo contratamos|reservamos|env[ií]a(?:me)?.{0,25}(?:enlace|link).{0,15}pago|repetir.{0,20}(?:enlace|link)|rep[eé]ti(?:r|rme|me).{0,20}(?:enlace|link)|i want to (?:pay|join|start)|how (?:do i|can i) (?:pay|join)|let.s (?:do it|proceed)|payment link|szeretn[eé]k (?:fizetni|csatlakozni)|kezdj[uü]k el)\b'
INTEREST=r'\b(core|elite|precio|cuesta|incluye|programa|entrenamiento|asesor[ií]a|quiero informaci[oó]n|pricing|programme|training|edz[eé]s)\b'


def intent(text):
    if re.search(DECLINE,text,re.I):return 'declined'
    if re.search(PAUSE,text,re.I):return 'deferred'
    if re.search(PURCHASE,text,re.I):return 'purchase'
    if re.search(INTEREST,text,re.I):return 'interested'
    return 'conversation'


def turn_text(db,lead,turn_id=None):
    job=db.get(Job,turn_id) if turn_id else None
    ids=job.data.get('message_ids',[]) if job and job.lead_id==lead.id else []
    rows=[db.get(Record,identifier) for identifier in ids]
    rows=[r for r in rows if r and r.lead_id==lead.id and r.data.get('direction')=='in']
    if not rows:
        rows=db.query(Record).filter_by(kind='message',lead_id=lead.id).order_by(Record.created.desc()).all()
        rows=next(([r] for r in rows if r.data.get('direction')=='in'),[])
    return '\n'.join(r.data.get('text','') for r in rows)


def timezone_for(lead):
    value=lead.profile.get('timezone','Europe/Madrid')
    try:ZoneInfo(value);return value
    except (ValueError,KeyError,TypeError):return 'Europe/Madrid'


def language_for(text,previous='es'):
    explicit=[('es',r'(en espa[nñ]ol|en castellano|speak spanish)'),('en',r'(in english|en ingl[eé]s|angolul)'),('hu',r'(magyarul|en h[uú]ngaro|in hungarian)')]
    for language,pattern in explicit:
        if re.search(pattern,text,re.I):return language
    words={'es':r'\b(hola|quiero|tengo|cu[aá]nto|precio|gracias|entreno|incluye|llamada|puedo|meses|s[ií])\b',
           'en':r'\b(hello|hi|please|price|thanks|thank|want|training|months|call|included|would)\b',
           'hu':r'\b(szia|szeretn[eé]k|k[oö]sz[oö]n[oö]m|edz[eé]s|[aá]r|h[oó]nap|id[oő]pont|igen)\b'}
    scores={key:len(re.findall(pattern,text,re.I)) for key,pattern in words.items()}
    best=max(scores,key=scores.get)
    return best if scores[best]>0 and list(scores.values()).count(scores[best])==1 else previous


def requested_time(text,now,tz):
    local=datetime.fromtimestamp(now,ZoneInfo(tz))
    lower=text.lower();days=None
    if 'pasado mañana' in lower:days=2
    elif re.search(r'\b(mañana|tomorrow|holnap)\b',lower):days=1
    elif re.search(r'semana que viene|next week|jövő héten',lower):days=7
    else:
        relative=re.search(r'\ben (\d{1,2}) d[ií]as\b',lower)
        if relative and 1<=int(relative[1])<=30:days=int(relative[1])
        weekdays=[r'lunes|monday|hétfő',r'martes|tuesday|kedd',r'mi[eé]rcoles|wednesday|szerda',r'jueves|thursday|csütörtök',r'viernes|friday|péntek',r's[aá]bado|saturday|szombat',r'domingo|sunday|vasárnap']
        for weekday,name in enumerate(weekdays):
            if re.search(r'\b(?:'+name+r')\b',lower):days=(weekday-local.weekday())%7 or 7;break
    if days is None:return None
    hour,minute=10,15
    clock=re.search(r'(?:a las|at)\s+(\d{1,2})(?::(\d{2}))?',lower)
    if clock and int(clock[1])<24 and int(clock[2] or 0)<60:hour,minute=int(clock[1]),int(clock[2] or 0)
    return (local+timedelta(days=days)).replace(hour=hour,minute=minute,second=0,microsecond=0).timestamp()


def ingest(lead,text,now=None):
    now=time.time() if now is None else now
    lead.language=language_for(text,lead.language)
    context=dict(lead.profile.get('commercial_context',{}));kind=intent(text)
    context.update(last_intent=kind,last_customer_at=now,followup_pending=False)
    lead.followups=0
    if kind in ('deferred','declined'):
        context.update(status='dormant',defer_until=requested_time(text,now,timezone_for(lead)),
                       followup_requested=bool(re.search(r'escr[ií]beme|cont[aá]ctame|recu[eé]rdame|write to me|remind me|keress',text,re.I)))
        if kind=='declined' and lead.state not in ('paid','active','ended'):lead.state='not_interested'
        if kind=='declined':context['lost_reason']=text[:200]
    elif kind in ('purchase','interested'):
        context.update(status='negotiating',defer_until=None,followup_requested=False)
        if lead.state=='not_interested':lead.state='new'
    # A direct request to be contacted later is a deferral even without "lo pienso".
    if re.search(r'escr[ií]beme|cont[aá]ctame|recu[eé]rdame|write to me|remind me|keress',text,re.I):
        target=requested_time(text,now,timezone_for(lead))
        if target:context.update(status='dormant',defer_until=target,followup_requested=True,last_intent='deferred')
    lead.profile={**lead.profile,'commercial_context':context}


def context_for(db,lead,turn_id):
    text=turn_text(db,lead,turn_id);context=dict(lead.profile.get('commercial_context',{}))
    current=intent(text)
    return {**context,'current_intent':current,'customer':lead.state in ('paid','active','ended'),
            'may_prepare_payment':current=='purchase','followup_cap_without_reply':1,'policy_version':POLICY_VERSION}


def schedule_followup(db,lead,now=None,reason='offer',due=None,requested=False):
    from .domain import DAY, latest_contract, next_sales_window
    now=time.time() if now is None else now
    context=lead.profile.get('commercial_context',{})
    if lead.paused or lead.opted_out or lead.followups>=1 or lead.state in ('paid','active','ended','not_interested'):return
    if not lead.consent.get('contact') or (not requested and not lead.consent.get('marketing')):return
    if context.get('status')=='dormant' and due is None:return
    contract=latest_contract(db,lead)
    if contract and contract.data.get('status') in ('held','checkout') and contract.data.get('hold_until',0)>now:return
    existing=db.query(Job).filter_by(lead_id=lead.id).filter(Job.status.in_(['pending','running','review'])).all()
    if any(j.kind=='followup' or j.data.get('sales_followup') for j in existing):return
    due=next_sales_window(due or now+20*60,timezone_for(lead))
    job=enqueue(db,f'sales-followup:{lead.id}:{lead.generation}','followup',lead.id,{
        'policy_version':POLICY_VERSION,'generation':lead.generation,'reason':reason,'customer_requested':requested,'expires_at':due+DAY},due)
    lead.profile={**lead.profile,'commercial_context':{**context,'followup_pending':True,'followup_due':due}}
    return job


def after_reply(db,lead,job,now=None):
    now=time.time() if now is None else now
    if lead.generation!=job.data.get('generation'):return
    context=dict(lead.profile.get('commercial_context',{}))
    if job.data.get('sales_followup'):
        lead.followups+=1
        context.update(status='dormant',followup_pending=False,last_followup_at=now)
        lead.profile={**lead.profile,'commercial_context':context}
        return
    if job.data.get('category')!='conversation':return
    text=job.data['text'];customer_text=turn_text(db,lead,job.data.get('turn_id'))
    kind=intent(customer_text)
    # Only an offer actually accepted by the messaging provider starts a follow-up clock.
    price=bool(re.search(r'\b(core|elite)\b',text,re.I) and re.search(r'\d\s*€|€\s*\d|\d\s*EUR',text,re.I))
    if price:context.update(offer_presented=True,last_offer_at=now)
    if re.search(r'caro|precio|cost|expensive',customer_text,re.I):context['objection']='price'
    elif re.search(r'tiempo|trabajo|time|busy',customer_text,re.I):context['objection']='time'
    lead.profile={**lead.profile,'commercial_context':context}
    if kind in ('deferred','declined'):
        if context.get('followup_requested') and context.get('defer_until'):
            schedule_followup(db,lead,now,'requested',context['defer_until'],True)
        elif re.search(PURCHASE,customer_text,re.I) and lead.consent.get('marketing'):
            schedule_followup(db,lead,now,'hot_decision',context.get('defer_until') or now+86400)
        return
    if price:schedule_followup(db,lead,now,context.get('objection','offer'))


def followup_text(lead,reason):
    messages={
        'es':{'price':'¿Cómo ves la propuesta? Si te queda alguna duda, me dices.','time':'¿Te quedó alguna duda sobre cómo encajarlo en tu semana?','offer':'¿Te quedó alguna duda sobre las opciones?','hot_decision':'¿Pudiste mirarlo con calma? Cualquier duda, me dices.','requested':'Hola, retomamos lo de Scorus como me pediste. ¿Qué te gustaría aclarar?'},
        'en':{'price':'How does the offer look? Let me know if you have any questions.','time':'Any questions about fitting it into your week?','offer':'Any questions about the options?','hot_decision':'Did you have a chance to think it over? Happy to help with any questions.','requested':'Hi, following up on Scorus as you asked. What would you like to clarify?'},
        'hu':{'price':'Mit gondolsz az ajánlatról? Ha van kérdésed, szólj.','time':'Maradt kérdésed arról, hogyan férne bele a hetedbe?','offer':'Maradt kérdésed a lehetőségekről?','hot_decision':'Sikerült átgondolnod? Ha van kérdésed, szólj.','requested':'Szia, ahogy kérted, folytatjuk a Scorus témáját. Mit szeretnél tisztázni?'}}
    language=messages.get(lead.language,messages['es'])
    return language.get(reason,language['offer'])
