const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

function headers() {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  }
}

// 소환사 한 명 또는 여러 명 upsert
export async function saveSummoners(list: Array<{ gameName: string; tagLine: string }>) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || list.length === 0) return
  const body = list.map(s => ({
    game_name: s.gameName,
    tag_line: s.tagLine,
    last_searched_at: new Date().toISOString(),
  }))
  await fetch(`${SUPABASE_URL}/rest/v1/summoners`, {
    method: 'POST',
    headers: { ...headers(), 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify(body),
  }).catch(() => {})
}

// 닉네임 포함 검색
export async function searchSummoners(query: string): Promise<Array<{ gameName: string; tagLine: string }>> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !query.trim()) return []
  const url =
    `${SUPABASE_URL}/rest/v1/summoners` +
    `?select=game_name,tag_line` +
    `&game_name=ilike.*${encodeURIComponent(query.trim())}*` +
    `&order=last_searched_at.desc` +
    `&limit=10`
  const res = await fetch(url, { headers: headers() }).catch(() => null)
  if (!res || !res.ok) return []
  const data: Array<{ game_name: string; tag_line: string }> = await res.json()
  return data.map(r => ({ gameName: r.game_name, tagLine: r.tag_line }))
}
