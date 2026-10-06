import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createHmac } from 'node:crypto';

const schema = z.object({
  name: z.string().trim().min(2).max(100), phone: z.string().max(30),
  adult: z.literal(true), contact_consent: z.literal(true), marketing_consent: z.boolean(),
  consent_version: z.literal('2026-10-06.1'), answers: z.record(z.string().max(100)),
  attribution: z.record(z.string().max(200)), website: z.string().max(200).optional().default(''),
}).strict();

export const POST: APIRoute = async ({ request }) => {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  const json = (body: unknown, status: number) => new Response(JSON.stringify(body), { status, headers });
  const origin = request.headers.get('origin');
  if (!origin || !['https://scorusfitness.com', 'https://www.scorusfitness.com', new URL(request.url).origin].includes(origin)) return json({ error: 'Origen no autorizado.' }, 403);
  if (Number(request.headers.get('content-length') || 0) > 12000) return json({ error: 'Solicitud demasiado grande.' }, 413);
  const endpoint = import.meta.env.SCORUS_BACKEND_URL;
  const key = import.meta.env.SCORUS_FORM_API_KEY;
  if (!endpoint || !key) return json({ error: 'La solicitud de valoración todavía no está abierta.' }, 503);
  try {
    const raw = await request.text();
    if (raw.length > 12000) return json({ error: 'Solicitud demasiado grande.' }, 413);
    const parsed = schema.safeParse(JSON.parse(raw));
    if (!parsed.success || parsed.data.website) return json({ error: 'Revisa tu nombre, teléfono y autorizaciones.' }, 400);
    const client = createHmac('sha256',key).update(request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || 'unknown').digest('hex');
    const upstream = await fetch(endpoint + '/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key, 'X-Scorus-Client':client }, body: JSON.stringify(parsed.data), signal: AbortSignal.timeout(12000) });
    const result = await upstream.json();
    return json(upstream.ok ? { accepted: true } : { error: result.error || 'No se ha podido registrar la solicitud.' }, upstream.status);
  } catch { return json({ error: 'No se ha podido registrar tu solicitud. Inténtalo más adelante.' }, 503); }
};
