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


def gallery_status(db,lead):
    jobs=gallery_jobs(db,lead)
    accepted={j.data['media_id'] for j in jobs if j.data.get('provider_id')}
    uncertain={j.data['media_id'] for j in jobs if j.status=='review' and not j.data.get('provider_id')}
    pending={j.data['media_id'] for j in jobs if j.status in ('pending','running') and not j.data.get('provider_id')}
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
    if status['accepted']+status['pending']+status['uncertain']>=status['total']:
        return {'status':'already_shared_or_queued',**status}
    identifier='gym-request:'+turn_id
    if not db.get(Record,identifier):
        db.add(Record(id=identifier,kind='media_request',lead_id=lead.id,data={
            'turn_id':turn_id,'generation':lead.generation,'gallery_version':gallery()['version'],'status':'prepared'}))
    return {'status':'prepared','count':status['total']-status['accepted']-status['pending']-status['uncertain'],
            'next_action':'Explica las tarifas presenciales. Las fotos se pondrán en cola después de esa respuesta; aún no se han enviado.',**status}


def activate_gallery(db,lead,reply):
    """Called only after the explanatory text was accepted by the provider."""
    turn_id=reply.data.get('turn_id')
    request=db.get(Record,'gym-request:'+turn_id) if turn_id else None
    if not request or request.lead_id!=lead.id or request.data.get('status')!='prepared':return
    if lead.paused or lead.opted_out or lead.profile.get('gym_photos_opt_out') or lead.generation!=request.data['generation']:
        request.data={**request.data,'status':'cancelled'};return
    existing=gallery_jobs(db,lead)
    covered={j.data['media_id'] for j in existing if j.data.get('provider_id') or j.status in ('pending','running','review')}
    captions={'es':'Instalaciones de Scorus Fitness · Alicante','en':'Scorus Fitness gym · Alicante','hu':'Scorus Fitness edzőterem · Alicante'}
    now=time.time()
    for index,photo in enumerate(gallery()['photos']):
        if photo['id'] in covered:continue
        enqueue(db,f"gym:{lead.id}:{request.id}:{photo['id']}",'send',lead.id,{
            'text':captions.get(lead.language,captions['es'])+f" · {index+1}/{len(gallery()['photos'])}",
            'media_id':photo['id'],'gallery_version':gallery()['version'],'category':'gallery',
            'expires_at':now+3600,'generation':lead.generation},now+index*.001)
    request.data={**request.data,'status':'queued','queued_at':now}
