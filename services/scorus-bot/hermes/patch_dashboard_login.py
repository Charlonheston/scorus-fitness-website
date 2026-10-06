"""Compatibility fix for the pinned Hermes login page when mounted under a path.

The upstream SPA and cookies honor X-Forwarded-Prefix, but its server-rendered
password form uses root-relative auth URLs. Patch only rendering, preserving
the upstream credential verification, cookie scope, CSRF and rate limits.
"""
from pathlib import Path

root=Path('/hermes/hermes_cli/dashboard_auth')
page=root/'login_page.py'
routes=root/'routes.py'
source=page.read_text()
before='def render_login_html(*, next_path: str = "") -> str:'
assert source.count(before)==1, 'Pinned Hermes login renderer changed; review before building.'
source=source.replace(before,'def _render_login_html_unmounted(*, next_path: str = "") -> str:')
source+='''

def render_login_html(*, next_path: str = "", prefix: str = "") -> str:
    # prefix is validated by dashboard_auth.prefix.prefix_from_request.
    if not prefix:
        return _render_login_html_unmounted(next_path=next_path)
    path_only = next_path.split("?", 1)[0]
    if path_only != prefix and not path_only.startswith(prefix + "/"):
        next_path = prefix + (next_path or "/")
    rendered = _render_login_html_unmounted(next_path=next_path)
    return (rendered
            .replace("url('/fonts/", "url('" + prefix + "/fonts/")
            .replace('href="/auth/', 'href="' + prefix + '/auth/')
            .replace("fetch('/auth/password-login'", "fetch('" + prefix + "/auth/password-login'")
            .replace("(data && data.next) || '/'", "(data && data.next) || '" + prefix + "/'"))
'''
route_source=routes.read_text()
old='render_login_html(next_path=next_path)'
assert route_source.count(old)==1, 'Pinned Hermes login route changed; review before building.'
route_source=route_source.replace(old,'render_login_html(next_path=next_path, prefix=_prefix(request))')
compile(source,str(page),'exec')
compile(route_source,str(routes),'exec')
page.write_text(source)
routes.write_text(route_source)
print('Hermes login rendering now honors the validated proxy prefix.')
