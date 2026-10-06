import hmac
import json
import os
import subprocess
import tempfile
import asyncio
from pathlib import Path
from starlette.applications import Starlette
from starlette.exceptions import HTTPException
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.routing import Route
from starlette.concurrency import run_in_threadpool
import yaml
from dotenv import dotenv_values

def runtime(read_only=False):
    home=Path(os.getenv('HERMES_SETTINGS_HOME','/home/scorus/.hermes'))
    path=home/'config.yaml'
    config=yaml.safe_load(path.read_text()) if path.exists() else {}
    model=(config or {}).get('model',{})
    if not isinstance(model,dict): model={'default':model}
    name=os.getenv('HERMES_MODEL') or model.get('default') or ''
    provider=os.getenv('HERMES_PROVIDER') or model.get('provider') or 'custom'
    if provider in ('codex','chatgpt','openai-codex'):
        from hermes_cli.auth import resolve_codex_runtime_credentials
        result=resolve_codex_runtime_credentials(read_only=read_only)
        return {**result,'model':name}
    values=dotenv_values(home/'.env')
    providers={'openai-api':('OPENAI_API_KEY','https://api.openai.com/v1'),'openrouter':('OPENROUTER_API_KEY','https://openrouter.ai/api/v1'),'anthropic':('ANTHROPIC_API_KEY','https://api.anthropic.com'),'custom':('OPENAI_API_KEY','')}
    key_name,default_url=providers.get(provider,('OPENAI_API_KEY',''))
    return {'model':name,'provider':provider,'api_key':os.getenv('HERMES_MODEL_KEY') or values.get(key_name) or '', 'base_url':os.getenv('HERMES_MODEL_URL') or model.get('base_url') or default_url}

def health(request):
    try:
        model=runtime(read_only=True)
        configured=bool(model['model'] and model['api_key'] and model['base_url'])
    except Exception: configured=False
    return JSONResponse({'status':'ok','model_configured':configured})

inference_slots=asyncio.Semaphore(2)

async def respond(request:Request):
    async with inference_slots:
        return await run_response(request)

async def run_response(request:Request):
    secret=os.getenv('HERMES_BRIDGE_KEY','')
    if not secret or not hmac.compare_digest(request.headers.get('authorization',''),'Bearer '+secret):raise HTTPException(401)
    body=await request.json()
    try: model=runtime(read_only=bool(body.get('probe')))
    except Exception:
        if not body.get('probe'): raise HTTPException(503,'Inicia sesión y elige un modelo en Hermes antes de activar conversaciones.')
        model={'model':'','provider':'custom','base_url':'','api_key':''}
    if not body.get('probe') and not (model['model'] and model['api_key'] and model['base_url']):raise HTTPException(503,'Configura proveedor y modelo antes de activar conversaciones.')
    # Each invocation has a fresh process and home. Neither global tool registry nor memory can cross clients.
    with tempfile.TemporaryDirectory(prefix='scorus-') as directory:
        home=Path(directory)
        config={'model':{'default':model['model'],'provider':model['provider'],'base_url':model['base_url']},'memory':{'memory_enabled':False,'user_profile_enabled':False},'mcp_servers':{'scorus':{'url':os.getenv('SCORUS_INTERNAL_URL','http://backend:4280')+'/mcp','headers':{'Authorization':'Bearer '+body['mcp_token']},'tools':{'include':['get_offer','get_profile','update_profile','get_slots','book_call','prepare_checkout','request_human','get_client_status'],'resources':False,'prompts':False},'sampling':{'enabled':False},'elicitation':{'enabled':False}}}}
        config['tools']={'tool_search':{'enabled':'off'}}
        (home/'config.yaml').write_text(yaml.safe_dump(config))
        skill=Path('/runtime/scorus-commercial.md').read_text()
        knowledge=Path('/runtime/catalog.json').read_text()
        payload={**body,'system':skill+'\nOFERTA OFICIAL:\n'+knowledge}
        env={key:os.environ[key] for key in ('PATH','LANG') if key in os.environ}
        env.update({'HOME':directory,'HERMES_HOME':directory,'HERMES_MODEL':model['model'],'HERMES_RUNTIME_PROVIDER':model['provider'],'HERMES_MODEL_URL':model['base_url'],'HERMES_MODEL_KEY':model['api_key'],'HERMES_STRICT_PROFILE_AUTH':'true','PYTHONPATH':'/hermes'})
        result=await run_in_threadpool(subprocess.run,['python','/runtime/invoke.py'],input=json.dumps(payload),capture_output=True,text=True,env=env,timeout=150,cwd=directory)
        if result.returncode!=0:
            if body.get('probe'):
                error=result.stderr[-2400:]+'\n'+result.stdout[-2500:]
                for value in (body['mcp_token'],model['api_key'],secret):
                    if value:error=error.replace(value,'[redacted]')
                return JSONResponse({'probe_failure':error},status_code=502)
            raise HTTPException(502,'Hermes requiere revisión; salida privada omitida.')
        try:return JSONResponse(json.loads(result.stdout.split('SCORUS_RESULT:')[-1]))
        except Exception:raise HTTPException(502,'Respuesta de Hermes no válida.')

app=Starlette(routes=[Route('/health',health),Route('/respond',respond,methods=['POST'])])
