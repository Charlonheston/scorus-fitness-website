import hmac
import json
import os
import subprocess
import tempfile
from pathlib import Path
from starlette.applications import Starlette
from starlette.exceptions import HTTPException
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.routing import Route
import yaml

def health(request):
    return JSONResponse({'status':'ok','model_configured':bool(os.getenv('HERMES_MODEL') and os.getenv('HERMES_MODEL_KEY'))})

async def respond(request:Request):
    secret=os.getenv('HERMES_BRIDGE_KEY','')
    if not secret or not hmac.compare_digest(request.headers.get('authorization',''),'Bearer '+secret):raise HTTPException(401)
    body=await request.json()
    if not body.get('probe') and (not os.getenv('HERMES_MODEL') or not os.getenv('HERMES_MODEL_KEY')):raise HTTPException(503,'Configura proveedor y modelo antes de activar conversaciones.')
    # Each invocation has a fresh process and home. Neither global tool registry nor memory can cross clients.
    with tempfile.TemporaryDirectory(prefix='scorus-') as directory:
        home=Path(directory)
        config={'model':{'default':os.getenv('HERMES_MODEL'),'provider':'custom','base_url':os.getenv('HERMES_MODEL_URL')},'memory':{'memory_enabled':False,'user_profile_enabled':False},'mcp_servers':{'scorus':{'url':os.getenv('SCORUS_INTERNAL_URL','http://backend:4280')+'/mcp','headers':{'Authorization':'Bearer '+body['mcp_token']},'tools':{'include':['get_offer','get_profile','update_profile','get_slots','book_call','prepare_checkout','request_human','get_client_status'],'resources':False,'prompts':False},'sampling':{'enabled':False},'elicitation':{'enabled':False}}}}
        config['tools']={'tool_search':{'enabled':'off'}}
        (home/'config.yaml').write_text(yaml.safe_dump(config))
        skill=Path('/runtime/scorus-commercial.md').read_text()
        knowledge=Path('/runtime/catalog.json').read_text()
        payload={**body,'system':skill+'\nOFERTA OFICIAL:\n'+knowledge}
        env={key:os.environ[key] for key in ('PATH','LANG') if key in os.environ}
        env.update({'HOME':directory,'HERMES_HOME':directory,'HERMES_MODEL':os.getenv('HERMES_MODEL',''),'HERMES_MODEL_URL':os.getenv('HERMES_MODEL_URL',''),'HERMES_MODEL_KEY':os.getenv('HERMES_MODEL_KEY',''),'HERMES_STRICT_PROFILE_AUTH':'true','PYTHONPATH':'/hermes'})
        result=subprocess.run(['python','/runtime/invoke.py'],input=json.dumps(payload),capture_output=True,text=True,env=env,timeout=150,cwd=directory)
        if result.returncode!=0:
            if body.get('probe'):
                error=result.stderr[-2400:]+'\n'+result.stdout[-2500:]
                for value in (body['mcp_token'],os.getenv('HERMES_MODEL_KEY'),secret):
                    if value:error=error.replace(value,'[redacted]')
                return JSONResponse({'probe_failure':error},status_code=502)
            raise HTTPException(502,'Hermes requiere revisión; salida privada omitida.')
        try:return JSONResponse(json.loads(result.stdout.split('SCORUS_RESULT:')[-1]))
        except Exception:raise HTTPException(502,'Respuesta de Hermes no válida.')

app=Starlette(routes=[Route('/health',health),Route('/respond',respond,methods=['POST'])])
