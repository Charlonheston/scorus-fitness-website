import type { APIRoute } from 'astro';
export const GET: APIRoute = async () => {
  const endpoint = import.meta.env.SCORUS_BACKEND_URL;
  let status = { form_enabled: false, test_mode: true };
  if (endpoint) {
    try { const response = await fetch(endpoint + '/api/public/status', { signal: AbortSignal.timeout(5000) }); if (response.ok) status = await response.json(); } catch { /* Fail closed while the service is unavailable. */ }
  }
  return new Response(JSON.stringify(status), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
};
