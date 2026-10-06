"""Private smoke check; reports booleans only, never secrets or chat data."""
import os
import httpx
from app.store import Session, Lead, init
from app.domain import scoped_token

init()
with Session.begin() as db:
    lead=db.get(Lead,'runtime-probe')
    if not lead:db.add(Lead(id='runtime-probe',phone='+449999999999',name='Prueba técnica interna',consent={'contact':True},profile={}))
headers={'Authorization':'Bearer '+scoped_token('runtime-probe',os.environ['MCP_SECRET'])}
response=httpx.post('http://backend:4280/mcp',headers=headers,json={'jsonrpc':'2.0','id':1,'method':'tools/list','params':{}})
response.raise_for_status()
tools=response.json()['result']['tools']
assert len(tools)==8 and all('lead_id' not in t['inputSchema']['properties'] for t in tools)
print({'mcp_tools':len(tools),'cross_client_ids':False,'hermes':httpx.get('http://hermes:8642/health').json()})
response=httpx.post('http://hermes:8642/respond',headers={'Authorization':'Bearer '+os.environ['HERMES_BRIDGE_KEY']},json={'probe':True,'prompt':'probe','history':[],'lead_context':{},'mcp_token':scoped_token('runtime-probe',os.environ['MCP_SECRET'])},timeout=150)
print({'hermes_probe_status':response.status_code})
print(response.json())
response.raise_for_status()
with Session.begin() as db:
    lead=db.get(Lead,'runtime-probe')
    if lead:db.delete(lead)
