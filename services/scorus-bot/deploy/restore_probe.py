"""Restore a Scorus dump into a newly created probe DB; never touch the service DB."""
import subprocess
from pathlib import Path

root=Path('/opt/scorus-bot/repo/services/scorus-bot')
dump=max(Path('/opt/scorus-bot/backups').glob('scorus-*.dump'),key=lambda p:p.stat().st_mtime)
prefix=['docker','compose','exec','-T','db']
name='scorus_restore_probe'
def run(args,**kwargs):
    return subprocess.run(prefix+args,cwd=root,check=True,capture_output=True,**kwargs)
exists=run(['psql','-U','scorus','-d','scorus','-Atc',"SELECT 1 FROM pg_database WHERE datname='scorus_restore_probe'"]).stdout.strip()
if exists: raise RuntimeError('Restore probe DB already exists. Inspect it; do not overwrite it.')
run(['createdb','-U','scorus',name])
try:
    with dump.open('rb') as source:
        run(['pg_restore','-U','scorus','-d',name,'--no-owner','--exit-on-error'],stdin=source)
    tables=run(['psql','-U','scorus','-d',name,'-Atc',"SELECT count(*) FROM information_schema.tables WHERE table_schema='public'"]).stdout.strip()
    if int(tables)<4: raise RuntimeError('The restored backup is missing application tables.')
    print('Restauración de Scorus verificada en una base temporal aislada.')
finally:
    run(['dropdb','-U','scorus',name])
