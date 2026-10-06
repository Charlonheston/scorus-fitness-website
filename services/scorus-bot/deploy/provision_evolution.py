"""Execute inside backend after the separate Evolution container is ready."""
import os
import httpx
from app.store import Config, Session, init

url=os.environ['EVOLUTION_URL'];headers={'apikey':os.environ['EVOLUTION_API_KEY']};name=os.environ['EVOLUTION_INSTANCE']
instances=httpx.get(url+'/instance/fetchInstances',headers=headers,timeout=20);instances.raise_for_status()
if not any(i.get('name')==name or i.get('instance',{}).get('instanceName')==name for i in instances.json()):
    response=httpx.post(url+'/instance/create',headers=headers,json={'instanceName':name,'integration':'WHATSAPP-BAILEYS','qrcode':False,'number':os.environ['TEST_PHONE'].lstrip('+'),'rejectCall':True,'msgCall':'Ahora no podemos atender llamadas por WhatsApp. Escribe tu consulta para organizar una valoración.','groupsIgnore':True,'alwaysOnline':False,'readMessages':False,'readStatus':False,'syncFullHistory':False},timeout=25);response.raise_for_status()
response=httpx.post(url+'/webhook/set/'+name,headers=headers,json={'webhook':{'enabled':True,'url':'http://backend:4280/webhooks/evolution','webhookByEvents':False,'webhookBase64':False,'headers':{'Authorization':'Bearer '+os.environ['EVOLUTION_WEBHOOK_SECRET']},'events':['MESSAGES_UPSERT']}},timeout=25);response.raise_for_status()
init()
print('Scorus instance provisioned; pairing pending. No messages sent.')
