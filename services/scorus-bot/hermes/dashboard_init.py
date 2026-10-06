"""Native Hermes dashboard for a private Scorus sales-testing profile."""
import os
from pathlib import Path
import yaml

home=Path(os.environ['HERMES_HOME'])
home.mkdir(parents=True,exist_ok=True)
config=home/'config.yaml'
if not config.exists():
    config.write_text(yaml.safe_dump({'model':{'default':'','provider':'custom','base_url':''},'memory':{'memory_enabled':False,'user_profile_enabled':False},'display':{'interface':'tui'},'dashboard':{'public_url':os.environ['HERMES_DASHBOARD_PUBLIC_URL']},'toolsets':[]},allow_unicode=True))
    config.chmod(0o600)
skill=Path('/runtime/scorus-commercial.md').read_text()
catalog=Path('/runtime/catalog.json').read_text()
instructions=skill+'\n\nPERFIL DE PRUEBAS COMERCIALES\nEste chat sirve para revisar la conversación de venta. No está conectado a WhatsApp, agenda, pagos ni expedientes reales. Puedes explicar el producto y preparar una recomendación, pero no confirmar reservas, aprobaciones, pagos o accesos. Si piden una acción externa, explica que requiere el panel de gestión y una conexión verificada.\n\nOFERTA OFICIAL\n'+catalog
(home/'SOUL.md').write_text(instructions)
directory=home/'skills'/'scorus-commercial'
directory.mkdir(parents=True,exist_ok=True)
(directory/'SKILL.md').write_text('---\nname: scorus-commercial\ndescription: Conocimiento y guion comercial oficial de las asesorías online de Bernat y Scorus Team.\n---\n\n'+instructions)
os.execvp('hermes',['hermes','dashboard','--host','0.0.0.0','--port','9119','--no-open','--isolated','--skip-build'])
