export interface LevelInfo {
  level:    number
  name:     string
  icon:     string
  color:    string
  bg:       string
  border:   string
  minCount: number
}

export const LEVELS: LevelInfo[] = [
  { level:1,  name:'루키',   icon:'🥚', color:'#9ca3af', bg:'rgba(156,163,175,0.12)', border:'rgba(156,163,175,0.35)', minCount:0   },
  { level:2,  name:'견습생', icon:'🌱', color:'#22c55e', bg:'rgba(34,197,94,0.12)',   border:'rgba(34,197,94,0.4)',   minCount:5   },
  { level:3,  name:'탐험가', icon:'🌊', color:'#06b6d4', bg:'rgba(6,182,212,0.12)',   border:'rgba(6,182,212,0.4)',   minCount:15  },
  { level:4,  name:'전사',   icon:'🛡️', color:'#3b82f6', bg:'rgba(59,130,246,0.12)',  border:'rgba(59,130,246,0.4)',  minCount:30  },
  { level:5,  name:'기사',   icon:'⚔️', color:'#8b5cf6', bg:'rgba(139,92,246,0.12)',  border:'rgba(139,92,246,0.4)',  minCount:55  },
  { level:6,  name:'용사',   icon:'🔥', color:'#f97316', bg:'rgba(249,115,22,0.12)',  border:'rgba(249,115,22,0.4)',  minCount:90  },
  { level:7,  name:'영웅',   icon:'💎', color:'#ef4444', bg:'rgba(239,68,68,0.12)',   border:'rgba(239,68,68,0.4)',   minCount:140 },
  { level:8,  name:'전설',   icon:'👑', color:'#f59e0b', bg:'rgba(245,158,11,0.12)',  border:'rgba(245,158,11,0.4)',  minCount:210 },
  { level:9,  name:'신화',   icon:'🌟', color:'#ec4899', bg:'rgba(236,72,153,0.12)',  border:'rgba(236,72,153,0.4)',  minCount:300 },
  { level:10, name:'불멸자', icon:'⚡', color:'#7c3aed', bg:'rgba(124,58,237,0.15)',  border:'rgba(124,58,237,0.5)',  minCount:420 },
]

// 총 활동 횟수 = 게시글 + 댓글 + 받은 좋아요
export function calcCount(posts: number, comments: number, likes: number): number {
  return posts + comments + likes
}

export function getLevelData(totalCount: number) {
  let info = LEVELS[0]
  for (const lv of LEVELS) {
    if (totalCount >= lv.minCount) info = lv
  }
  const next     = LEVELS.find(l => l.level === info.level + 1) ?? null
  const progress = next
    ? Math.min(100, Math.round(((totalCount - info.minCount) / (next.minCount - info.minCount)) * 100))
    : 100
  const countInLevel = totalCount - info.minCount
  const countForNext = next ? next.minCount - info.minCount : 0
  return { info, next, progress, countInLevel, countForNext, totalCount }
}
