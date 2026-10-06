import type { APIRoute } from 'astro';

const proxy: APIRoute = async ({ request, params }) => {
  const endpoint = import.meta.env.SCORUS_BACKEND_URL;
  if (!endpoint) return new Response('El panel todavía no está disponible.', { status: 503 });
  const path = params.path || '';
  if (!/^$|^data$|^settings$|^whatsapp\/connect$|^leads\/[a-z0-9-]+\/action$/.test(path)) return new Response('No encontrado.', { status: 404 });
  const headers: Record<string, string> = {};
  for (const name of ['authorization','content-type','origin','x-scorus-admin']) { const value = request.headers.get(name); if (value) headers[name] = value; }
  if (request.method === 'POST' && request.headers.get('origin') !== new URL(request.url).origin) return new Response('Origen no autorizado.', { status: 403 });
  const body = request.method === 'POST' ? await request.text() : undefined;
  if (body && body.length > 20000) return new Response('Solicitud demasiado grande.', { status: 413 });
  try {
    const source = new URL(request.url);
    const leadId = path === 'data' ? source.searchParams.get('lead_id') : null;
    const query = leadId ? '?' + new URLSearchParams({ lead_id: leadId }).toString() : '';
    const upstream = await fetch(endpoint + '/admin' + (path ? '/' + path : '') + query, { method: request.method, headers, body, signal: AbortSignal.timeout(28000), redirect:'manual' });
    const responseHeaders: Record<string,string> = {'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};
    for (const name of ['content-type','www-authenticate','content-security-policy']) { const value=upstream.headers.get(name); if (value) responseHeaders[name]=value; }
    let text = await upstream.text();
    if (upstream.headers.get('content-type')?.includes('text/html')) text=text.replaceAll("'/admin/", "'/scorus-gestion/");
    return new Response(text,{status:upstream.status,headers:responseHeaders});
  } catch { return new Response('El servicio no está disponible en este momento.',{status:503}); }
};
export const GET = proxy;
export const POST = proxy;
