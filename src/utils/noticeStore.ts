export interface Notice {
  id: string
  tag: 'general' | 'update' | 'event' | 'check'
  tagLabel: string
  title: string
  content: string
  date: string
  views: number
  pinned: boolean
  isNew: boolean
}

const KEY = 'morelol_notices'
export const ADMIN_IDS = ['ssm1909']

const TAG_LABELS: Record<string, string> = {
  general: '일반', update: '업데이트', event: '이벤트', check: '점검',
}

// 최초 실행 시 오픈 공지 시드
const SEED: Notice = {
  id: 'seed-open',
  tag: 'general',
  tagLabel: '일반',
  title: 'more.lol 서비스 오픈 안내',
  content: '안녕하세요, more.lol 팀입니다.\n\nmore.lol이 정식 오픈했습니다.\n더 깊은 전적 분석과 정확한 티어 정보를 제공하기 위해 최선을 다하겠습니다.\n\n앞으로도 많은 이용 부탁드립니다.\n감사합니다.',
  date: '2026.03.31',
  views: 0,
  pinned: true,
  isNew: true,
}

function init() {
  if (!localStorage.getItem(KEY)) {
    localStorage.setItem(KEY, JSON.stringify([SEED]))
  }
}

export function getNotices(): Notice[] {
  init()
  return JSON.parse(localStorage.getItem(KEY) || '[]')
}

export function addNotice(fields: {
  tag: Notice['tag']
  title: string
  content: string
  pinned: boolean
}): Notice {
  init()
  const notices = getNotices()
  const today = new Date()
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2,'0')}.${String(today.getDate()).padStart(2,'0')}`
  const newNotice: Notice = {
    id: Date.now().toString(),
    tag: fields.tag,
    tagLabel: TAG_LABELS[fields.tag],
    title: fields.title,
    content: fields.content,
    date: dateStr,
    views: 0,
    pinned: fields.pinned,
    isNew: true,
  }
  // 고정 공지는 맨 앞, 나머지는 그 다음
  const pinned    = [newNotice, ...notices.filter(n => n.pinned && !fields.pinned ? true : false)]
  localStorage.setItem(KEY, JSON.stringify([newNotice, ...notices]))
  return newNotice
}

export function incrementNoticeViews(id: string) {
  const notices = getNotices()
  const idx = notices.findIndex(n => n.id === id)
  if (idx === -1) return
  notices[idx] = { ...notices[idx], views: notices[idx].views + 1 }
  localStorage.setItem(KEY, JSON.stringify(notices))
}

export function deleteNotice(id: string) {
  const notices = getNotices().filter(n => n.id !== id)
  localStorage.setItem(KEY, JSON.stringify(notices))
}

export function isAdmin(userId?: string | null): boolean {
  return !!userId && ADMIN_IDS.includes(userId)
}
