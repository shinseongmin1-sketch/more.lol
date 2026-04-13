export interface LevelInfo {
  level:    number
  name:     string
  icon:     string
  color:    string
  bg:       string
  border:   string
  minCount: number
}

// 카테고리 (동→은→금 순으로 각 10레벨씩, 총 500레벨+)
const CATEGORIES: { name: string; icons: [string, string, string] }[] = [
  { name: '메달',      icons: ['🥉', '🥈', '🥇'] },
  { name: '트로피',    icons: ['🏆', '🏆', '🏆'] },
  { name: '실드',      icons: ['🛡️', '🛡️', '🛡️'] },
  { name: '크레스트',  icons: ['⚜️', '⚜️', '⚜️'] },
  { name: '엠블럼',    icons: ['🔰', '🔰', '🔰'] },
  { name: '크라운',    icons: ['👑', '👑', '👑'] },
  { name: '스타',      icons: ['⭐', '⭐', '⭐'] },
  { name: '에이스',    icons: ['♠️', '♠️', '♠️'] },
  { name: '아너',      icons: ['🎖️', '🎖️', '🎖️'] },
  { name: '프레스티지', icons: ['💠', '💠', '💠'] },
  { name: '엘리트',    icons: ['🔷', '🔷', '🔷'] },
  { name: '마에스트로', icons: ['🎭', '🎭', '🎭'] },
  { name: '베테랑',    icons: ['🎗️', '🎗️', '🎗️'] },
  { name: '아이콘',    icons: ['🔮', '🔮', '🔮'] },
  { name: '서프림',    icons: ['🌐', '🌐', '🌐'] },
  { name: '레가시',    icons: ['🔱', '🔱', '🔱'] },
  { name: '그랜드',    icons: ['♾️', '♾️', '♾️'] },
]

const GRADES = [
  { prefix: '동', color: '#cd7f32', bg: 'rgba(205,127,50,0.13)',  border: 'rgba(205,127,50,0.45)'  },
  { prefix: '은', color: '#9dafc2', bg: 'rgba(157,175,194,0.13)', border: 'rgba(157,175,194,0.45)' },
  { prefix: '금', color: '#f5a623', bg: 'rgba(245,166,35,0.13)',  border: 'rgba(245,166,35,0.45)'  },
]

function getTierForLevel(level: number) {
  const idx      = Math.floor((level - 1) / 10)
  const catIdx   = Math.floor(idx / 3)
  const gradeIdx = idx % 3
  const cat      = CATEGORIES[Math.min(catIdx, CATEGORIES.length - 1)]
  const grade    = GRADES[gradeIdx]
  return {
    name:   grade.prefix + ' ' + cat.name,
    icon:   cat.icons[gradeIdx],
    color:  grade.color,
    bg:     grade.bg,
    border: grade.border,
  }
}

function minCountForLevel(level: number): number {
  return (level - 1) * 3
}

export function makeLevelInfo(level: number): LevelInfo {
  const tier = getTierForLevel(level)
  return { level, minCount: minCountForLevel(level), ...tier }
}

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

export function getNearbyLevels(currentLevel: number): LevelInfo[] {
  const from = Math.max(1, currentLevel - 2)
  const to   = currentLevel + 7
  const result: LevelInfo[] = []
  for (let lv = from; lv <= to; lv++) {
    result.push(makeLevelInfo(lv))
  }
  return result
}

export interface TierBlock {
  fromLevel: number
  toLevel:   number
  name:      string
  icon:      string
  color:     string
  bg:        string
  border:    string
  minCount:  number  // 이 티어에 진입하는 최소 횟수
}

// 전체 레벨 보기용: 10레벨 단위 티어 블록 목록 (레벨 1~510)
export function getTierList(): TierBlock[] {
  const tiers: TierBlock[] = []
  for (let i = 0; i < CATEGORIES.length * 3; i++) {
    const fromLevel = i * 10 + 1
    const toLevel   = i * 10 + 10
    const tier      = getTierForLevel(fromLevel)
    tiers.push({
      fromLevel,
      toLevel,
      minCount: minCountForLevel(fromLevel),
      ...tier,
    })
  }
  return tiers
}
