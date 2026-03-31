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

const USERS_KEY = 'morelol_users'
const SESSION_KEY = 'morelol_session'

function getUsers(): StoredUser[] {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function signup(id: string, password: string, nickname: string): { ok: boolean; error?: string } {
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
