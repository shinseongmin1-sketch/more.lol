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
  pinned: false,
  isNew: false,
}

// 다크/라이트 모드 출시 공지
const NOTICE_DARKMODE: Notice = {
  id: 'notice-darkmode-2026',
  tag: 'update',
  tagLabel: '업데이트',
  title: '[업데이트] 다크 모드 / 라이트 모드 선택 기능 출시',
  content: `안녕하세요, more.lol 운영팀입니다.

이번 업데이트를 통해 다크 모드 / 라이트 모드 테마 선택 기능이 정식 출시되었습니다.

──────────────────────────────
■ 업데이트 내용
──────────────────────────────

▶ 다크 모드 지원
  - 어두운 환경에서도 눈의 피로 없이 편안하게 이용하실 수 있도록
    다크 모드를 새롭게 지원합니다.

▶ 라이트 모드 지원
  - 기존의 밝고 깔끔한 라이트 모드는 그대로 유지됩니다.

▶ 테마 전환 방법
  - 상단 헤더 우측의 토글 버튼(☀️ / 🌙)을 클릭하시면
    즉시 테마를 전환하실 수 있습니다.

▶ 자동 저장
  - 선택하신 테마는 브라우저에 자동 저장되어
    다음 방문 시에도 동일한 테마로 유지됩니다.

▶ 시스템 연동
  - 최초 방문 시 운영체제(Windows / macOS / Android / iOS)의
    다크 모드 설정을 자동으로 감지하여 적용됩니다.

──────────────────────────────
■ 안내 사항
──────────────────────────────

  - 일부 구형 브라우저에서는 테마 전환이 정상적으로 동작하지 않을 수 있습니다.
  - 서비스 이용 중 불편하신 점은 고객센터(문의하기)를 통해 접수해 주시기 바랍니다.

앞으로도 more.lol은 더 나은 서비스 경험을 제공하기 위해 지속적으로 개선해 나가겠습니다.

감사합니다.
more.lol 운영팀 드림`,
  date: '2026.04.17',
  views: 0,
  pinned: true,
  isNew: true,
}

const INJECTED_IDS = [NOTICE_DARKMODE.id]

function init() {
  if (!localStorage.getItem(KEY)) {
    localStorage.setItem(KEY, JSON.stringify([NOTICE_DARKMODE, SEED]))
    return
  }
  // 기존 유저: 아직 없는 공지만 맨 앞에 주입
  const notices: Notice[] = JSON.parse(localStorage.getItem(KEY) || '[]')
  const existingIds = new Set(notices.map(n => n.id))
  const toInject = [NOTICE_DARKMODE].filter(n => !existingIds.has(n.id))
  if (toInject.length > 0) {
    localStorage.setItem(KEY, JSON.stringify([...toInject, ...notices]))
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
