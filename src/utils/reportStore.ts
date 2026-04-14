const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

function h() {
  return {
    'Content-Type': 'application/json',
    apikey:        SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  }
}

export interface Report {
  id:               string
  postId:           string
  postTitle:        string
  reporterId:       string
  reporterNickname: string
  reason:           string
  detail:           string
  createdAt:        string
}

// ── 로컬 중복 방지 (이 기기에서 이미 신고한 게시글 목록) ──
function reportedKey(userId: string) { return `morelol_reported_${userId}` }

export function hasReportedLocally(userId: string, postId: string): boolean {
  const set: string[] = JSON.parse(localStorage.getItem(reportedKey(userId)) || '[]')
  return set.includes(postId)
}

function markReported(userId: string, postId: string) {
  const set: string[] = JSON.parse(localStorage.getItem(reportedKey(userId)) || '[]')
  if (!set.includes(postId)) {
    localStorage.setItem(reportedKey(userId), JSON.stringify([...set, postId]))
  }
}

// ── 신고 등록 (community_posts에 category='__신고__' 로 저장) ──
export async function addReport(
  data: Omit<Report, 'id' | 'createdAt'>
): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false
  const row = {
    id:              Date.now().toString(),
    title:           `[신고] ${data.postTitle}`,
    content:         JSON.stringify({
      postId:           data.postId,
      postTitle:        data.postTitle,
      reporterId:       data.reporterId,
      reporterNickname: data.reporterNickname,
      reason:           data.reason,
      detail:           data.detail,
    }),
    category:        '__신고__',
    author_id:       data.reporterId,
    author_nickname: data.reporterNickname,
    views:           0,
    likes:           0,
    dislikes:        0,
    images:          [],
    created_at:      new Date().toISOString(),
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/community_posts`, {
    method:  'POST',
    headers: { ...h(), Prefer: 'return=minimal' },
    body:    JSON.stringify(row),
  }).catch(() => null)
  if (res?.ok) markReported(data.reporterId, data.postId)
  return !!(res?.ok)
}

// ── 신고 목록 조회 (관리자 전용) ──
export async function getReports(): Promise<Report[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return []
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/community_posts?category=eq.__신고__&order=created_at.desc`,
    { headers: h() }
  ).catch(() => null)
  if (!res?.ok) return []
  const data: any[] = await res.json()
  return data.map(row => {
    let p: any = {}
    try { p = JSON.parse(row.content || '{}') } catch {}
    return {
      id:               row.id,
      postId:           p.postId           ?? '',
      postTitle:        p.postTitle        ?? row.title.replace('[신고] ', ''),
      reporterId:       row.author_id,
      reporterNickname: row.author_nickname,
      reason:           p.reason           ?? '',
      detail:           p.detail           ?? '',
      createdAt:        row.created_at,
    }
  })
}

// ── 신고 삭제 ──
export async function deleteReport(id: string): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/community_posts?id=eq.${encodeURIComponent(id)}`,
    { method: 'DELETE', headers: h() }
  ).catch(() => null)
  return !!(res?.ok)
}
