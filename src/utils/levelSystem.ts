export interface LevelInfo {
  level:    number
  name:     string
  icon:     string
  color:    string
  bg:       string
  border:   string
  minCount: number
}

// 티어: maxLevel 이하 레벨에 적용
const TIERS = [
  { maxLevel:  10, name:'동메달',     icon:'🥉', color:'#cd7f32', bg:'rgba(205,127,50,0.12)',  border:'rgba(205,127,50,0.4)'  },
  { maxLevel:  20, name:'은메달',     icon:'🥈', color:'#9ca3af', bg:'rgba(156,163,175,0.12)', border:'rgba(156,163,175,0.4)' },
  { maxLevel:  30, name:'금메달',     icon:'🥇', color:'#f59e0b', bg:'rgba(245,158,11,0.12)',  border:'rgba(245,158,11,0.4)'  },
  { maxLevel:  40, name:'은트로피',   icon:'🏆', color:'#8b9cb0', bg:'rgba(139,156,176,0.12)', border:'rgba(139,156,176,0.4)' },
  { maxLevel:  50, name:'금트로피',   icon:'🏆', color:'#f97316', bg:'rgba(249,115,22,0.12)',  border:'rgba(249,115,22,0.4)'  },
  { maxLevel:  60, name:'플래티넘',   icon:'💠', color:'#06b6d4', bg:'rgba(6,182,212,0.12)',   border:'rgba(6,182,212,0.4)'   },
  { maxLevel:  70, name:'다이아',     icon:'💎', color:'#3b82f6', bg:'rgba(59,130,246,0.12)',  border:'rgba(59,130,246,0.4)'  },
  { maxLevel:  80, name:'마스터',     icon:'🌟', color:'#8b5cf6', bg:'rgba(139,92,246,0.12)',  border:'rgba(139,92,246,0.4)'  },
  { maxLevel:  90, name:'그랜드마스터', icon:'✨', color:'#ec4899', bg:'rgba(236,72,153,0.12)',  border:'rgba(236,72,153,0.4)'  },
  { maxLevel: 100, name:'챌린저',     icon:'👑', color:'#ef4444', bg:'rgba(239,68,68,0.12)',   border:'rgba(239,68,68,0.4)'   },
  { maxLevel: Infinity, name:'레전드', icon:'⚡', color:'#7c3aed', bg:'rgba(124,58,237,0.15)',  border:'rgba(124,58,237,0.5)'  },
]

function getTier(level: number) {
  return TIERS.find(t => level <= t.maxLevel) ?? TIERS[TIERS.length - 1]
}

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
  const level        = Math.floor(totalCount / 3) + 1
  const info         = makeLevelInfo(level)
  const next         = makeLevelInfo(level + 1)
  const countInLevel = totalCount - info.minCount
  const countForNext = 3
  const progress     = Math.round((countInLevel / countForNext) * 100)
  return { info, next, progress, countInLevel, countForNext, totalCount }
}

// 프로필 로드맵용: 현재 레벨 주변 표시
export function getNearbyLevels(currentLevel: number): LevelInfo[] {
  const from = Math.max(1, currentLevel - 2)
  const to   = currentLevel + 7
  const result: LevelInfo[] = []
  for (let lv = from; lv <= to; lv++) {
    result.push(makeLevelInfo(lv))
  }
  return result
}
