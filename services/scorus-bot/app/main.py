import hashlib
import hmac
import json
import os
import re
import time
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse, Response
from starlette.concurrency import run_in_threadpool
from pydantic import BaseModel, ConfigDict, Field, field_validator
import stripe
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select, text as sql_text
from .store import Config, Job, Lead, Record, Session, add_record, enqueue, init
from .domain import CATALOG, PROGRAMS, DAY, RuleError, activate, approve, cancel_sales, handoff, latest_contract, message, paid_contract, phone_number, require, schedule_followups, settings, token_scope
from .providers import book, checkout, slots
from .queueing import delivery, pacing, queue_snapshot, queue_turn, validate_pacing

@asynccontextmanager
async def lifespan(app):
    init()
    yield

app=FastAPI(title='Scorus Team',docs_url=None,redoc_url=None,openapi_url=None,lifespan=lifespan)

@app.exception_handler(RuleError)
async def rule_error(request,error):
    return JSONResponse({'error':str(error)},status_code=409)

def bearer(request,env):
    expected=os.getenv(env,'')
    supplied=request.headers.get('authorization','').removeprefix('Bearer ')
    if not expected or not hmac.compare_digest(supplied,expected): raise HTTPException(401,'Acceso no autorizado.')

def admin(request:Request):
    from base64 import b64decode
    raw=request.headers.get('authorization','')
    if not raw.startswith('Basic '): raise HTTPException(401,'Acceso privado.',headers={'WWW-Authenticate':'Basic realm="Scorus Team", charset="UTF-8"'})
    try: user,password=b64decode(raw[6:]).decode().split(':',1)
    except Exception: raise HTTPException(401,'Acceso privado.')
    expected=os.getenv('ADMIN_'+user.upper()+'_PASSWORD','') if user in ('carlo','bernat') else ''
    if not expected or not hmac.compare_digest(password,expected): raise HTTPException(401,'Acceso privado.',headers={'WWW-Authenticate':'Basic realm="Scorus Team"'})
    if request.method not in ('GET','HEAD'):
        origin=request.headers.get('origin')
        if origin and origin not in (str(request.base_url).rstrip('/'),os.getenv('PUBLIC_SITE_URL','https://scorusfitness.com')): raise HTTPException(403,'Origen no autorizado.')
        if request.headers.get('x-scorus-admin')!='1': raise HTTPException(403,'Falta protección de la solicitud.')
    return user

class LeadInput(BaseModel):
    model_config=ConfigDict(extra='forbid')
    name:str=Field(min_length=2,max_length=100)
    phone:str=Field(max_length=30)
    adult:bool
    contact_consent:bool
    marketing_consent:bool=False
    consent_version:str='2026-10-06.1'
    answers:dict[str,str]
    attribution:dict[str,str]=Field(default_factory=dict)
    website:str=''

    @field_validator('answers')
    @classmethod
    def answers_valid(cls,values):
        allowed={'goal':{'fat-loss','muscle','restart'},'obstacle':{'direction','consistency','time','unsure'},'experience':{'beginner','returning','regular'},'location':{'gym','home','both'},'days':{'2','3','4-plus'},'duration':{'up-to-30','30-45','45-plus'},'support':{'core','individual','guidance'},'timing':{'soon','month','exploring'}}
        if set(values)!=set(allowed) or any(v not in allowed[k] for k,v in values.items()): raise ValueError('Respuestas de cualificación inválidas.')
        return values

    @field_validator('attribution')
    @classmethod
    def attribution_valid(cls,values):
        allowed={'utm_source','utm_medium','utm_campaign','utm_content','utm_term','campaign_id','adset_id','ad_id','fbclid'}
        return {k:v[:200] for k,v in values.items() if k in allowed}

@app.get('/health')
def health():
    with Session() as db: settings(db)
    return {'status':'ok','service':'scorus','version':CATALOG['version']}

@app.get('/api/public/status')
def public_status():
    with Session() as db:
        cfg=settings(db)
        return {'form_enabled':cfg['public_form_enabled'],'test_mode':cfg['mode']=='test','privacy_url':cfg['privacy_url']}

@app.post('/api/leads',status_code=202)
def leads(payload:LeadInput,request:Request):
    bearer(request,'FORM_API_KEY')
    require(not payload.website,'Solicitud no válida.')
    from .domain import create_lead
    with Session() as db:
        client=request.headers.get('x-scorus-client','internal')[:100]
        rate_key=hashlib.sha256((os.getenv('FORM_API_KEY','')+client).encode()).hexdigest()
        require(db.query(Record).filter(Record.kind=='form_rate',Record.lead_id==rate_key,Record.created>time.time()-3600).count()<5,'Demasiadas solicitudes. Inténtalo más adelante.')
        add_record(db,'form_rate',rate_key,{})
        result=create_lead(db,payload.model_dump())
        db.commit()
    # Never expose whether a phone already belongs to a client or its identity/state.
    return {'accepted':True,'message':'Solicitud recibida. El equipo revisará tu valoración.'}

def valid_hmac(raw,header,secret):
    require(bool(secret),'Webhook pendiente de configuración.')
    parts=dict(p.split('=',1) for p in header.split(',') if '=' in p)
    stamp=parts.get('t','')
    require(stamp.isdigit() and abs(time.time()-int(stamp))<=300,'Firma caducada.')
    digest=hmac.new(secret.encode(),stamp.encode()+b'.'+raw,hashlib.sha256).hexdigest()
    require(hmac.compare_digest(parts.get('v1',''),digest),'Firma no válida.')

@app.post('/webhooks/stripe')
async def stripe_webhook(request:Request):
    raw=await request.body(); secret=os.getenv('STRIPE_WEBHOOK_SECRET','')
    require(bool(secret),'Stripe pendiente de configuración.')
    try: event=stripe.Webhook.construct_event(raw,request.headers.get('stripe-signature',''),secret)
    except Exception: raise HTTPException(401,'Firma no válida.')
    require(bool(event.get('livemode'))==(os.getenv('SCORUS_MODE','test')=='production'),'Evento de otro entorno.')
    with Session() as db:
        enqueue(db,'stripe:'+event['id'],'stripe_event','',dict(event))
        try: db.commit()
        except IntegrityError: db.rollback()
    return {'received':True}

@app.post('/webhooks/calendly')
async def calendly_webhook(request:Request):
    raw=await request.body(); valid_hmac(raw,request.headers.get('calendly-webhook-signature',''),os.getenv('CALENDLY_WEBHOOK_SECRET',''))
    event=json.loads(raw)
    with Session() as db:
        enqueue(db,'calendly:'+hashlib.sha256(raw).hexdigest(),'calendly_event','',event)
        try: db.commit()
        except IntegrityError: db.rollback()
    return {'received':True}

def inbound(db,phone,text,external_id,from_me=False,provider_key=None):
    if db.bind.dialect.name=='postgresql':
        lock=int.from_bytes(hashlib.sha256(phone.encode()).digest()[:8],'big',signed=True)
        db.execute(sql_text('SELECT pg_advisory_xact_lock(:key)'),{'key':lock})
    lead=db.query(Lead).filter_by(phone=phone).with_for_update().first()
    if from_me:
        if lead: handoff(db,lead,'Respuesta manual desde el teléfono; pausar asistente.')
        return
    if not lead:
        cfg=settings(db)
        if cfg['mode']=='test' and not cfg.get('test_allow_inbound_any') and phone not in cfg['test_recipients']: return
        if cfg['mode']=='production' and not cfg['launch_approved']: return
        lead=Lead(phone=phone,name='Contacto WhatsApp',consent={'contact':True,'marketing':False,'source':'whatsapp_inbound','at':time.time()},profile={})
        db.add(lead);db.flush()
    if db.query(Record).filter_by(id='inbound:'+external_id).first(): return
    if re.search(r'\b(hello|hi|please|programme|program|assessment|thank you)\b',text,re.I):lead.language='en'
    if re.search(r'\b(szia|ár|szeretnék|köszönöm|edzés|programom|időpont)\b',text,re.I):lead.language='hu'
    cancel_sales(db,lead); lead.last_inbound=time.time()
    record=Record(id='inbound:'+external_id,kind='message',lead_id=lead.id,data={'direction':'in','text':text[:6000],'provider_key':provider_key,'answered':False})
    db.add(record)
    stop=bool(re.fullmatch(r'\s*(stop|baja|no me escribas(?: más)?|no quiero más mensajes|unsubscribe|leiratkozás)\s*[.!]?\s*',text,re.I))
    sensitive=bool(re.search(r'lesi[oó]n|dolor|embaraz|medicaci[oó]n|devoluci[oó]n|reembolso|reclamaci[oó]n|cancelar.*contrato|pausar.*programa|injur|refund|pregnan|fájdalom|visszatérítés',text,re.I))
    if stop:
        lead.opted_out=True
        add_record(db,'audit',lead.id,{'action':'opt_out'})
        return
    if re.fullmatch(r'\s*(no|no gracias|no me interesa|not interested|nem érdekel)[.!]?\s*',text,re.I):
        lead.state='not_interested'; return
    if sensitive: handoff(db,lead,'Consulta profesional o excepción: revisar conversación.'); return
    if lead.paused or lead.opted_out: return
    queue_turn(db,lead,external_id)
    return lead

@app.post('/webhooks/evolution')
async def evolution_webhook(request:Request):
    bearer(request,'EVOLUTION_WEBHOOK_SECRET')
    event=await request.json()
    return await run_in_threadpool(evolution_event,event)

def evolution_event(event):
    require(event.get('instance')==os.getenv('EVOLUTION_INSTANCE','scorus-test'),'Instancia ajena a Scorus.')
    event_kind=event.get('event','').lower().replace('_','.')
    if event_kind=='connection.update':
        with Session.begin() as db:
            runtime=delivery(db,lock=True);state=event.get('data',{}).get('state','close');old=runtime.data
            runtime.data={**old,'connection':state,'connected_since':old.get('connected_since',0) if state=='open' and old.get('connection')=='open' else time.time() if state=='open' else 0}
        return {'received':True}
    if event_kind=='messages.update':
        data=event.get('data',{})
        with Session.begin() as db:
            for item in data if isinstance(data,list) else [data]:
                provider_id=(item.get('key') or {}).get('id') or item.get('keyId') or item.get('id')
                if not provider_id:continue
                record=db.get(Record,'sent:'+provider_id);status=(item.get('update') or {}).get('status') or item.get('status')
                receipt=db.get(Record,'receipt:'+provider_id)
                if not receipt:db.add(Record(id='receipt:'+provider_id,kind='receipt',data={'status':status}))
                else:receipt.data={**receipt.data,'status':status}
                if record:record.data={**record.data,'delivery_status':status}
        return {'received':True}
    if event_kind=='call':
        item=event.get('data',{});remote=item.get('from','');digits=remote.split('@')[0].split(':')[0]
        if item.get('status') not in ('offer','ringing') or not re.fullmatch(r'[1-9]\d{7,14}',digits):return {'received':True}
        with Session.begin() as db:
            lead=db.query(Lead).filter_by(phone='+'+digits).with_for_update().first()
            if lead and not lead.opted_out:
                last=db.query(Record).filter_by(kind='call',lead_id=lead.id).filter(Record.created>time.time()-DAY).first()
                if not last:
                    add_record(db,'call',lead.id,{'reason':'Llamada entrante; revisar si necesita atención humana.'})
                    if not lead.paused and lead.consent.get('contact'):
                        message(db,lead,'Soy el asistente virtual de Scorus Team. Para organizar tu valoración, escríbenos por aquí.',f'call:{lead.id}:{int(time.time()//DAY)}')
        return {'received':True}
    if event_kind!='messages.upsert': return {'received':True}
    data=event.get('data',{})
    for item in data if isinstance(data,list) else [data]:
        key=item.get('key',{}); remote=key.get('remoteJid','')
        if remote.endswith('@g.us') or remote=='status@broadcast': continue
        number=key.get('remoteJidAlt') or item.get('senderPn') or remote
        if '@lid' in number:
            # LID is not a phone number: do not guess identity or attach another client's record.
            with Session.begin() as db: add_record(db,'alert','',{'reason':'Mensaje con identidad LID sin teléfono verificado; revisar mapeo Evolution.'})
            continue
        digits=number.split('@')[0].split(':')[0]
        if not re.fullmatch(r'[1-9]\d{7,14}',digits): continue
        msg=item.get('message',{}); text=msg.get('conversation') or msg.get('extendedTextMessage',{}).get('text')
        from_me=bool(key.get('fromMe'))
        with Session() as db:
            if from_me:
                # Our own sends generate fromMe too. Delivery echoes are reconciled by provider ID.
                sent=db.query(Record).filter_by(id='sent:'+key.get('id','')).first()
                if not sent: enqueue(db,'manual:'+key.get('id',''),'manual_echo','',{'phone':'+'+digits,'provider_id':key.get('id'),'text':(text or '[Respuesta multimedia desde el teléfono]')[:6000]},time.time())
            elif text: inbound(db,'+'+digits,text,key['id'],provider_key={'id':key['id'],'remoteJid':remote,'fromMe':False})
            elif msg.get('audioMessage'):
                lead=inbound(db,'+'+digits,'[Nota de voz recibida; contenido pendiente de transcripción]',key['id'],provider_key={'id':key['id'],'remoteJid':remote,'fromMe':False})
                if lead and not lead.paused and not lead.opted_out:
                    for job in db.query(Job).filter_by(lead_id=lead.id,kind='respond',status='pending'):job.status='cancelled'
                    enqueue(db,'audio:'+key['id'],'audio',lead.id,{'message':item,'record_id':'inbound:'+key['id'],'generation':lead.generation})
            elif any(k in msg for k in ('imageMessage','videoMessage','documentMessage','stickerMessage')):
                inbound(db,'+'+digits,'[Contenido multimedia recibido; no leído. Pide la consulta por texto u ofrece atención de Bernat.]',key['id'],provider_key={'id':key['id'],'remoteJid':remote,'fromMe':False})
            try: db.commit()
            except IntegrityError: db.rollback()
    return {'received':True}

@app.get('/webhooks/whatsapp')
def meta_verify(request:Request):
    token=os.getenv('META_VERIFY_TOKEN','')
    if token and hmac.compare_digest(request.query_params.get('hub.verify_token',''),token): return Response(request.query_params.get('hub.challenge',''),media_type='text/plain')
    raise HTTPException(403,'Verificación inválida.')

@app.post('/webhooks/whatsapp')
async def meta_webhook(request:Request):
    raw=await request.body(); secret=os.getenv('META_APP_SECRET','')
    signature='sha256='+hmac.new(secret.encode(),raw,hashlib.sha256).hexdigest()
    if not secret or not hmac.compare_digest(request.headers.get('x-hub-signature-256',''),signature): raise HTTPException(401,'Firma inválida.')
    for entry in json.loads(raw).get('entry',[]):
        for change in entry.get('changes',[]):
            value=change.get('value',{})
            if value.get('metadata',{}).get('phone_number_id')!=os.getenv('META_PHONE_ID'): continue
            for msg in value.get('messages',[]):
                with Session() as db:
                    if msg.get('type')=='text': inbound(db,'+'+msg['from'],msg['text']['body'],msg['id'])
                    elif msg.get('type')=='audio':
                        lead=db.query(Lead).filter_by(phone='+'+msg['from']).first()
                        if lead: enqueue(db,'audio:'+msg['id'],'audio',lead.id,{'meta_media_id':msg['audio']['id'],'external_id':msg['id']})
                    try: db.commit()
                    except IntegrityError: db.rollback()
    return {'received':True}

TOOLS={
    'get_offer':('Consultar catálogo y reglas oficiales.',{}),
    'get_profile':('Consultar solo el expediente del interlocutor.',{}),
    'update_profile':('Completar cualificación sin alterar teléfono, precio, aprobación ni contrato.',{'answers':{'type':'object'}}),
    'get_slots':('Consultar horarios publicados y autorizados.',{'kind':{'type':'string','enum':['valuation','elite','group']}}),
    'book_call':('Reservar un horario que el usuario haya elegido explícitamente.',{'kind':{'type':'string','enum':['valuation','elite','group']},'start_time':{'type':'string'},'timezone':{'type':'string'},'email':{'type':'string'}}),
    'prepare_checkout':('Preparar pago solo después de valoración y aprobación registradas.',{'payment_mode':{'type':'string','enum':['full','installments']}}),
    'request_human':('Pasar conversación a Bernat y pausar automatizaciones.',{'reason':{'type':'string'}}),
    'get_client_status':('Consultar contrato, alta y reservas propias.',{})
}

@app.post('/mcp')
async def mcp(request:Request):
    token=request.headers.get('authorization','').removeprefix('Bearer ')
    scope=token_scope(token,os.getenv('MCP_SECRET',''));lead_id=scope['lead']
    body=await request.json()
    return await run_in_threadpool(mcp_rpc,scope,body)

def mcp_rpc(scope,body):
    lead_id=scope['lead'];method=body.get('method'); rpc_id=body.get('id')
    if rpc_id is None: return Response(status_code=202)
    if method=='initialize': result={'protocolVersion':'2025-03-26','capabilities':{'tools':{}},'serverInfo':{'name':'scorus','version':CATALOG['version']}}
    elif method=='ping': result={}
    elif method=='tools/list': result={'tools':[{'name':name,'description':desc,'inputSchema':{'type':'object','properties':props,'required':list(props),'additionalProperties':False}} for name,(desc,props) in TOOLS.items()]}
    elif method=='tools/call':
        params=body.get('params',{}); name=params.get('name'); args=params.get('arguments',{})
        operation_id=None;operation_started=False
        try:
            require(name in TOOLS and isinstance(args,dict) and set(args)==set(TOOLS[name][1]),'Herramienta o argumentos no permitidos.')
            with Session() as db:
                lead=db.execute(select(Lead).where(Lead.id==lead_id).with_for_update()).scalar_one_or_none(); require(lead is not None,'Expediente inexistente.')
                require(not lead.paused and not lead.opted_out,'Conversación pausada o sin permiso.')
                require(not pacing(db)['automatic_paused'],'Salida automática pausada por Carlo.')
                if scope.get('turn'):
                    turn=db.get(Job,scope['turn'])
                    require(turn is not None and turn.lead_id==lead.id and turn.status=='running' and turn.owner==scope.get('owner') and turn.lease_until>time.time() and lead.generation==scope.get('generation'),'Turno desactualizado o caducado.')
                else:require(name in ('get_offer','get_profile','get_client_status'),'La acción requiere un turno vigente.')
                operation=None
                if name in ('book_call','prepare_checkout'):
                    fingerprint=json.dumps([lead.id,name,args,lead.profile.get('approved_at')],sort_keys=True)
                    op_id='mcp-operation:'+hashlib.sha256(fingerprint.encode()).hexdigest();operation_id=op_id
                    operation=db.get(Record,op_id)
                    if operation and operation.data.get('status')!='failed':
                        require(operation.data.get('status')=='done','Operación pendiente de revisión; no repetir.')
                        return JSONResponse({'jsonrpc':'2.0','id':rpc_id,'result':{'content':[{'type':'text','text':json.dumps(operation.data['result'],ensure_ascii=False)}],'isError':False}})
                    if not operation:
                        operation=Record(id=op_id,kind='operation',lead_id=lead.id,data={'tool':name,'status':'pending'});db.add(operation)
                    else:operation.data={**operation.data,'status':'pending'}
                    db.commit()
                    operation_started=True
                    db.refresh(lead)
                    require(lead.generation==scope.get('generation') and not lead.paused and not lead.opted_out,'Turno invalidado antes de ejecutar.')
                if name=='get_offer': data=CATALOG
                elif name=='get_profile': data={'name':lead.name,'answers':lead.profile,'state':lead.state}
                elif name=='update_profile':
                    require(isinstance(args['answers'],dict) and set(args['answers'])<= {'goal','obstacle','experience','location','days','duration','support','timing','material','timezone','adult'},'Campos no permitidos.')
                    require(all(isinstance(v,str) and len(v)<=200 for v in args['answers'].values()),'Valores no válidos.')
                    if 'adult' in args['answers']:
                        require(args['answers']['adult'] in ('true','false'),'Confirmación de edad inválida.')
                        lead.consent={**lead.consent,'adult':args['answers']['adult']=='true'}
                    lead.profile={**lead.profile,**args['answers']}; data={'updated':True}
                elif name=='get_slots': data=slots(db,lead,args['kind'])
                elif name=='book_call': data=book(db,lead,args['kind'],args['start_time'],args['timezone'],args['email'])
                elif name=='prepare_checkout': data=checkout(db,lead,args['payment_mode'])
                elif name=='request_human': handoff(db,lead,args['reason'][:500]);data={'handed_off':True}
                else:
                    contract=latest_contract(db,lead)
                    data={'state':lead.state,'contract':contract.data if contract else None,'bookings':[r.data for r in db.query(Record).filter_by(kind='booking',lead_id=lead.id)]}
                add_record(db,'audit',lead.id,{'action':'mcp','tool':name})
                if operation:operation.data={**operation.data,'status':'done','result':data}
                db.commit()
            result={'content':[{'type':'text','text':json.dumps(data,ensure_ascii=False)}],'isError':False}
        except RuleError as error:
            if operation_id and operation_started:
                with Session.begin() as db:
                    operation=db.get(Record,operation_id)
                    if operation and operation.data.get('status')=='pending':operation.data={**operation.data,'status':'failed'}
            result={'content':[{'type':'text','text':str(error)}],'isError':True}
        except Exception:
            with Session.begin() as db:
                add_record(db,'alert',lead_id,{'reason':'Herramienta no confirmada; comprobar operaciones antes de repetir.','tool':name,'operation_id':operation_id})
                lead=db.get(Lead,lead_id)
                if lead:handoff(db,lead,'Operación comercial pendiente de verificar.',notify=False)
            result={'content':[{'type':'text','text':'Operación pendiente de revisión humana; no está confirmada.'}],'isError':True}
    else: return JSONResponse({'jsonrpc':'2.0','id':rpc_id,'error':{'code':-32601,'message':'Método no disponible.'}})
    return JSONResponse({'jsonrpc':'2.0','id':rpc_id,'result':result})

@app.get('/admin',response_class=HTMLResponse)
def panel(user=Depends(admin)):
    return HTMLResponse(Path('/app/panel.html').read_text(),headers={'Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; img-src 'self' data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'"})

@app.get('/admin/data')
def panel_data(lead_id:str|None=None,user=Depends(admin)):
    with Session() as db:
        cfg=settings(db)
        query=db.query(Record)
        if lead_id: query=query.filter_by(lead_id=lead_id)
        records=query.order_by(Record.created.desc()).limit(500).all()
        leads=db.query(Lead).order_by(Lead.created.desc()).limit(200).all()
        data={'settings':cfg,'catalog':CATALOG,'leads':[{'id':l.id,'name':l.name,'phone':l.phone,'email':l.email,'state':l.state,'paused':l.paused,'profile':l.profile,'attribution':l.attribution,'opted_out':l.opted_out} for l in leads],'records':[{'id':r.id,'kind':r.kind,'lead_id':r.lead_id,'data':r.data,'created':r.created} for r in records],'jobs':[{'id':j.id,'kind':j.kind,'status':j.status,'error':j.error} for j in db.query(Job).filter(Job.status.in_(['failed','review'])).limit(50)],'integrations':{key:bool(os.getenv(key)) for key in ('EVOLUTION_API_KEY','STRIPE_SECRET_KEY','CALENDLY_TOKEN','HERMES_BRIDGE_KEY')}}
        from .metrics import snapshot
        data['metrics']=snapshot(db)
        data['queue']=queue_snapshot(db)
        try:
            import httpx
            model=httpx.get(os.getenv('HERMES_URL','http://hermes:8642')+'/health',timeout=3)
            data['integrations']['HERMES_BRIDGE_KEY']=bool(model.is_success and model.json().get('model_configured'))
        except Exception: data['integrations']['HERMES_BRIDGE_KEY']=False
    return JSONResponse(data,headers={'Cache-Control':'no-store'})

@app.post('/admin/whatsapp/connect')
def connect_whatsapp(request:Request,user=Depends(admin)):
    from .providers import api
    require(os.getenv('SCORUS_MODE','test')=='test','La vinculación de producción requiere configuración del número definitivo.')
    result=api('GET',os.getenv('EVOLUTION_URL','http://evolution:8080')+'/instance/connect/'+os.getenv('EVOLUTION_INSTANCE','scorus-test'),headers={'apikey':os.getenv('EVOLUTION_API_KEY','')},params={'number':os.getenv('TEST_PHONE','').lstrip('+')})
    return {key:result[key] for key in ('pairingCode','base64','state') if key in result}

@app.post('/admin/leads/{lead_id}/action')
async def panel_action(lead_id:str,request:Request,user=Depends(admin)):
    payload=await request.json();action=payload.get('action')
    with Session() as db:
        lead=db.execute(select(Lead).where(Lead.id==lead_id).with_for_update()).scalar_one_or_none();require(lead is not None,'Expediente no encontrado.')
        if action=='takeover': handoff(db,lead,'Atención humana solicitada desde el panel.')
        elif action=='release': lead.paused=False
        elif action=='approve': approve(db,lead,payload['program'],user)
        elif action=='valuation_complete':
            booking=db.get(Record,payload['booking_id']); require(booking is not None and booking.lead_id==lead.id and booking.kind=='booking' and booking.data['type']=='valuation','Reserva inválida.')
            require(booking.data['start']<=time.time(),'La valoración todavía no ha ocurrido.')
            require(booking.data['status']=='booked','La reserva necesita revisión antes de marcarse realizada.')
            require(lead.state not in ('paid','active'),'La valoración ya no puede cambiar el estado de un cliente pagado o activo.')
            booking.data={**booking.data,'status':'completed','completed_by':user}
            lead.state='valued'
        elif action in ('harbiz_confirm','onboarding_complete'):
            key='harbiz_access_confirmed' if action=='harbiz_confirm' else action
            lead.profile={**lead.profile,key:True}
            for task in db.query(Record).filter_by(kind='task',lead_id=lead.id):
                if action=='harbiz_confirm' and task.data.get('type')=='harbiz': task.data={**task.data,'status':'done'}
        elif action=='activate': activate(db,lead,user)
        elif action=='reply':
            require(isinstance(payload.get('text'),str) and 0<len(payload['text'])<=4000,'Mensaje vacío o demasiado largo.')
            lead.paused=True;cancel_sales(db,lead)
            job=message(db,lead,payload['text'],f'admin:{time.time_ns()}')
            job.data={**job.data,'human':True}
            from .queueing import unanswered
            for rec in unanswered(db,lead.id):rec.data={**rec.data,'answered':True,'handled_by':'human'}
        elif action=='followup':
            require(not lead.paused and not lead.opted_out,'Seguimiento no permitido.')
            schedule_followups(db,lead)
        elif action=='task_complete':
            task=db.get(Record,payload['task_id']);require(task is not None and task.lead_id==lead.id and task.kind=='task','Tarea inválida.')
            task.data={**task.data,'status':'done','completed_by':user}
        else: raise RuleError('Acción desconocida.')
        add_record(db,'audit',lead.id,{'action':action,'actor':user});db.commit()
    return {'ok':True}

@app.post('/admin/settings')
async def panel_settings(request:Request,user=Depends(admin)):
    payload=await request.json()
    require(user=='carlo','La configuración del sistema corresponde a Carlo.')
    allowed={'launch_approved','catalog_approved','terms_url','privacy_url','terms_version','billing_approved','harbiz_procedure_approved','templates_approved','public_form_enabled','capacity','event_types','template_names','published_blocks','test_recipients','test_allow_inbound_any','pacing','resume_transport'}
    require(set(payload)<=allowed,'Configuración no permitida.')
    if 'pacing' in payload:validate_pacing(payload['pacing'])
    if 'resume_transport' in payload:require(payload['resume_transport'] is True,'Reanudación inválida.')
    if 'test_allow_inbound_any' in payload: require(type(payload['test_allow_inbound_any']) is bool,'La recepción abierta de pruebas requiere una confirmación booleana.')
    if 'capacity' in payload: require(type(payload['capacity']) is int and 0<=payload['capacity']<=10,'Capacidad máxima inicial: diez.')
    if 'catalog_approved' in payload: require(isinstance(payload['catalog_approved'],list) and set(payload['catalog_approved'])<=set(PROGRAMS),'Catálogo inválido.')
    if 'test_recipients' in payload: payload['test_recipients']=[phone_number(p) for p in payload['test_recipients']]
    for key in ('terms_url','privacy_url'):
        if payload.get(key): require(payload[key].startswith('https://scorusfitness.com/'),'Publica los documentos en el dominio de Scorus.')
    if 'published_blocks' in payload:
        require(isinstance(payload['published_blocks'],list) and all(set(b)=={'start','end','type'} and b['type'] in ('valuation','elite','group') and b['end']>b['start'] for b in payload['published_blocks']),'Bloques inválidos.')
    for key in ('event_types','template_names'):
        if key in payload: require(isinstance(payload[key],dict) and all(isinstance(v,str) for v in payload[key].values()),'Mapa inválido.')
    with Session() as db:
        cfg=db.execute(select(Config).where(Config.id=='settings').with_for_update()).scalar_one()
        if payload.pop('resume_transport',False):
            runtime=delivery(db,lock=True);runtime.data={**runtime.data,'restricted':False,'pause_until':0,'failures':[]}
        if 'pacing' in payload:payload['pacing']={**pacing(db),**payload['pacing']}
        new={**cfg.data,**payload}
        if new['public_form_enabled']: require(new['privacy_url'],'Publica primero la información de privacidad.')
        if new['launch_approved']:
            require(os.getenv('SCORUS_MODE','test')=='production','Primero configura el número definitivo y el entorno de producción.')
            require(new['terms_url'] and new['privacy_url'] and new['billing_approved'] and new['harbiz_procedure_approved'] and bool(new['published_blocks']),'Faltan validaciones de lanzamiento.')
            if os.getenv('WHATSAPP_TRANSPORT','evolution')=='cloud': require(new['templates_approved'],'Faltan plantillas aprobadas.')
        cfg.data=new;add_record(db,'audit','',{'action':'settings_updated','actor':user,'fields':list(payload)});db.commit()
    return {'ok':True}
