"""Add only the authenticated Scorus Hermes namespace to the existing proxy."""
from datetime import datetime,timezone
from pathlib import Path
import subprocess

path=Path('/etc/caddy/Caddyfile');before=path.read_text()
if '/scorus-hermes/*' in before:
    print('Scorus Hermes route already configured.')
    raise SystemExit(0)
marker='\thandle_path /scorus-bot/* {'
if before.count(marker)!=1: raise RuntimeError('Expected Scorus route not found; existing proxy left unchanged.')
route='\t@scorus_hermes_root path /scorus-hermes\n\tredir @scorus_hermes_root /scorus-hermes/ 308\n\n\thandle_path /scorus-hermes/* {\n\t\treverse_proxy localhost:4281 {\n\t\t\theader_up X-Forwarded-Prefix /scorus-hermes\n\t\t}\n\t}\n\n'
candidate=Path('/opt/scorus-bot/Caddyfile.with-hermes')
candidate.write_text(before.replace(marker,route+marker))
subprocess.run(['caddy','validate','--config',str(candidate),'--adapter','caddyfile'],check=True)
backup=Path('/opt/scorus-bot/Caddyfile.before-hermes-'+datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ'))
backup.write_text(before)
try:
    path.write_text(candidate.read_text())
    subprocess.run(['systemctl','reload','caddy'],check=True)
except Exception:
    path.write_text(before)
    subprocess.run(['systemctl','reload','caddy'],check=True)
    raise
print('Authenticated Scorus Hermes route added; existing upstreams preserved.')
