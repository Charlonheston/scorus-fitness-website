from pathlib import Path

def load_sales_profile(root='/runtime'):
    root=Path(root)
    return '\n\n'.join((root/name).read_text(encoding='utf-8') for name in ('scorus-soul.md','scorus-commercial.md','scorus-examples.md'))
