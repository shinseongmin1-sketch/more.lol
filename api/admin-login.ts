export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  let body: { id?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return new Response('Bad Request', { status: 400 })
  }

  const ADMIN_ID = process.env.ADMIN_ID
  const ADMIN_PW = process.env.ADMIN_PW

  if (!ADMIN_ID || !ADMIN_PW) {
    return new Response('Server misconfigured', { status: 500 })
  }

  if (body.id === ADMIN_ID && body.password === ADMIN_PW) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ ok: false }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
