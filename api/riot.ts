export const config = { runtime: 'edge' }

import { getRiotCache, setRiotCache } from './_supabase.js'

// 인스턴스 내 인메모리 캐시 (빠른 1차 캐시)
const memCache = new Map<string, { data: string; expiresAt: number }>()

function getTtl(riotUrl: string): number {
  // 매치 상세 데이터는 불변 → 24시간
  if (/\/lol\/match\/v5\/matches\/[A-Z]+_\d+$/.test(riotUrl)) return 86400
  // 매치 목록 → 3분
  if (riotUrl.includes('/matches/by-puuid')) return 180
  // 랭크 정보 → 5분
  if (riotUrl.includes('/league/v4/entries')) return 300
  // 소환사 정보 → 10분
  if (riotUrl.includes('/summoner/v4')) return 600
  // 계정 정보 → 30분
  if (riotUrl.includes('/account/v1')) return 1800
  // 챔피언 숙련도 → 10분
  if (riotUrl.includes('/champion-mastery')) return 600
  return 300
}

export default async function handler(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const riotUrl = searchParams.get('url')

  if (!riotUrl) return new Response('Missing url param', { status: 400 })

  const apiKey = process.env.RIOT_API_KEY
  if (!apiKey) return new Response('RIOT_API_KEY not configured', { status: 500 })

  const ttl = getTtl(riotUrl)
  const now = Date.now()

  // 1단계: 인메모리 캐시
  const mem = memCache.get(riotUrl)
  if (mem && mem.expiresAt > now) {
    return new Response(mem.data, {
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT-MEM' },
    })
  }

  // 2단계: Supabase DB 캐시
  const dbData = await getRiotCache(riotUrl)
  if (dbData !== null) {
    const body = JSON.stringify(dbData)
    memCache.set(riotUrl, { data: body, expiresAt: now + 60_000 }) // 메모리엔 1분
    return new Response(body, {
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT-DB' },
    })
  }

  // 3단계: Riot API 직접 호출
  const res = await fetch(riotUrl, { headers: { 'X-Riot-Token': apiKey } })
  const body = await res.text()

  if (res.ok) {
    memCache.set(riotUrl, { data: body, expiresAt: now + ttl * 1000 })
    // DB 저장은 비동기로 (응답 속도에 영향 없음)
    setRiotCache(riotUrl, JSON.parse(body), ttl)
  }

  return new Response(body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
  })
}
