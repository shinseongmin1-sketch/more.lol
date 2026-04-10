// ── 공통 룬 기반 URL ──────────────────────────────────
export const R = 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/'

// ── 룬 트리 아이콘 ────────────────────────────────────
export const TREE_ICONS: Record<string, string> = {
  precision:   R + 'Styles/7201_Precision.png',
  domination:  R + 'Styles/7200_Domination.png',
  sorcery:     R + 'Styles/7202_Sorcery.png',
  resolve:     R + 'Styles/7204_Resolve.png',
  inspiration: R + 'Styles/7203_Whimsy.png',
}

// ── 룬 데이터 정의 ────────────────────────────────────
export const RUNES = {
  // 정밀
  conqueror:       { id: 8010, name: '정복자',       icon: R+'Styles/Precision/Conqueror/Conqueror.png' },
  pressTheAttack:  { id: 8005, name: '격전',         icon: R+'Styles/Precision/PressTheAttack/PressTheAttack.png' },
  lethalTempo:     { id: 8008, name: '집중 공격',    icon: R+'Styles/Precision/LethalTempo/LethalTempoTemp.png' },
  fleetFootwork:   { id: 8021, name: '함대 발놀림',  icon: R+'Styles/Precision/FleetFootwork/FleetFootwork.png' },
  absorb:          { id: 9101, name: '생명 흡수',    icon: R+'Styles/Precision/AbsorbLife/AbsorbLife.png' },
  triumph:         { id: 9111, name: '개선',         icon: R+'Styles/Precision/Triumph.png' },
  presence:        { id: 8009, name: '집중력',       icon: R+'Styles/Precision/PresenceOfMind/PresenceOfMind.png' },
  alacrity:        { id: 9104, name: '전설: 민첩함', icon: R+'Styles/Precision/LegendAlacrity/LegendAlacrity.png' },
  haste:           { id: 9105, name: '전설: 신속함', icon: R+'Styles/Precision/LegendHaste/LegendHaste.png' },
  bloodline:       { id: 9103, name: '전설: 피의 맛',icon: R+'Styles/Precision/LegendBloodline/LegendBloodline.png' },
  coupDeGrace:     { id: 8014, name: '최후의 일격',  icon: R+'Styles/Precision/CoupDeGrace/CoupDeGrace.png' },
  cutDown:         { id: 8017, name: '격파',         icon: R+'Styles/Precision/CutDown/CutDown.png' },
  lastStand:       { id: 8299, name: '최후의 저항',  icon: R+'Styles/Sorcery/LastStand/LastStand.png' },
  // 지배
  electrocute:     { id: 8112, name: '감전',         icon: R+'Styles/Domination/Electrocute/Electrocute.png' },
  darkHarvest:     { id: 8128, name: '어둠의 수확',  icon: R+'Styles/Domination/DarkHarvest/DarkHarvest.png' },
  hailOfBlades:    { id: 9923, name: '칼날비',       icon: R+'Styles/Domination/HailOfBlades/HailOfBlades.png' },
  cheapShot:       { id: 8126, name: '저렴한 일격',  icon: R+'Styles/Domination/CheapShot/CheapShot.png' },
  tasteOfBlood:    { id: 8139, name: '피의 맛',      icon: R+'Styles/Domination/TasteOfBlood/GreenTerror_TasteOfBlood.png' },
  suddenImpact:    { id: 8143, name: '갑작스러운 충격',icon: R+'Styles/Domination/SuddenImpact/SuddenImpact.png' },
  sixthSense:      { id: 8137, name: '육감',         icon: R+'Styles/Domination/SixthSense/SixthSense.png' },
  grisly:          { id: 8140, name: '소름 끼치는 기념품',icon: R+'Styles/Domination/GrislyMementos/GrislyMementos.png' },
  treasureHunter:  { id: 8135, name: '보물 사냥꾼',  icon: R+'Styles/Domination/TreasureHunter/TreasureHunter.png' },
  relentless:      { id: 8105, name: '지칠 줄 모르는 사냥꾼',icon: R+'Styles/Domination/RelentlessHunter/RelentlessHunter.png' },
  ultimateHunter:  { id: 8106, name: '궁극의 사냥꾼',icon: R+'Styles/Domination/UltimateHunter/UltimateHunter.png' },
  // 마법
  arcaneComet:     { id: 8229, name: '비전 혜성',    icon: R+'Styles/Sorcery/ArcaneComet/ArcaneComet.png' },
  summonAery:      { id: 8214, name: '서약의 정령',  icon: R+'Styles/Sorcery/SummonAery/SummonAery.png' },
  phaseRush:       { id: 8230, name: '단계적 돌진',  icon: R+'Styles/Sorcery/PhaseRush/PhaseRush.png' },
  manaflow:        { id: 8226, name: '마나흐름 밴드',icon: R+'Styles/Sorcery/ManaflowBand/ManaflowBand.png' },
  nimbusCloak:     { id: 8275, name: '권능의 망토',  icon: R+'Styles/Sorcery/NimbusCloak/6361.png' },
  transcendence:   { id: 8210, name: '초월',         icon: R+'Styles/Sorcery/Transcendence/Transcendence.png' },
  celerity:        { id: 8234, name: '민첩함',       icon: R+'Styles/Sorcery/Celerity/CelerityTemp.png' },
  absoluteFocus:   { id: 8233, name: '완전한 집중',  icon: R+'Styles/Sorcery/AbsoluteFocus/AbsoluteFocus.png' },
  scorch:          { id: 8237, name: '작열',         icon: R+'Styles/Sorcery/Scorch/Scorch.png' },
  waterwalking:    { id: 8232, name: '수상 이동',    icon: R+'Styles/Sorcery/Waterwalking/Waterwalking.png' },
  gatheringStorm:  { id: 8236, name: '폭풍 집결',   icon: R+'Styles/Sorcery/GatheringStorm/GatheringStorm.png' },
  // 결의
  graspUndying:    { id: 8437, name: '죽지 않는 손아귀',icon: R+'Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png' },
  aftershock:      { id: 8439, name: '여진',         icon: R+'Styles/Resolve/VeteranAftershock/VeteranAftershock.png' },
  guardian:        { id: 8465, name: '수호자',       icon: R+'Styles/Resolve/Guardian/Guardian.png' },
  demolish:        { id: 8446, name: '해체',         icon: R+'Styles/Resolve/Demolish/Demolish.png' },
  fontOfLife:      { id: 8463, name: '생명의 샘',    icon: R+'Styles/Resolve/FontOfLife/FontOfLife.png' },
  shieldBash:      { id: 8401, name: '방패 강타',    icon: R+'Styles/Resolve/MirrorShell/MirrorShell.png' },
  conditioning:    { id: 8429, name: '조율',         icon: R+'Styles/Resolve/Conditioning/Conditioning.png' },
  secondWind:      { id: 8444, name: '두 번째 바람', icon: R+'Styles/Resolve/SecondWind/SecondWind.png' },
  bonePlating:     { id: 8473, name: '뼈 방패',      icon: R+'Styles/Resolve/BonePlating/BonePlating.png' },
  overgrowth:      { id: 8451, name: '과성장',       icon: R+'Styles/Resolve/Overgrowth/Overgrowth.png' },
  revitalize:      { id: 8453, name: '소생',         icon: R+'Styles/Resolve/Revitalize/Revitalize.png' },
  unflinching:     { id: 8242, name: '굳건함',       icon: R+'Styles/Sorcery/Unflinching/Unflinching.png' },
  // 영감
  glacialAugment:  { id: 8351, name: '빙결 강화',    icon: R+'Styles/Inspiration/GlacialAugment/GlacialAugment.png' },
  firstStrike:     { id: 8369, name: '선빵 필살',    icon: R+'Styles/Inspiration/FirstStrike/FirstStrike.png' },
  biscuit:         { id: 8345, name: '비스킷 배달',  icon: R+'Styles/Inspiration/BiscuitDelivery/BiscuitDelivery.png' },
  cosmicInsight:   { id: 8347, name: '우주적 통찰',  icon: R+'Styles/Inspiration/CosmicInsight/CosmicInsight.png' },
  magicalFootwear: { id: 8304, name: '마법의 신발',  icon: R+'Styles/Inspiration/MagicalFootwear/MagicalFootwear.png' },
}

// ── 스탯 파편 ─────────────────────────────────────────
export const STAT_SHARDS = {
  adaptive:  { id: 5008, name: '적응형 능력치', icon: R+'StatMods/StatModsAdaptiveForceIcon.png' },
  atkSpd:    { id: 5005, name: '공격 속도',     icon: R+'StatMods/StatModsAttackSpeedIcon.png' },
  abilHaste: { id: 5007, name: '스킬 가속',     icon: R+'StatMods/StatModsCDRScalingIcon.png' },
  armor:     { id: 5002, name: '방어력',         icon: R+'StatMods/StatModsArmorIcon.png' },
  magicRes:  { id: 5003, name: '마법 저항력',   icon: R+'StatMods/StatModsMagicResIcon.png' },
  health:    { id: 5001, name: '체력',           icon: R+'StatMods/StatModsHealthPlusIcon.png' },
}

// ── 아이템 ID ─────────────────────────────────────────
export const ITEMS = {
  doranShield:    { id:'1054', name:'도란의 방패' },
  doranBlade:     { id:'1055', name:'도란의 검' },
  doranRing:      { id:'1056', name:'도란의 반지' },
  hpPotion:       { id:'2003', name:'체력 물약' },
  steelcaps:      { id:'3047', name:'강철 발목 보호대' },
  mercTreads:     { id:'3111', name:'마법사의 신발 (방저)' },
  sorcShoes:      { id:'3020', name:'마법사의 신발' },
  berserkers:     { id:'3006', name:'광전사의 군화' },
  swiftBoots:     { id:'3009', name:'신속의 장화' },
  ionianBoots:    { id:'3158', name:'아이오니아 장화' },
  trinity:        { id:'3078', name:'삼위일체' },
  deadMan:        { id:'3742', name:'망자의 갑옷' },
  blackCleaver:   { id:'3071', name:'검은 분쇄자' },
  mortalReminder: { id:'3033', name:'치명적 기억' },
  warmog:         { id:'3083', name:'웜 갑옷' },
  guardianAngel:  { id:'3026', name:'수호 천사' },
  infinityEdge:   { id:'3031', name:'무한의 대검' },
  bork:           { id:'3153', name:'몰락한 왕의 검' },
  zhonyas:        { id:'3157', name:"조냐의 모래시계" },
  rabadons:       { id:'3089', name:"라바돈의 죽음 모자" },
  shurelyas:      { id:'2065', name:"슈렐리아의 군가" },
  serpentsFang:   { id:'3814', name:'서펜트 팡' },
  youmuus:        { id:'3142', name:"유령 검" },
}

// ── 스킬 순서 생성기 ──────────────────────────────────
export function makeSkillOrder(a: string, b: string, c: string): string[] {
  const res: string[] = []
  const cnt: Record<string,number> = {Q:0,W:0,E:0,R:0}
  const rLv = new Set([6,11,16])
  for (let lv = 1; lv <= 18; lv++) {
    if (rLv.has(lv)) { res.push('R'); continue }
    if (cnt[a] < 5) { res.push(a); cnt[a]++; continue }
    if (cnt[b] < 5) { res.push(b); cnt[b]++; continue }
    res.push(c); cnt[c]++
  }
  return res
}

// ── 역할별 빌드 템플릿 ────────────────────────────────
export type RoleName = 'fighter'|'tank'|'mage'|'assassin'|'marksman'|'supportEnchant'|'supportTank'|'jungler'

export interface BuildTemplate {
  primaryTreeName: string
  primaryTreeIcon: string
  keystones: typeof RUNES[keyof typeof RUNES][]
  row1: typeof RUNES[keyof typeof RUNES][]
  row2: typeof RUNES[keyof typeof RUNES][]
  row3: typeof RUNES[keyof typeof RUNES][]
  selectedKeystone: number
  selectedRow1: number
  selectedRow2: number
  selectedRow3: number
  secondaryTreeName: string
  secondaryTreeIcon: string
  secondaryRune1: typeof RUNES[keyof typeof RUNES]
  secondaryRune2: typeof RUNES[keyof typeof RUNES]
  shardOff: typeof STAT_SHARDS[keyof typeof STAT_SHARDS]
  shardFlex: typeof STAT_SHARDS[keyof typeof STAT_SHARDS]
  shardDef: typeof STAT_SHARDS[keyof typeof STAT_SHARDS]
  startItems: {id:string;name:string}[]
  boots: {id:string;name:string}
  coreItems: {id:string;name:string}[]
  fullBuild: {id:string;name:string}[]
  skillMaxOrder: [string,string,string]
}

const PRECISION_ROWS = {
  keystones: [RUNES.pressTheAttack, RUNES.lethalTempo, RUNES.conqueror, RUNES.fleetFootwork],
  row1: [RUNES.absorb, RUNES.triumph, RUNES.presence],
  row2: [RUNES.alacrity, RUNES.haste, RUNES.bloodline],
  row3: [RUNES.coupDeGrace, RUNES.cutDown, RUNES.lastStand],
}
const DOMINATION_ROWS = {
  keystones: [RUNES.electrocute, RUNES.darkHarvest, RUNES.hailOfBlades],
  row1: [RUNES.cheapShot, RUNES.tasteOfBlood, RUNES.suddenImpact],
  row2: [RUNES.sixthSense, RUNES.grisly, RUNES.treasureHunter],
  row3: [RUNES.relentless, RUNES.ultimateHunter],
}
const SORCERY_ROWS = {
  keystones: [RUNES.arcaneComet, RUNES.summonAery, RUNES.phaseRush],
  row1: [RUNES.manaflow, RUNES.nimbusCloak],
  row2: [RUNES.transcendence, RUNES.celerity, RUNES.absoluteFocus],
  row3: [RUNES.scorch, RUNES.waterwalking, RUNES.gatheringStorm],
}
const RESOLVE_ROWS = {
  keystones: [RUNES.graspUndying, RUNES.aftershock, RUNES.guardian],
  row1: [RUNES.demolish, RUNES.fontOfLife, RUNES.shieldBash],
  row2: [RUNES.conditioning, RUNES.secondWind, RUNES.bonePlating],
  row3: [RUNES.overgrowth, RUNES.revitalize, RUNES.unflinching],
}

export const TEMPLATES: Record<RoleName, BuildTemplate> = {

  // ── 전사 (탑/정글 브루저) ───────────────────────────
  fighter: {
    primaryTreeName: '정밀', primaryTreeIcon: TREE_ICONS.precision,
    ...PRECISION_ROWS,
    selectedKeystone: RUNES.conqueror.id,
    selectedRow1: RUNES.triumph.id,
    selectedRow2: RUNES.alacrity.id,
    selectedRow3: RUNES.lastStand.id,
    secondaryTreeName: '결의', secondaryTreeIcon: TREE_ICONS.resolve,
    secondaryRune1: RUNES.bonePlating, secondaryRune2: RUNES.unflinching,
    shardOff: STAT_SHARDS.adaptive, shardFlex: STAT_SHARDS.armor, shardDef: STAT_SHARDS.health,
    startItems: [ITEMS.doranShield, ITEMS.hpPotion],
    boots: ITEMS.steelcaps,
    coreItems: [ITEMS.trinity, ITEMS.deadMan, ITEMS.blackCleaver],
    fullBuild: [ITEMS.trinity, ITEMS.steelcaps, ITEMS.deadMan, ITEMS.blackCleaver, ITEMS.mortalReminder, ITEMS.warmog],
    skillMaxOrder: ['E','Q','W'],
  },

  // ── 탱커 ───────────────────────────────────────────
  tank: {
    primaryTreeName: '결의', primaryTreeIcon: TREE_ICONS.resolve,
    ...RESOLVE_ROWS,
    selectedKeystone: RUNES.graspUndying.id,
    selectedRow1: RUNES.demolish.id,
    selectedRow2: RUNES.secondWind.id,
    selectedRow3: RUNES.overgrowth.id,
    secondaryTreeName: '정밀', secondaryTreeIcon: TREE_ICONS.precision,
    secondaryRune1: RUNES.triumph, secondaryRune2: RUNES.alacrity,
    shardOff: STAT_SHARDS.armor, shardFlex: STAT_SHARDS.armor, shardDef: STAT_SHARDS.health,
    startItems: [ITEMS.doranShield, ITEMS.hpPotion],
    boots: ITEMS.steelcaps,
    coreItems: [ITEMS.warmog, ITEMS.deadMan, ITEMS.blackCleaver],
    fullBuild: [ITEMS.steelcaps, ITEMS.warmog, ITEMS.deadMan, ITEMS.blackCleaver, ITEMS.mortalReminder, ITEMS.guardianAngel],
    skillMaxOrder: ['W','E','Q'],
  },

  // ── 마법사 ─────────────────────────────────────────
  mage: {
    primaryTreeName: '마법', primaryTreeIcon: TREE_ICONS.sorcery,
    ...SORCERY_ROWS,
    selectedKeystone: RUNES.arcaneComet.id,
    selectedRow1: RUNES.manaflow.id,
    selectedRow2: RUNES.transcendence.id,
    selectedRow3: RUNES.scorch.id,
    secondaryTreeName: '영감', secondaryTreeIcon: TREE_ICONS.inspiration,
    secondaryRune1: RUNES.biscuit, secondaryRune2: RUNES.cosmicInsight,
    shardOff: STAT_SHARDS.adaptive, shardFlex: STAT_SHARDS.adaptive, shardDef: STAT_SHARDS.health,
    startItems: [ITEMS.doranRing, ITEMS.hpPotion],
    boots: ITEMS.sorcShoes,
    coreItems: [ITEMS.zhonyas, ITEMS.rabadons, ITEMS.guardianAngel],
    fullBuild: [ITEMS.sorcShoes, ITEMS.zhonyas, ITEMS.rabadons, ITEMS.guardianAngel, ITEMS.warmog, ITEMS.deadMan],
    skillMaxOrder: ['Q','W','E'],
  },

  // ── 암살자 ─────────────────────────────────────────
  assassin: {
    primaryTreeName: '지배', primaryTreeIcon: TREE_ICONS.domination,
    ...DOMINATION_ROWS,
    selectedKeystone: RUNES.electrocute.id,
    selectedRow1: RUNES.suddenImpact.id,
    selectedRow2: RUNES.treasureHunter.id,
    selectedRow3: RUNES.relentless.id,
    secondaryTreeName: '정밀', secondaryTreeIcon: TREE_ICONS.precision,
    secondaryRune1: RUNES.triumph, secondaryRune2: RUNES.alacrity,
    shardOff: STAT_SHARDS.adaptive, shardFlex: STAT_SHARDS.adaptive, shardDef: STAT_SHARDS.health,
    startItems: [ITEMS.doranBlade, ITEMS.hpPotion],
    boots: ITEMS.steelcaps,
    coreItems: [ITEMS.youmuus, ITEMS.serpentsFang, ITEMS.guardianAngel],
    fullBuild: [ITEMS.youmuus, ITEMS.steelcaps, ITEMS.serpentsFang, ITEMS.guardianAngel, ITEMS.warmog, ITEMS.deadMan],
    skillMaxOrder: ['Q','E','W'],
  },

  // ── 원거리 딜러 ────────────────────────────────────
  marksman: {
    primaryTreeName: '정밀', primaryTreeIcon: TREE_ICONS.precision,
    ...PRECISION_ROWS,
    selectedKeystone: RUNES.lethalTempo.id,
    selectedRow1: RUNES.absorb.id,
    selectedRow2: RUNES.alacrity.id,
    selectedRow3: RUNES.coupDeGrace.id,
    secondaryTreeName: '마법', secondaryTreeIcon: TREE_ICONS.sorcery,
    secondaryRune1: RUNES.absoluteFocus, secondaryRune2: RUNES.gatheringStorm,
    shardOff: STAT_SHARDS.atkSpd, shardFlex: STAT_SHARDS.adaptive, shardDef: STAT_SHARDS.health,
    startItems: [ITEMS.doranBlade, ITEMS.hpPotion],
    boots: ITEMS.berserkers,
    coreItems: [ITEMS.infinityEdge, ITEMS.bork, ITEMS.guardianAngel],
    fullBuild: [ITEMS.infinityEdge, ITEMS.berserkers, ITEMS.bork, ITEMS.guardianAngel, ITEMS.warmog, ITEMS.deadMan],
    skillMaxOrder: ['Q','W','E'],
  },

  // ── 인챈터 서포터 ─────────────────────────────────
  supportEnchant: {
    primaryTreeName: '마법', primaryTreeIcon: TREE_ICONS.sorcery,
    ...SORCERY_ROWS,
    selectedKeystone: RUNES.summonAery.id,
    selectedRow1: RUNES.manaflow.id,
    selectedRow2: RUNES.transcendence.id,
    selectedRow3: RUNES.scorch.id,
    secondaryTreeName: '영감', secondaryTreeIcon: TREE_ICONS.inspiration,
    secondaryRune1: RUNES.biscuit, secondaryRune2: RUNES.cosmicInsight,
    shardOff: STAT_SHARDS.adaptive, shardFlex: STAT_SHARDS.adaptive, shardDef: STAT_SHARDS.health,
    startItems: [ITEMS.doranRing, ITEMS.hpPotion],
    boots: ITEMS.ionianBoots,
    coreItems: [ITEMS.shurelyas, ITEMS.warmog, ITEMS.guardianAngel],
    fullBuild: [ITEMS.shurelyas, ITEMS.ionianBoots, ITEMS.warmog, ITEMS.guardianAngel, ITEMS.deadMan, ITEMS.zhonyas],
    skillMaxOrder: ['E','Q','W'],
  },

  // ── 탱커 서포터 ────────────────────────────────────
  supportTank: {
    primaryTreeName: '결의', primaryTreeIcon: TREE_ICONS.resolve,
    ...RESOLVE_ROWS,
    selectedKeystone: RUNES.aftershock.id,
    selectedRow1: RUNES.fontOfLife.id,
    selectedRow2: RUNES.bonePlating.id,
    selectedRow3: RUNES.revitalize.id,
    secondaryTreeName: '영감', secondaryTreeIcon: TREE_ICONS.inspiration,
    secondaryRune1: RUNES.biscuit, secondaryRune2: RUNES.cosmicInsight,
    shardOff: STAT_SHARDS.armor, shardFlex: STAT_SHARDS.armor, shardDef: STAT_SHARDS.health,
    startItems: [ITEMS.doranShield, ITEMS.hpPotion],
    boots: ITEMS.swiftBoots,
    coreItems: [ITEMS.warmog, ITEMS.deadMan, ITEMS.guardianAngel],
    fullBuild: [ITEMS.swiftBoots, ITEMS.warmog, ITEMS.deadMan, ITEMS.guardianAngel, ITEMS.blackCleaver, ITEMS.mortalReminder],
    skillMaxOrder: ['W','E','Q'],
  },

  // ── 정글 (범용 브루저형) ───────────────────────────
  jungler: {
    primaryTreeName: '정밀', primaryTreeIcon: TREE_ICONS.precision,
    ...PRECISION_ROWS,
    selectedKeystone: RUNES.conqueror.id,
    selectedRow1: RUNES.triumph.id,
    selectedRow2: RUNES.alacrity.id,
    selectedRow3: RUNES.lastStand.id,
    secondaryTreeName: '결의', secondaryTreeIcon: TREE_ICONS.resolve,
    secondaryRune1: RUNES.bonePlating, secondaryRune2: RUNES.overgrowth,
    shardOff: STAT_SHARDS.adaptive, shardFlex: STAT_SHARDS.armor, shardDef: STAT_SHARDS.health,
    startItems: [ITEMS.doranShield, ITEMS.hpPotion],
    boots: ITEMS.steelcaps,
    coreItems: [ITEMS.blackCleaver, ITEMS.deadMan, ITEMS.warmog],
    fullBuild: [ITEMS.blackCleaver, ITEMS.steelcaps, ITEMS.deadMan, ITEMS.warmog, ITEMS.mortalReminder, ITEMS.guardianAngel],
    skillMaxOrder: ['Q', 'E', 'W'],
  },
}

// ── 태그 → 역할 매핑 ──────────────────────────────────
export function getRoleFromTags(tags: string[], position?: string): RoleName {
  const pos = position?.toUpperCase()
  const hasTag = (t: string) => tags.includes(t)

  if (pos === 'UTILITY') {
    return hasTag('Tank') ? 'supportTank' : 'supportEnchant'
  }
  if (hasTag('Marksman')) return 'marksman'
  if (hasTag('Assassin') && !hasTag('Fighter')) return 'assassin'
  if (hasTag('Mage') && !hasTag('Fighter') && !hasTag('Tank')) return 'mage'
  if (hasTag('Tank') && !hasTag('Fighter')) return 'tank'
  if (hasTag('Support') && !hasTag('Fighter')) return 'supportEnchant'
  return 'fighter'
}
