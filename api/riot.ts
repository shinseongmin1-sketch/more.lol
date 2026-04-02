export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const riotUrl = searchParams.get('url')

  if (!riotUrl) {
    return new Response('Missing url param', { status: 400 })
  }

  const apiKey = process.env.RIOT_API_KEY
  if (!apiKey) {
    return new Response('RIOT_API_KEY not configured', { status: 500 })
  }

  const res = await fetch(riotUrl, {
    headers: { 'X-Riot-Token': apiKey },
  })

  const body = await res.text()
  return new Response(body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  })
}
