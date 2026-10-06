"""Add only a separate Scorus namespace; preserve and validate the current routes."""
from pathlib import Path
import subprocess

target=Path('/etc/caddy/Caddyfile');original=target.read_text()
marker='\t@marina_root path /marina-sombria'
addition='\thandle_path /scorus-bot/* {\n\t\t@private_mcp path /mcp\n\t\trespond @private_mcp 404\n\t\treverse_proxy localhost:4280\n\t}\n\n'
if 'handle_path /scorus-bot/*' not in original:
    if marker not in original:raise RuntimeError('Caddy layout changed; do not alter existing routes.')
    backup=Path('/opt/scorus-bot/Caddyfile.before-scorus');backup.write_text(original);backup.chmod(0o600)
    candidate=Path('/etc/caddy/Caddyfile.scorus-candidate');candidate.write_text(original.replace(marker,addition+marker,1))
    subprocess.run(['caddy','validate','--config',str(candidate),'--adapter','caddyfile'],check=True)
    target.write_text(candidate.read_text())
    try:subprocess.run(['systemctl','reload','caddy'],check=True)
    except Exception:
        target.write_text(original);subprocess.run(['systemctl','reload','caddy'],check=True);raise
print('Scorus route installed; existing upstream routes preserved.')
