export interface LevelInfo {
  level:    number
  name:     string
  icon:     string
  color:    string
  bg:       string
  border:   string
  minCount: number
}

// 티어 정의: maxLevel 이하인 레벨에 적용
const TIERS = [
  { maxLevel:  5,        name:'루키',   icon:'🥚', color:'#9ca3af', bg:'rgba(156,163,175,0.12)', border:'rgba(156,163,175,0.35)' },
  { maxLevel: 10,        name:'견습생', icon:'🌱', color:'#22c55e', bg:'rgba(34,197,94,0.12)',   border:'rgba(34,197,94,0.4)'   },
  { maxLevel: 20,        name:'탐험가', icon:'🌊', color:'#06b6d4', bg:'rgba(6,182,212,0.12)',   border:'rgba(6,182,212,0.4)'   },
  { maxLevel: 35,        name:'전사',   icon:'🛡️', color:'#3b82f6', bg:'rgba(59,130,246,0.12)',  border:'rgba(59,130,246,0.4)'  },
  { maxLevel: 55,        name:'기사',   icon:'⚔️', color:'#8b5cf6', bg:'rgba(139,92,246,0.12)',  border:'rgba(139,92,246,0.4)'  },
  { maxLevel: 80,        name:'용사',   icon:'🔥', color:'#f97316', bg:'rgba(249,115,22,0.12)',  border:'rgba(249,115,22,0.4)'  },
  { maxLevel: 110,       name:'영웅',   icon:'💎', color:'#ef4444', bg:'rgba(239,68,68,0.12)',   border:'rgba(239,68,68,0.4)'   },
  { maxLevel: 150,       name:'전설',   icon:'👑', color:'#f59e0b', bg:'rgba(245,158,11,0.12)',  border:'rgba(245,158,11,0.4)'  },
  { maxLevel: 200,       name:'신화',   icon:'🌟', color:'#ec4899', bg:'rgba(236,72,153,0.12)',  border:'rgba(236,72,153,0.4)'  },
  { maxLevel: Infinity,  name:'불멸자', icon:'⚡', color:'#7c3aed', bg:'rgba(124,58,237,0.15)',  border:'rgba(124,58,237,0.5)'  },
]

function getTier(level: number) {
  return TIERS.find(t => level <= t.maxLevel) ?? TIERS[TIERS.length - 1]
}

// 레벨별 최소 횟수: (level - 1) * 3
function minCountForLevel(level: number): number {
  return (level - 1) * 3
}

export function makeLevelInfo(level: number): LevelInfo {
  const tier = getTier(level)
  return {
    level,
    minCount: minCountForLevel(level),
    name:   tier.name,
    icon:   tier.icon,
    color:  tier.color,
    bg:     tier.bg,
    border: tier.border,
  }
}

// 총 활동 횟수 = 게시글 + 댓글 + 받은 좋아요
export function calcCount(posts: number, comments: number, likes: number): number {
  return posts + comments + likes
}

export function getLevelData(totalCount: number) {
  // level = floor(count / 3) + 1
  const level      = Math.floor(totalCount / 3) + 1
  const info       = makeLevelInfo(level)
  const next       = makeLevelInfo(level + 1)
  const countInLevel = totalCount - info.minCount   // 0~2
  const countForNext = 3
  const progress     = Math.round((countInLevel / countForNext) * 100)
  return { info, next, progress, countInLevel, countForNext, totalCount }
}

// 프로필 페이지 레벨 로드맵용: 현재 레벨 주변 표시
export function getNearbyLevels(currentLevel: number): LevelInfo[] {
  const from = Math.max(1, currentLevel - 2)
  const to   = currentLevel + 7
  const result: LevelInfo[] = []
  for (let lv = from; lv <= to; lv++) {
    result.push(makeLevelInfo(lv))
  }
  return result
}
