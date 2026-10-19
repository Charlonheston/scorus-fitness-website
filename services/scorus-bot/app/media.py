"""Approved gym photos, scoped to a customer and delivered through the normal queue."""
import re
import time
from .domain import CATALOG, require
from .store import Job, Record, enqueue
from .conversation import intent, turn_text


def gallery():
    return CATALOG['other_services']['in_person']['gallery']


def asset(media_id):
    item=next((p for p in gallery()['photos'] if p['id']==media_id),None)
    require(item is not None,'Fotografía no autorizada.')
    require(re.fullmatch(r'https://scorusfitness\.com/images/gym/gym-\d{2}\.jpg',item['url']) is not None,'Origen de fotografía no autorizado.')
    return item


def gallery_jobs(db,lead):
    return [j for j in db.query(Job).filter_by(lead_id=lead.id,kind='send') if j.data.get('gallery_version')==gallery()['version']]


def media_ids(job):
    return job.data.get('media_ids') or ([job.data['media_id']] if job.data.get('media_id') else [])


def gallery_status(db,lead):
    accepted=set();uncertain=set();pending=set()
    for job in gallery_jobs(db,lead):
        ids=set(media_ids(job))
        done=set(job.data.get('accepted_media_ids',[])) if job.data.get('media_ids') else ids if job.data.get('provider_id') else set()
        accepted.update(done)
        if job.status=='review':uncertain.update(ids-done)
        if job.status in ('pending','running'):pending.update(ids-done)
    return {'total':len(gallery()['photos']),'accepted':len(accepted),'pending':len(pending),
            'uncertain':len(uncertain),'declined':bool(lead.profile.get('gym_photos_opt_out')),
            'page_url':gallery()['page_url']}


def cancel_gallery(db,lead):
    for job in gallery_jobs(db,lead):
        if job.status in ('pending','running') and not job.data.get('dispatching'):job.status='cancelled'


def media_preference(db,lead,text):
    # "No photos" stops only the gallery, not replies or the customer's contact consent.
    decline=re.search(r'\b(?:no\b.{0,35}(?:fotos|fotograf[ií]as|im[aá]genes)|(?:no|don.t)\b.{0,25}(?:photos|pictures|images)|(?:ne k[uü]ldj|nem k[eé]rek).{0,25}(?:fot[oó]|k[eé]p))',text,re.I)
    request=re.search(r'(?:(?:m[aá]nda|env[ií]a|p[aá]sa|ver|ense[nñ]a|quiero).{0,25}(?:fotos|fotograf[ií]as|im[aá]genes)|(?:send|see|show).{0,25}(?:photos|pictures|images)|(?:k[uü]ldj|mutass).{0,25}(?:fot[oó]|k[eé]p))',text,re.I)
    if decline:lead.profile={**lead.profile,'gym_photos_opt_out':True}
    elif request:lead.profile={**lead.profile,'gym_photos_opt_out':False}
    if decline or intent(text) in ('declined','deferred'):
        cancel_gallery(db,lead)


def prepare_gallery(db,lead,turn_id):
    require(lead.consent.get('contact') and not lead.paused and not lead.opted_out,'Envío sin permiso.')
    status=gallery_status(db,lead)
    require(not status['declined'],'El cliente ha pedido que no se envíen fotos.')
    require(intent(turn_text(db,lead,turn_id)) not in ('declined','deferred'),'El cliente ha aplazado o rechazado la propuesta.')
    explicit_repeat=bool(re.search(r'(?:m[aá]nda|env[ií]a|p[aá]sa|ver|ense[nñ]a|send|show|k[uü]ldj|mutass).{0,35}(?:fotos|fotograf[ií]as|im[aá]genes|galer[ií]a|[aá]lbum|photos|pictures|images|fot[oó]|k[eé]p)',turn_text(db,lead,turn_id),re.I))
    repeat=explicit_repeat and status['accepted']==status['total'] and not status['pending'] and not status['uncertain']
    if not repeat and status['accepted']+status['pending']+status['uncertain']>=status['total']:
        return {'status':'already_shared_or_queued',**status}
    identifier='gym-request:'+turn_id
    if not db.get(Record,identifier):
        db.add(Record(id=identifier,kind='media_request',lead_id=lead.id,data={
            'turn_id':turn_id,'generation':lead.generation,'gallery_version':gallery()['version'],'status':'prepared','repeat':repeat}))
    return {'status':'prepared','count':status['total'] if repeat else status['total']-status['accepted']-status['pending']-status['uncertain'],
            'next_action':'Responde a la consulta actual; si pide tarifas, explícalas. La galería se enviará en un único álbum después de tu respuesta; aún no se ha enviado.',**status}


def activate_gallery(db,lead,reply):
    """Called only after the explanatory text was accepted by the provider."""
    turn_id=reply.data.get('turn_id')
    request=db.get(Record,'gym-request:'+turn_id) if turn_id else None
    if not request or request.lead_id!=lead.id or request.data.get('status')!='prepared':return
    if lead.paused or lead.opted_out or lead.profile.get('gym_photos_opt_out') or lead.generation!=request.data['generation']:
        request.data={**request.data,'status':'cancelled'};return
    covered=set()
    if not request.data.get('repeat'):
        for job in gallery_jobs(db,lead):
            if job.data.get('provider_id') or job.status in ('pending','running','review'):covered.update(media_ids(job))
    ids=[p['id'] for p in gallery()['photos'] if p['id'] not in covered]
    queue_album(db,lead,ids,'gym:'+request.id)
    request.data={**request.data,'status':'queued','queued_at':time.time()}


def queue_album(db,lead,ids,key,expires=None):
    if not ids:return
    captions={'es':'Instalaciones de Scorus Fitness · Alicante','en':'Scorus Fitness gym · Alicante','hu':'Scorus Fitness edzőterem · Alicante'}
    payload={'text':captions.get(lead.language,captions['es']),'gallery_version':gallery()['version'],
             'category':'gallery','expires_at':expires or time.time()+3600,'generation':lead.generation}
    if len(ids)==1:payload['media_id']=ids[0]
    else:payload.update(media_ids=ids,album_request_id=key)
    return enqueue(db,key,'send',lead.id,payload)


def record_album_result(db,lead,job,result):
    album=result.get('scorus_album') or {};items=album.get('items') or []
    ids=job.data['media_ids'];accepted=[]
    parent=(result.get('key') or {}).get('id')
    for item in items:
        identifier=(item.get('key') or {}).get('id');media_id=item.get('media_id')
        require(media_id in ids and isinstance(identifier,str) and identifier and media_id not in accepted,'Resultado de álbum inválido.')
        accepted.append(media_id)
        if not db.get(Record,'sent:'+identifier):
            receipt=db.get(Record,'receipt:'+identifier)
            db.add(Record(id='sent:'+identifier,kind='provider_message',lead_id=lead.id,data={
                'direction':'out','media_id':media_id,'provider_id':identifier,'album_parent':parent,
                'delivery_status':receipt.data.get('status') if receipt else 'accepted'}))
    complete=album.get('status')=='accepted' and set(accepted)==set(ids) and isinstance(parent,str) and bool(parent)
    job.data={**job.data,'accepted_media_ids':accepted,'dispatching':False,**({'provider_id':parent} if parent else {})}
    if parent and not db.get(Record,'sent:'+parent):
        db.add(Record(id='sent:'+parent,kind='message',lead_id=lead.id,data={
            'direction':'out','text':job.data['text'],'media_ids':ids,'gallery_version':job.data['gallery_version'],
            'provider_id':parent,'delivery_status':'accepted' if complete else 'review','accepted_media_ids':accepted}))
    if not complete:
        job.status='review';job.error='AlbumUnconfirmed'
        from .store import add_record
        add_record(db,'alert',lead.id,{'reason':'Álbum pendiente de verificar. No se repetirá automáticamente para evitar duplicados.','job_id':job.id,'accepted_photos':len(accepted),'total_photos':len(ids)})
    return complete


def migrate_pending_galleries(db):
    # Only unstarted legacy photo jobs are combined; accepted/uncertain sends are untouched.
    from .store import Lead
    groups={}
    for job in db.query(Job).filter_by(kind='send',status='pending'):
        if job.data.get('media_id') and job.data.get('gallery_version')==gallery()['version'] and not job.data.get('dispatching'):
            groups.setdefault(job.lead_id,[]).append(job)
    for lead_id,jobs in groups.items():
        if len(jobs)<2:continue
        lead=db.get(Lead,lead_id)
        if not lead or lead.paused or lead.opted_out:continue
        ids=[p['id'] for p in gallery()['photos'] if p['id'] in {j.data['media_id'] for j in jobs}]
        for job in jobs:job.status='cancelled';job.data={**job.data,'replaced_by_album':True}
        queue_album(db,lead,ids,'album-migration:'+min(j.id for j in jobs),min(j.data.get('expires_at',time.time()+3600) for j in jobs))
