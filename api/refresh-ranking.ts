// Vercel Cron Job으로 30분마다 호출됨
// vercel.json의 crons 설정 참고
export const config = { runtime: 'edge' }

import { setRankingCache } from './_supabase'

const CRON_SECRET = process.env.CRON_SECRET ?? ''

// ranking.ts의 헬퍼들 재사용 (동일 로직)
async function riotFetch(url: string, apiKey: string) {
  const res = await fetch(url, { headers: { 'X-Riot-Token': apiKey } })
  if (!res.ok) throw new Error(`riot ${res.status}: ${url}`)
  return res.json()
}

async function getDDData() {
  const versions: string[] = await fetch('https://ddragon.leagueoflegends.com/api/versions.json').then(r => r.json())
  const data: any = await fetch(`https://ddragon.leagueoflegends.com/cdn/${versions[0]}/data/ko_KR/champion.json`).then(r => r.json())
  const keyToId: Record<string, string> = {}
  const tags: Record<string, string[]> = {}
  for (const champ of Object.values(data.data) as any[]) {
    keyToId[String(champ.key)] = champ.id
    tags[champ.id] = champ.tags ?? []
  }
  return { keyToId, tags }
}

export default async function handler(req: Request): Promise<Response> {
  // Vercel Cron은 Authorization 헤더로 시크릿 전달
  const auth = req.headers.get('authorization') ?? ''
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const apiKey = process.env.RIOT_API_KEY
  if (!apiKey) return new Response('API key missing', { status: 500 })

  const results: string[] = []

  // overall 랭킹 갱신 → /api/ranking?type=overall&force=1 내부 호출 대신 직접 fetch
  try {
    const base = new URL(req.url).origin
    const [overall, pro] = await Promise.allSettled([
      fetch(`${base}/api/ranking?type=overall&force=1`),
      fetch(`${base}/api/ranking?type=pro&force=1`),
    ])
    results.push(
      `overall: ${overall.status === 'fulfilled' ? overall.value.status : 'error'}`,
      `pro: ${pro.status === 'fulfilled' ? pro.value.status : 'error'}`,
    )
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }

  return new Response(JSON.stringify({ ok: true, results, at: new Date().toISOString() }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
