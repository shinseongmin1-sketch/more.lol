export interface User {
  id: string
  nickname: string
  createdAt: string
}

interface StoredUser {
  id: string
  password: string
  nickname: string
  createdAt: string
}

const USERS_KEY    = 'morelol_users'
const SESSION_KEY  = 'morelol_session'
const DELETED_KEY  = 'morelol_deleted_ids' // { [id]: deletedAt ISO string }
const TWO_MONTHS_MS = 60 * 24 * 60 * 60 * 1000 // 60일

function getDeletedMap(): Record<string, string> {
  return JSON.parse(localStorage.getItem(DELETED_KEY) || '{}')
}

function pruneDeletedMap(): Record<string, string> {
  const map = getDeletedMap()
  const now = Date.now()
  let changed = false
  for (const id of Object.keys(map)) {
    if (now - new Date(map[id]).getTime() >= TWO_MONTHS_MS) {
      delete map[id]
      changed = true
    }
  }
  if (changed) localStorage.setItem(DELETED_KEY, JSON.stringify(map))
  return map
}

/** 탈퇴 후 재가입 가능 날짜 반환. 제한 없으면 null. */
export function getReactivationDate(id: string): Date | null {
  const map = pruneDeletedMap()
  if (!map[id]) return null
  const unlockAt = new Date(new Date(map[id]).getTime() + TWO_MONTHS_MS)
  return unlockAt > new Date() ? unlockAt : null
}

const ADMIN_SEED: StoredUser = {
  id: 'ssm1909',
  password: '@tlstjdals12',
  nickname: '관리자',
  createdAt: '2026-03-31T00:00:00.000Z',
}

function getUsers(): StoredUser[] {
  const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  if (!users.find(u => u.id === ADMIN_SEED.id)) {
    users.unshift(ADMIN_SEED)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }
  return users
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function signup(id: string, password: string, nickname: string): { ok: boolean; error?: string } {
  const reactivationDate = getReactivationDate(id)
  if (reactivationDate) {
    const d = reactivationDate
    const dateStr = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
    return { ok: false, error: `탈퇴한 아이디입니다. ${dateStr} 이후 재가입 가능합니다.` }
  }
  const users = getUsers()
  if (users.find(u => u.id === id)) return { ok: false, error: '이미 사용 중인 아이디입니다.' }
  if (users.find(u => u.nickname === nickname)) return { ok: false, error: '이미 사용 중인 닉네임입니다.' }
  const newUser: StoredUser = { id, password, nickname, createdAt: new Date().toISOString() }
  saveUsers([...users, newUser])
  const session: User = { id, nickname, createdAt: newUser.createdAt }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return { ok: true }
}

export function login(id: string, password: string): { ok: boolean; error?: string; user?: User } {
  const users = getUsers()
  const found = users.find(u => u.id === id && u.password === password)
  if (!found) return { ok: false, error: '아이디 또는 비밀번호가 올바르지 않습니다.' }
  const session: User = { id: found.id, nickname: found.nickname, createdAt: found.createdAt }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return { ok: true, user: session }
}

export function updateNickname(userId: string, newNickname: string): { ok: boolean; error?: string } {
  const users = getUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return { ok: false, error: '사용자를 찾을 수 없습니다.' }
  if (users.find(u => u.nickname === newNickname && u.id !== userId))
    return { ok: false, error: '이미 사용 중인 닉네임입니다.' }
  users[idx] = { ...users[idx], nickname: newNickname }
  saveUsers(users)
  const session = getSession()
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, nickname: newNickname }))
  return { ok: true }
}

export function updatePassword(userId: string, currentPw: string, newPw: string): { ok: boolean; error?: string } {
  const users = getUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return { ok: false, error: '사용자를 찾을 수 없습니다.' }
  if (users[idx].password !== currentPw) return { ok: false, error: '현재 비밀번호가 올바르지 않습니다.' }
  users[idx] = { ...users[idx], password: newPw }
  saveUsers(users)
  return { ok: true }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export function getSession(): User | null {
  const raw = localStorage.getItem(SESSION_KEY)
  return raw ? JSON.parse(raw) : null
}

export function isAdmin(user: User | null): boolean {
  return user?.id === ADMIN_SEED.id
}

export function deleteAccount(userId: string): void {
  // 탈퇴 아이디 기록 (2개월 재가입 제한)
  const map = getDeletedMap()
  map[userId] = new Date().toISOString()
  localStorage.setItem(DELETED_KEY, JSON.stringify(map))
  // 계정 삭제
  const users = getUsers().filter(u => u.id !== userId)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  // 세션 삭제
  localStorage.removeItem(SESSION_KEY)
  // 게시글 / 댓글 삭제
  const POSTS_KEY    = 'morelol_posts'
  const COMMENTS_KEY = 'morelol_comments'
  const LIKES_KEY    = 'morelol_post_likes'
  const DISLIKES_KEY = 'morelol_post_dislikes'
  const posts = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]')
  const remaining = posts.filter((p: any) => p.authorId !== userId)
  const removedIds: string[] = posts.filter((p: any) => p.authorId === userId).map((p: any) => p.id)
  localStorage.setItem(POSTS_KEY, JSON.stringify(remaining))
  const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]')
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(
    comments.filter((c: any) => c.authorId !== userId && !removedIds.includes(c.postId))
  ))
  // 좋아요/싫어요 기록 정리
  const cleanMap = (key: string) => {
    const map: Record<string, string[]> = JSON.parse(localStorage.getItem(key) || '{}')
    for (const postId of Object.keys(map)) {
      if (removedIds.includes(postId)) { delete map[postId]; continue }
      map[postId] = map[postId].filter((id: string) => id !== userId)
    }
    localStorage.setItem(key, JSON.stringify(map))
  }
  cleanMap(LIKES_KEY)
  cleanMap(DISLIKES_KEY)
}
