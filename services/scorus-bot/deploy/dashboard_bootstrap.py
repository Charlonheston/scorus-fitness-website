"""Generate private dashboard access without exposing or reusing boat credentials."""
import base64
import hashlib
import json
from pathlib import Path
import secrets

root=Path('/opt/scorus-bot/repo/services/scorus-bot')
target=root/'.env.dashboard'
access=Path('/opt/scorus-bot/access.private.json')
values=json.loads(access.read_text())
if not target.exists():
    password=secrets.token_hex(20);salt=secrets.token_bytes(16)
    derived=hashlib.scrypt(password.encode(),salt=salt,n=16384,r=8,p=1,dklen=32)
    hashed='scrypt$16384$8$1$'+base64.b64encode(salt).decode()+'$'+base64.b64encode(derived).decode()
    # Compose interpolates dollar signs in env files; single quotes preserve the hash verbatim.
    target.write_text("HERMES_DASHBOARD_BASIC_AUTH_USERNAME=carlo\nHERMES_DASHBOARD_BASIC_AUTH_PASSWORD_HASH='"+hashed+"'\nHERMES_DASHBOARD_BASIC_AUTH_SECRET="+secrets.token_hex(32)+'\n')
    target.chmod(0o600)
    values.update({'hermes_url':'https://webhook.pegateway.xyz/scorus-hermes/','hermes_user':'carlo','hermes_password':password})
    access.write_text(json.dumps(values,indent=2));access.chmod(0o600)
print('Dashboard credentials initialized privately; existing credentials unchanged.')
