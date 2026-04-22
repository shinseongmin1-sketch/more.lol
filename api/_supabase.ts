// 서버(edge) 환경에서 Supabase REST API 호출용 헬퍼
// VITE_ 접두사 env는 Vercel에서 서버 사이드에도 그대로 사용 가능

export function sbUrl() {
  return process.env.VITE_SUPABASE_URL ?? ''
}

export function sbHeaders() {
  const key = process.env.VITE_SUPABASE_ANON_KEY ?? ''
  return {
    'Content-Type': 'application/json',
    'apikey': key,
    'Authorization': `Bearer ${key}`,
  }
}

// ranking_cache: overall / pro 랭킹 사전적재 데이터
export async function getRankingCache(type: string): Promise<{ data: any; updatedAt: string } | null> {
  const base = sbUrl()
  if (!base) return null
  const res = await fetch(
    `${base}/rest/v1/ranking_cache?type=eq.${type}&limit=1`,
    { headers: sbHeaders() }
  ).catch(() => null)
  if (!res?.ok) return null
  const rows: any[] = await res.json()
  if (!rows.length) return null
  return { data: rows[0].data, updatedAt: rows[0].updated_at }
}

export async function setRankingCache(type: string, data: any): Promise<void> {
  const base = sbUrl()
  if (!base) return
  await fetch(`${base}/rest/v1/ranking_cache`, {
    method: 'POST',
    headers: { ...sbHeaders(), Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ type, data, updated_at: new Date().toISOString() }),
  }).catch(() => {})
}

// riot_api_cache: 개별 Riot API 응답 캐시
export async function getRiotCache(cacheKey: string): Promise<any | null> {
  const base = sbUrl()
  if (!base) return null
  const now = new Date().toISOString()
  const res = await fetch(
    `${base}/rest/v1/riot_api_cache?cache_key=eq.${encodeURIComponent(cacheKey)}&expires_at=gte.${now}&limit=1`,
    { headers: sbHeaders() }
  ).catch(() => null)
  if (!res?.ok) return null
  const rows: any[] = await res.json()
  return rows[0]?.data ?? null
}

export async function setRiotCache(cacheKey: string, data: any, ttlSeconds: number): Promise<void> {
  const base = sbUrl()
  if (!base) return
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString()
  await fetch(`${base}/rest/v1/riot_api_cache`, {
    method: 'POST',
    headers: { ...sbHeaders(), Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ cache_key: cacheKey, data, expires_at: expiresAt }),
  }).catch(() => {})
}
