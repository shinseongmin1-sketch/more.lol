// ─── Garen 빌드 데이터 (Top 기준, 16.7 패치) ───

export const RUNE_BASE = 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/'

export interface RuneItem { id: number; name: string; icon: string }
export interface ItemData { id: string; name: string; winRate?: number; pickRate?: number }

// ── 주 룬 트리 (정밀) ─────────────────────────────────
export const primaryTree = {
  id: 8000, name: '정밀',
  icon: RUNE_BASE + 'Styles/7201_Precision.png',
  keystones: [
    { id: 8005, name: '격전', icon: RUNE_BASE + 'Styles/Precision/PressTheAttack/PressTheAttack.png' },
    { id: 8008, name: '집중 공격', icon: RUNE_BASE + 'Styles/Precision/LethalTempo/LethalTempoTemp.png' },
    { id: 8010, name: '정복자', icon: RUNE_BASE + 'Styles/Precision/Conqueror/Conqueror.png' },
    { id: 8021, name: '함대 발놀림', icon: RUNE_BASE + 'Styles/Precision/FleetFootwork/FleetFootwork.png' },
  ],
  row1: [
    { id: 9101, name: '생명 흡수', icon: RUNE_BASE + 'Styles/Precision/AbsorbLife/AbsorbLife.png' },
    { id: 9111, name: '개선', icon: RUNE_BASE + 'Styles/Precision/Triumph.png' },
    { id: 8009, name: '집중력', icon: RUNE_BASE + 'Styles/Precision/PresenceOfMind/PresenceOfMind.png' },
  ],
  row2: [
    { id: 9104, name: '전설: 민첩함', icon: RUNE_BASE + 'Styles/Precision/LegendAlacrity/LegendAlacrity.png' },
    { id: 9105, name: '전설: 신속함', icon: RUNE_BASE + 'Styles/Precision/LegendHaste/LegendHaste.png' },
    { id: 9103, name: '전설: 피의 맛', icon: RUNE_BASE + 'Styles/Precision/LegendBloodline/LegendBloodline.png' },
  ],
  row3: [
    { id: 8014, name: '최후의 일격', icon: RUNE_BASE + 'Styles/Precision/CoupDeGrace/CoupDeGrace.png' },
    { id: 8017, name: '격파', icon: RUNE_BASE + 'Styles/Precision/CutDown/CutDown.png' },
    { id: 8299, name: '최후의 저항', icon: RUNE_BASE + 'Styles/Sorcery/LastStand/LastStand.png' },
  ],
}

// ── 보조 룬 (결의) ─────────────────────────────────
export const secondaryTree = {
  id: 8400, name: '결의',
  icon: RUNE_BASE + 'Styles/7204_Resolve.png',
  selected: [
    { id: 8473, name: '뼈 방패', icon: RUNE_BASE + 'Styles/Resolve/BonePlating/BonePlating.png' },
    { id: 8242, name: '굳건함', icon: RUNE_BASE + 'Styles/Sorcery/Unflinching/Unflinching.png' },
  ],
}

// ── 스탯 파편 ─────────────────────────────────────
export const statShards = {
  offense: [
    { id: 5008, name: '적응형 능력치', icon: RUNE_BASE + 'StatMods/StatModsAdaptiveForceIcon.png' },
    { id: 5005, name: '공격 속도', icon: RUNE_BASE + 'StatMods/StatModsAttackSpeedIcon.png' },
    { id: 5007, name: '스킬 가속', icon: RUNE_BASE + 'StatMods/StatModsCDRScalingIcon.png' },
  ],
  flex: [
    { id: 5008, name: '적응형 능력치', icon: RUNE_BASE + 'StatMods/StatModsAdaptiveForceIcon.png' },
    { id: 5002, name: '방어력', icon: RUNE_BASE + 'StatMods/StatModsArmorIcon.png' },
    { id: 5003, name: '마법 저항력', icon: RUNE_BASE + 'StatMods/StatModsMagicResIcon.png' },
  ],
  defense: [
    { id: 5001, name: '체력 (성장)', icon: RUNE_BASE + 'StatMods/StatModsHealthPlusIcon.png' },
    { id: 5002, name: '방어력', icon: RUNE_BASE + 'StatMods/StatModsArmorIcon.png' },
    { id: 5003, name: '마법 저항력', icon: RUNE_BASE + 'StatMods/StatModsMagicResIcon.png' },
  ],
  selected: [5008, 5002, 5001] as number[],
}

// ── 선택된 룬 ID 세트 ─────────────────────────────
export const selectedRunes = new Set([8010, 9111, 9104, 8299, 8473, 8242])

// ── 스킬 순서 (레벨 1~18) ─────────────────────────
// E 선마 → Q → W 순
export const skillOrder = ['E','Q','W','E','E','R','E','E','Q','Q','R','Q','Q','W','W','R','W','W']
export const skillMaxOrder = ['E', 'Q', 'W'] // max 순서

// ── 아이템 빌드 ───────────────────────────────────
export const startItems: ItemData[] = [
  { id: '1054', name: '도란의 방패' },
  { id: '2003', name: '체력 물약' },
]

export const boots: ItemData = { id: '3047', name: '강철 발목 보호대', winRate: 53.1, pickRate: 71.2 }

export const coreItems: ItemData[] = [
  { id: '3078', name: '삼위일체', winRate: 54.2, pickRate: 68.4 },
  { id: '3742', name: '망자의 갑옷', winRate: 53.7, pickRate: 61.1 },
  { id: '3071', name: '검은 분쇄자', winRate: 53.0, pickRate: 52.3 },
]

export const fullBuild: ItemData[] = [
  { id: '3078', name: '삼위일체' },
  { id: '3047', name: '강철 발목 보호대' },
  { id: '3742', name: '망자의 갑옷' },
  { id: '3071', name: '검은 분쇄자' },
  { id: '3033', name: '치명적 기억' },
  { id: '3083', name: '웜 갑옷' },
]

export const situationalItems: ItemData[] = [
  { id: '3089', name: '자연의 힘' },
  { id: '3143', name: '랜드리의 고통' },
  { id: '3111', name: '마법사의 신발' },
  { id: '6665', name: '의지의 갑옷' },
]

// ── 소환사 주문 ───────────────────────────────────
export const summonerSpells = [
  { id: 'SummonerFlash',   name: '점멸' },
  { id: 'SummonerDot',     name: '점화' },
]

// ── 요약 스탯 ─────────────────────────────────────
export const buildStats = {
  tier: 'S',
  winRate: 52.8,
  pickRate: 8.4,
  banRate: 3.2,
  games: 124850,
}
