"""Run on the Scorus host. Generates separate credentials; never prints secrets."""
import json
import os
from pathlib import Path
import secrets

directory=Path('/opt/scorus-bot/repo/services/scorus-bot')
path=directory/'.env'
if not path.exists():
    values={}
    for line in (directory/'.env.example').read_text().splitlines():
        if '=' in line:
            key,value=line.split('=',1);values[key]=value
    for key in ('POSTGRES_PASSWORD','EVOLUTION_DB_PASSWORD','EVOLUTION_API_KEY','EVOLUTION_WEBHOOK_SECRET','FORM_API_KEY','MCP_SECRET','ADMIN_CARLO_PASSWORD','ADMIN_BERNAT_PASSWORD','HERMES_BRIDGE_KEY'):
        values[key]=secrets.token_hex(24)
    path.write_text('\n'.join(f'{k}={v}' for k,v in values.items())+'\n');path.chmod(0o600)
else:
    values=dict(line.split('=',1) for line in path.read_text().splitlines() if '=' in line)
hermes=directory/'.env.hermes'
if not hermes.exists():
    hermes.write_text('HERMES_BRIDGE_KEY='+values['HERMES_BRIDGE_KEY']+'\nHERMES_MODEL_URL=\nHERMES_MODEL=\nHERMES_MODEL_KEY=\n');hermes.chmod(0o600)
access=Path('/opt/scorus-bot/access.private.json')
previous=json.loads(access.read_text()) if access.exists() else {}
access.write_text(json.dumps({**previous,'panel_user':'carlo','panel_password':values['ADMIN_CARLO_PASSWORD'],'bernat_user':'bernat','bernat_password':values['ADMIN_BERNAT_PASSWORD'],'form_api_key':values['FORM_API_KEY']},indent=2));access.chmod(0o600)
print('Scorus credentials initialized; existing business credentials unchanged.')
