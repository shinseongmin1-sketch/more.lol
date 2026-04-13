export interface LevelInfo {
  level:   number
  name:    string
  icon:    string
  color:   string
  bg:      string
  border:  string
  minXp:   number
  maxXp:   number
}

export const LEVELS: LevelInfo[] = [
  { level:1,  name:"루키",   icon:"🥚", color:"#9ca3af", bg:"rgba(156,163,175,0.12)", border:"rgba(156,163,175,0.35)", minXp:0,    maxXp:50   },
  { level:2,  name:"견습생", icon:"🌱", color:"#22c55e", bg:"rgba(34,197,94,0.12)",   border:"rgba(34,197,94,0.4)",   minXp:50,   maxXp:130  },
  { level:3,  name:"탐험가", icon:"🌊", color:"#06b6d4", bg:"rgba(6,182,212,0.12)",   border:"rgba(6,182,212,0.4)",   minXp:130,  maxXp:250  },
  { level:4,  name:"전사",   icon:"🛡️", color:"#3b82f6", bg:"rgba(59,130,246,0.12)",  border:"rgba(59,130,246,0.4)",  minXp:250,  maxXp:430  },
  { level:5,  name:"기사",   icon:"⚔️", color:"#8b5cf6", bg:"rgba(139,92,246,0.12)",  border:"rgba(139,92,246,0.4)",  minXp:430,  maxXp:680  },
  { level:6,  name:"용사",   icon:"🔥", color:"#f97316", bg:"rgba(249,115,22,0.12)",  border:"rgba(249,115,22,0.4)",  minXp:680,  maxXp:1000 },
  { level:7,  name:"영웅",   icon:"💎", color:"#ef4444", bg:"rgba(239,68,68,0.12)",   border:"rgba(239,68,68,0.4)",   minXp:1000, maxXp:1500 },
  { level:8,  name:"전설",   icon:"👑", color:"#f59e0b", bg:"rgba(245,158,11,0.12)",  border:"rgba(245,158,11,0.4)",  minXp:1500, maxXp:2200 },
  { level:9,  name:"신화",   icon:"🌟", color:"#ec4899", bg:"rgba(236,72,153,0.12)",  border:"rgba(236,72,153,0.4)",  minXp:2200, maxXp:3200 },
  { level:10, name:"불멸자", icon:"⚡", color:"#7c3aed", bg:"rgba(124,58,237,0.15)",  border:"rgba(124,58,237,0.5)",  minXp:3200, maxXp:99999 },
]

// XP 계산: 게시글 10xp, 댓글 3xp, 받은좋아요 1xp
export function calcXp(postCount: number, commentCount: number, likeCount: number): number {
  return postCount * 10 + commentCount * 3 + likeCount * 1
}

export function getLevelData(xp: number) {
  let info = LEVELS[0]
  for (const lv of LEVELS) {
    if (xp >= lv.minXp) info = lv
  }
  const next = LEVELS.find(l => l.level === info.level + 1) ?? null
  const progress = next
    ? Math.round(((xp - info.minXp) / (next.minXp - info.minXp)) * 100)
    : 100
  const xpInLevel  = xp - info.minXp
  const xpForNext  = next ? next.minXp - info.minXp : 0
  return { info, next, progress: Math.min(progress, 100), xpInLevel, xpForNext, totalXp: xp }
}
