const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

function h() {
  return {
    'Content-Type': 'application/json',
    apikey:        SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  }
}

export interface User {
  id:        string
  nickname:  string
  createdAt: string
}

const SESSION_KEY  = 'morelol_session'
const ADMIN_NICKNAME = '관리자'
const TWO_MONTHS   = 60 * 24 * 60 * 60 * 1000

// ── Session (localStorage 캐시) ───────────────────────

export function getSession(): User | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') }
  catch { return null }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export function isAdmin(user: User | null): boolean {
  return user?.nickname === ADMIN_NICKNAME
}

// ── Supabase ──────────────────────────────────────────

export async function getReactivationDate(id: string): Promise<Date | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/community_deleted_users?id=eq.${encodeURIComponent(id)}&limit=1`,
    { headers: h() }
  ).catch(() => null)
  if (!res?.ok) return null
  const [row] = await res.json()
  if (!row) return null
  const unlock = new Date(new Date(row.deleted_at).getTime() + TWO_MONTHS)
  return unlock > new Date() ? unlock : null
}

export async function signup(
  id: string, password: string, nickname: string
): Promise<{ ok: boolean; error?: string; user?: User }> {
  if (id === ADMIN_ID) return { ok: false, error: '이미 사용 중인 아이디입니다.' }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { ok: false, error: '서버 연결 오류' }

  const reactivation = await getReactivationDate(id)
  if (reactivation) {
    const d = reactivation
    return { ok: false, error: `탈퇴한 아이디입니다. ${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일 이후 재가입 가능합니다.` }
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/community_users`, {
    method:  'POST',
    headers: { ...h(), Prefer: 'return=minimal' },
    body:    JSON.stringify({ id, nickname, password, created_at: new Date().toISOString() }),
  }).catch(() => null)

  if (!res) return { ok: false, error: '네트워크 오류' }
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    if (txt.includes('nickname')) return { ok: false, error: '이미 사용 중인 닉네임입니다.' }
    return { ok: false, error: '이미 사용 중인 아이디입니다.' }
  }

  const user: User = { id, nickname, createdAt: new Date().toISOString() }
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  return { ok: true, user }
}

export async function login(
  id: string, password: string
): Promise<{ ok: boolean; error?: string; user?: User }> {
  // 관리자 계정 (DB 저장 안 함)
  if (id === ADMIN_ID) {
    if (password !== ADMIN_PW) return { ok: false, error: '아이디 또는 비밀번호가 올바르지 않습니다.' }
    const user: User = { id: ADMIN_ID, nickname: '관리자', createdAt: '2026-03-31T00:00:00.000Z' }
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return { ok: true, user }
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { ok: false, error: '서버 연결 오류' }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/community_users?id=eq.${encodeURIComponent(id)}&limit=1`,
    { headers: h() }
  ).catch(() => null)

  if (!res?.ok) return { ok: false, error: '네트워크 오류' }
  const [found] = await res.json()
  if (!found || found.password !== password)
    return { ok: false, error: '아이디 또는 비밀번호가 올바르지 않습니다.' }

  const user: User = { id: found.id, nickname: found.nickname, createdAt: found.created_at }
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  return { ok: true, user }
}

export async function updateNickname(
  userId: string, newNickname: string
): Promise<{ ok: boolean; error?: string }> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { ok: false, error: '서버 연결 오류' }
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/community_users?id=eq.${encodeURIComponent(userId)}`,
    {
      method:  'PATCH',
      headers: { ...h(), Prefer: 'return=minimal' },
      body:    JSON.stringify({ nickname: newNickname }),
    }
  ).catch(() => null)
  if (!res) return { ok: false, error: '네트워크 오류' }
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    if (txt.includes('nickname')) return { ok: false, error: '이미 사용 중인 닉네임입니다.' }
    return { ok: false, error: '닉네임 변경 오류' }
  }
  const session = getSession()
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, nickname: newNickname }))
  return { ok: true }
}

export async function updatePassword(
  userId: string, currentPw: string, newPw: string
): Promise<{ ok: boolean; error?: string }> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { ok: false, error: '서버 연결 오류' }
  const check = await fetch(
    `${SUPABASE_URL}/rest/v1/community_users?id=eq.${encodeURIComponent(userId)}&limit=1`,
    { headers: h() }
  ).catch(() => null)
  if (!check?.ok) return { ok: false, error: '네트워크 오류' }
  const [found] = await check.json()
  if (!found || found.password !== currentPw) return { ok: false, error: '현재 비밀번호가 올바르지 않습니다.' }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/community_users?id=eq.${encodeURIComponent(userId)}`,
    {
      method:  'PATCH',
      headers: { ...h(), Prefer: 'return=minimal' },
      body:    JSON.stringify({ password: newPw }),
    }
  ).catch(() => null)
  if (!res?.ok) return { ok: false, error: '비밀번호 변경 오류' }
  return { ok: true }
}

export async function deleteAccount(userId: string): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return
  const base = SUPABASE_URL
  const hd   = h()

  // 댓글·반응 먼저 삭제 (다른 사람 게시글에 달린 것 포함)
  await Promise.allSettled([
    fetch(`${base}/rest/v1/community_comments?author_id=eq.${encodeURIComponent(userId)}`,
      { method: 'DELETE', headers: hd }),
    fetch(`${base}/rest/v1/community_post_reactions?user_id=eq.${encodeURIComponent(userId)}`,
      { method: 'DELETE', headers: hd }),
  ])
  // 게시글 삭제 (CASCADE: 게시글의 댓글·반응 자동 삭제)
  await fetch(`${base}/rest/v1/community_posts?author_id=eq.${encodeURIComponent(userId)}`,
    { method: 'DELETE', headers: hd }).catch(() => {})
  // 계정 삭제 + 탈퇴 기록
  await Promise.allSettled([
    fetch(`${base}/rest/v1/community_users?id=eq.${encodeURIComponent(userId)}`,
      { method: 'DELETE', headers: hd }),
    fetch(`${base}/rest/v1/community_deleted_users`, {
      method: 'POST',
      headers: { ...hd, Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ id: userId, deleted_at: new Date().toISOString() }),
    }),
  ])
  logout()
}
