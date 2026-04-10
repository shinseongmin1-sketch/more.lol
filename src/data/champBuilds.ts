// 챔피언별 소환사 주문 / 아이템 빌드 / 스킬 순서 오버라이드
// 없으면 role 기반 템플릿으로 폴백

type Spell = { id: string; name: string }
type Item  = { id: string; name: string }

export interface ChampBuild {
  summoners:     [Spell, Spell]
  startItems:    Item[]
  boots:         Item
  coreItems:     Item[]
  fullBuild:     Item[]
  skillMaxOrder: [string, string, string]
}

/* ── 소환사 주문 ──────────────────────────────────────── */
const FL: Spell = { id: 'SummonerFlash',    name: '점멸' }
const IG: Spell = { id: 'SummonerDot',      name: '점화' }
const GH: Spell = { id: 'SummonerHaste',    name: '유령' }
const TP: Spell = { id: 'SummonerTeleport', name: '순간이동' }
const HL: Spell = { id: 'SummonerHeal',     name: '회복' }
const BR: Spell = { id: 'SummonerBarrier',  name: '방어막' }
const EX: Spell = { id: 'SummonerExhaust',  name: '탈진' }
const SM: Spell = { id: 'SummonerSmite',    name: '강타' }

/* ── 아이템 ──────────────────────────────────────────── */
const doranShield:    Item = { id:'1054', name:'도란의 방패' }
const doranBlade:     Item = { id:'1055', name:'도란의 검' }
const doranRing:      Item = { id:'1056', name:'도란의 반지' }
const hpPot:          Item = { id:'2003', name:'체력 물약' }
const longSword:      Item = { id:'1036', name:'긴 검' }
// 신발
const steelcaps:      Item = { id:'3047', name:'강철 발목 보호대' }
// const mercTreads:  Item = { id:'3111', name:'마법 저항력 신발' }
const sorcShoes:      Item = { id:'3020', name:'마법사의 신발' }
const berserkers:     Item = { id:'3006', name:'광전사의 군화' }
const swiftBoots:     Item = { id:'3009', name:'신속의 장화' }
const ionianBoots:    Item = { id:'3158', name:'아이오니아 장화' }
// 전사/탱커
const trinity:        Item = { id:'3078', name:'삼위일체' }
const deadMan:        Item = { id:'3742', name:'망자의 갑옷' }
const blackCleaver:   Item = { id:'3071', name:'검은 분쇄자' }
const mortalReminder: Item = { id:'3033', name:'치명적 기억' }
const warmog:         Item = { id:'3083', name:'웜 갑옷' }
const guardianAngel:  Item = { id:'3026', name:'수호 천사' }
const sunfire:        Item = { id:'3068', name:'쐐기불꽃 방패' }
const heartsteel:     Item = { id:'3441', name:'심장강철' }
const frozenHeart:    Item = { id:'3110', name:'얼어붙은 심장' }
const hullbreaker:    Item = { id:'3709', name:'파선자' }
// const thornmail:   Item = { id:'3075', name:'가시 갑옷' }
// const gargoyle:    Item = { id:'3193', name:'가고일 석판' }
const steraks:        Item = { id:'3053', name:'스테락의 뒤틀린 갑주' }
// 원딜/물리
const ie:             Item = { id:'3031', name:'무한의 대검' }
const bork:           Item = { id:'3153', name:'몰락한 왕의 검' }
const kraken:         Item = { id:'6672', name:'크라켄 학살자' }
const runaans:        Item = { id:'3085', name:'루난의 폭풍' }
const immortalBow:    Item = { id:'6673', name:'불멸의 방패활' }
const galeforce:      Item = { id:'6671', name:'질풍검' }
const serpentsFang:   Item = { id:'3814', name:'서펜트 팡' }
const youmuus:        Item = { id:'3142', name:'유령 검' }
// AP
const rabadons:       Item = { id:'3089', name:"라바돈의 죽음 모자" }
const zhonyas:        Item = { id:'3157', name:"조냐의 모래시계" }
const voidStaff:      Item = { id:'3135', name:'공허 지팡이' }
const shadowflame:    Item = { id:'4645', name:'그림자 불꽃' }
const liandrys:       Item = { id:'6653', name:'리안드리의 고통' }
const ludens:         Item = { id:'6655', name:'루덴의 동반자' }
const nashorsTooth:   Item = { id:'3115', name:'내셔의 이빨' }
const lichBane:       Item = { id:'3100', name:'리치 베인' }
const riftmaker:      Item = { id:'4633', name:'리프트메이커' }
const rocketBelt:     Item = { id:'3152', name:'헥스테크 로켓 벨트' }
const cosmicDrive:    Item = { id:'4629', name:'코스믹 드라이브' }
// 서포터
const moonstone:      Item = { id:'6617', name:'달빛 돌' }
const ardentCenser:   Item = { id:'3504', name:'열의의 향로' }
const staffFlowing:   Item = { id:'6616', name:'흐르는 물의 지팡이' }
const redemption:     Item = { id:'3107', name:'구원' }
const shurelyas:      Item = { id:'2065', name:'슈렐리아의 군가' }
const locketSolari:   Item = { id:'3190', name:'철의 솔라리 상징' }
// 기타
const manamune:       Item = { id:'3004', name:'마나무네' }

/* ── 챔피언별 빌드 ────────────────────────────────────── */
export const CHAMP_BUILDS: Record<string, ChampBuild> = {

  // ══ 탑 ══════════════════════════════════════════════

  Garen: {
    summoners: [GH, FL],
    startItems: [doranShield, hpPot],
    boots: steelcaps,
    coreItems: [trinity, blackCleaver, deadMan],
    fullBuild: [trinity, steelcaps, blackCleaver, deadMan, mortalReminder, warmog],
    skillMaxOrder: ['E','Q','W'],
  },

  Darius: {
    summoners: [GH, FL],
    startItems: [doranShield, hpPot],
    boots: steelcaps,
    coreItems: [trinity, deadMan, blackCleaver],
    fullBuild: [trinity, steelcaps, deadMan, blackCleaver, steraks, mortalReminder],
    skillMaxOrder: ['Q','E','W'], // Q(도끼) 주딜+힐, E(끌어당기기) 방관, W 마지막
  },

  Malphite: {
    summoners: [TP, FL],
    startItems: [doranShield, hpPot],
    boots: steelcaps,
    coreItems: [sunfire, heartsteel, warmog],
    fullBuild: [steelcaps, sunfire, heartsteel, warmog, deadMan, frozenHeart],
    skillMaxOrder: ['E','W','Q'],
  },

  Teemo: {
    summoners: [IG, FL],
    startItems: [doranRing, hpPot],
    boots: sorcShoes,
    coreItems: [liandrys, shadowflame, nashorsTooth],
    fullBuild: [sorcShoes, liandrys, shadowflame, nashorsTooth, rabadons, voidStaff],
    skillMaxOrder: ['E','Q','W'], // E(독침) 주딜·지속딜, Q(실명) 2순위, W 마지막
  },

  Tryndamere: {
    summoners: [GH, FL],
    startItems: [longSword, hpPot],
    boots: berserkers,
    coreItems: [hullbreaker, ie, bork],
    fullBuild: [berserkers, hullbreaker, ie, bork, mortalReminder, guardianAngel],
    skillMaxOrder: ['E','Q','W'],
  },

  Riven: {
    summoners: [IG, FL],
    startItems: [longSword, hpPot],
    boots: steelcaps,
    coreItems: [trinity, blackCleaver, deadMan],
    fullBuild: [trinity, steelcaps, blackCleaver, deadMan, steraks, guardianAngel],
    skillMaxOrder: ['Q','E','W'],
  },

  Irelia: {
    summoners: [TP, FL],
    startItems: [doranBlade, hpPot],
    boots: steelcaps,
    coreItems: [trinity, deadMan, blackCleaver],
    fullBuild: [trinity, steelcaps, deadMan, blackCleaver, steraks, guardianAngel],
    skillMaxOrder: ['Q','E','W'], // Q(돌진·리셋) 주딜, E(스타서지·스턴) 쿨감, W 마지막
  },

  Fiora: {
    summoners: [TP, FL],
    startItems: [longSword, hpPot],
    boots: steelcaps,
    coreItems: [trinity, deadMan, mortalReminder],
    fullBuild: [trinity, steelcaps, deadMan, mortalReminder, guardianAngel, warmog],
    skillMaxOrder: ['Q','E','W'], // Q(돌격·찌르기) 주딜, E(도발·강화AA) 쿨감, W 마지막
  },

  Camille: {
    summoners: [TP, FL],
    startItems: [doranShield, hpPot],
    boots: steelcaps,
    coreItems: [trinity, blackCleaver, deadMan],
    fullBuild: [trinity, steelcaps, blackCleaver, deadMan, guardianAngel, warmog],
    skillMaxOrder: ['Q','W','E'], // Q(강화평타) 주딜, W(부채꼴슬로우+힐) 2순위, E 마지막
  },

  Urgot: {
    summoners: [TP, FL],
    startItems: [doranShield, hpPot],
    boots: steelcaps,
    coreItems: [trinity, blackCleaver, deadMan],
    fullBuild: [trinity, steelcaps, blackCleaver, deadMan, mortalReminder, warmog],
    skillMaxOrder: ['W','E','Q'], // W(퍼지·연속사격) 주딜, E(훅+돌진) 2순위, Q 마지막
  },

  Nasus: {
    summoners: [TP, FL],
    startItems: [doranShield, hpPot],
    boots: steelcaps,
    coreItems: [trinity, deadMan, frozenHeart],
    fullBuild: [trinity, steelcaps, deadMan, frozenHeart, warmog, heartsteel],
    skillMaxOrder: ['Q','W','E'],
  },

  // ══ 정글 ═════════════════════════════════════════════

  Amumu: {
    summoners: [SM, FL],
    startItems: [doranShield, hpPot],
    boots: steelcaps,
    coreItems: [sunfire, heartsteel, deadMan],
    fullBuild: [steelcaps, sunfire, heartsteel, deadMan, frozenHeart, warmog],
    skillMaxOrder: ['E','W','Q'],
  },

  LeeSin: {
    summoners: [SM, FL],
    startItems: [doranBlade, hpPot],
    boots: steelcaps,
    coreItems: [blackCleaver, deadMan, mortalReminder],
    fullBuild: [steelcaps, blackCleaver, deadMan, mortalReminder, guardianAngel, warmog],
    skillMaxOrder: ['Q','E','W'], // Q(음파) 주딜, E(점멸+슬로우) 쿨감, W 마지막
  },

  Vi: {
    summoners: [SM, FL],
    startItems: [doranShield, hpPot],
    boots: steelcaps,
    coreItems: [trinity, deadMan, blackCleaver],
    fullBuild: [trinity, steelcaps, deadMan, blackCleaver, guardianAngel, warmog],
    skillMaxOrder: ['Q','E','W'],
  },

  JarvanIV: {
    summoners: [SM, FL],
    startItems: [doranShield, hpPot],
    boots: steelcaps,
    coreItems: [trinity, deadMan, blackCleaver],
    fullBuild: [trinity, steelcaps, deadMan, blackCleaver, mortalReminder, guardianAngel],
    skillMaxOrder: ['Q','E','W'], // Q(돌진) 주딜, E(깃발·벽콤보) 쿨감, W 마지막
  },

  Graves: {
    summoners: [SM, FL],
    startItems: [doranBlade, hpPot],
    boots: steelcaps,
    coreItems: [ie, bork, mortalReminder],
    fullBuild: [steelcaps, ie, bork, mortalReminder, kraken, guardianAngel],
    skillMaxOrder: ['Q','E','W'], // Q(산탄) 주딜, E(대쉬) 쿨감, W 마지막
  },

  // ══ 미드 ═════════════════════════════════════════════

  Yone: {
    summoners: [IG, FL],
    startItems: [longSword, hpPot],
    boots: berserkers,
    coreItems: [immortalBow, kraken, bork],
    fullBuild: [berserkers, immortalBow, kraken, bork, ie, guardianAngel],
    skillMaxOrder: ['Q','E','W'],
  },

  Yasuo: {
    summoners: [IG, FL],
    startItems: [longSword, hpPot],
    boots: berserkers,
    coreItems: [immortalBow, kraken, ie],
    fullBuild: [berserkers, immortalBow, kraken, ie, bork, guardianAngel],
    skillMaxOrder: ['Q','E','W'],
  },

  Lux: {
    summoners: [IG, FL],
    startItems: [doranRing, hpPot],
    boots: sorcShoes,
    coreItems: [ludens, shadowflame, rabadons],
    fullBuild: [sorcShoes, ludens, shadowflame, rabadons, voidStaff, zhonyas],
    skillMaxOrder: ['E','Q','W'],
  },

  Ziggs: {
    summoners: [IG, FL],
    startItems: [doranRing, hpPot],
    boots: sorcShoes,
    coreItems: [ludens, shadowflame, rabadons],
    fullBuild: [sorcShoes, ludens, shadowflame, rabadons, voidStaff, zhonyas],
    skillMaxOrder: ['Q','E','W'], // Q(폭탄) 주딜·라인, E(지뢰) 슬로우·존, W 마지막
  },

  Xerath: {
    summoners: [BR, FL],
    startItems: [doranRing, hpPot],
    boots: sorcShoes,
    coreItems: [ludens, shadowflame, rabadons],
    fullBuild: [sorcShoes, ludens, shadowflame, rabadons, voidStaff, zhonyas],
    skillMaxOrder: ['Q','W','E'],
  },

  Veigar: {
    summoners: [IG, FL],
    startItems: [doranRing, hpPot],
    boots: sorcShoes,
    coreItems: [ludens, shadowflame, rabadons],
    fullBuild: [sorcShoes, ludens, shadowflame, rabadons, voidStaff, zhonyas],
    skillMaxOrder: ['Q','E','W'], // Q(사악한 일격·스택) 주딜, E(이벤트 호라이즌·케이지) 쿨감, W 마지막
  },

  Ahri: {
    summoners: [IG, FL],
    startItems: [doranRing, hpPot],
    boots: sorcShoes,
    coreItems: [ludens, shadowflame, rabadons],
    fullBuild: [sorcShoes, ludens, shadowflame, rabadons, voidStaff, zhonyas],
    skillMaxOrder: ['Q','W','E'],
  },

  Syndra: {
    summoners: [IG, FL],
    startItems: [doranRing, hpPot],
    boots: sorcShoes,
    coreItems: [ludens, shadowflame, rabadons],
    fullBuild: [sorcShoes, ludens, shadowflame, rabadons, voidStaff, zhonyas],
    skillMaxOrder: ['Q','E','W'],
  },

  Zoe: {
    summoners: [IG, FL],
    startItems: [doranRing, hpPot],
    boots: sorcShoes,
    coreItems: [ludens, shadowflame, rabadons],
    fullBuild: [sorcShoes, ludens, shadowflame, rabadons, voidStaff, zhonyas],
    skillMaxOrder: ['Q','E','W'], // Q(별똥별) 주딜, E(수면) 쿨감·CC, W 마지막
  },

  TwistedFate: {
    summoners: [IG, FL],
    startItems: [doranRing, hpPot],
    boots: sorcShoes,
    coreItems: [lichBane, shadowflame, rabadons],
    fullBuild: [sorcShoes, lichBane, shadowflame, rabadons, voidStaff, zhonyas],
    skillMaxOrder: ['Q','E','W'], // Q(와일드카드) 주딜, E(스택드덱·AS버프) 쿨감, W 마지막
  },

  Annie: {
    summoners: [IG, FL],
    startItems: [doranRing, hpPot],
    boots: sorcShoes,
    coreItems: [ludens, shadowflame, rabadons],
    fullBuild: [sorcShoes, ludens, shadowflame, rabadons, voidStaff, zhonyas],
    skillMaxOrder: ['Q','W','E'],
  },

  Zed: {
    summoners: [IG, FL],
    startItems: [longSword, hpPot],
    boots: steelcaps,
    coreItems: [youmuus, serpentsFang, deadMan],
    fullBuild: [steelcaps, youmuus, serpentsFang, deadMan, blackCleaver, guardianAngel],
    skillMaxOrder: ['Q','W','E'], // Q(표창) 주딜, W(그림자) 쿨감, E 마지막
  },

  Akali: {
    summoners: [IG, FL],
    startItems: [longSword, hpPot],
    boots: steelcaps,
    coreItems: [rocketBelt, shadowflame, rabadons],
    fullBuild: [steelcaps, rocketBelt, shadowflame, rabadons, voidStaff, zhonyas],
    skillMaxOrder: ['Q','E','W'],
  },

  Katarina: {
    summoners: [IG, FL],
    startItems: [longSword, hpPot],
    boots: sorcShoes,
    coreItems: [rocketBelt, shadowflame, rabadons],
    fullBuild: [sorcShoes, rocketBelt, shadowflame, rabadons, voidStaff, zhonyas],
    skillMaxOrder: ['E','Q','W'],
  },

  Diana: {
    summoners: [IG, FL],
    startItems: [doranRing, hpPot],
    boots: sorcShoes,
    coreItems: [riftmaker, nashorsTooth, rabadons],
    fullBuild: [sorcShoes, riftmaker, nashorsTooth, rabadons, voidStaff, zhonyas],
    skillMaxOrder: ['Q','E','W'], // Q(초승달) 주딜·마크, E(달빛돌진) 쿨감, W 마지막
  },

  Sylas: {
    summoners: [IG, FL],
    startItems: [doranRing, hpPot],
    boots: sorcShoes,
    coreItems: [riftmaker, nashorsTooth, cosmicDrive],
    fullBuild: [sorcShoes, riftmaker, nashorsTooth, cosmicDrive, rabadons, voidStaff],
    skillMaxOrder: ['W','Q','E'],
  },

  Orianna: {
    summoners: [IG, FL],
    startItems: [doranRing, hpPot],
    boots: sorcShoes,
    coreItems: [ludens, shadowflame, rabadons],
    fullBuild: [sorcShoes, ludens, shadowflame, rabadons, voidStaff, zhonyas],
    skillMaxOrder: ['Q','W','E'],
  },

  Fizz: {
    summoners: [IG, FL],
    startItems: [doranRing, hpPot],
    boots: sorcShoes,
    coreItems: [ludens, shadowflame, rabadons],
    fullBuild: [sorcShoes, ludens, shadowflame, rabadons, voidStaff, zhonyas],
    skillMaxOrder: ['Q','E','W'], // Q(돌진강타) 주딜, E(콩닥콩닥) 쿨감·회피, W 마지막
  },

  Ekko: {
    summoners: [IG, FL],
    startItems: [doranRing, hpPot],
    boots: sorcShoes,
    coreItems: [riftmaker, nashorsTooth, cosmicDrive],
    fullBuild: [sorcShoes, riftmaker, nashorsTooth, cosmicDrive, rabadons, zhonyas],
    skillMaxOrder: ['Q','W','E'],
  },

  // ══ 원딜 ═════════════════════════════════════════════

  Jinx: {
    summoners: [BR, FL],
    startItems: [doranBlade, hpPot],
    boots: berserkers,
    coreItems: [kraken, bork, ie],
    fullBuild: [berserkers, kraken, bork, ie, runaans, guardianAngel],
    skillMaxOrder: ['Q','W','E'],
  },

  Ezreal: {
    summoners: [HL, FL],
    startItems: [doranBlade, hpPot],
    boots: ionianBoots,
    coreItems: [trinity, manamune, bork],
    fullBuild: [ionianBoots, trinity, manamune, bork, shadowflame, guardianAngel],
    skillMaxOrder: ['Q','E','W'], // Q(신비로운 발사체) 주딜, E(섬광 수류탄·대쉬) 쿨감, W 마지막
  },

  MissFortune: {
    summoners: [BR, FL],
    startItems: [doranBlade, hpPot],
    boots: berserkers,
    coreItems: [kraken, bork, ie],
    fullBuild: [berserkers, kraken, bork, ie, mortalReminder, guardianAngel],
    skillMaxOrder: ['Q','E','W'],
  },

  Ashe: {
    summoners: [BR, FL],
    startItems: [doranBlade, hpPot],
    boots: berserkers,
    coreItems: [kraken, bork, ie],
    fullBuild: [berserkers, kraken, bork, ie, runaans, guardianAngel],
    skillMaxOrder: ['W','Q','E'],
  },

  Caitlyn: {
    summoners: [BR, FL],
    startItems: [doranBlade, hpPot],
    boots: berserkers,
    coreItems: [galeforce, ie, bork],
    fullBuild: [berserkers, galeforce, ie, bork, mortalReminder, guardianAngel],
    skillMaxOrder: ['Q','E','W'], // Q(필트오버 평화주의자·빔) 주딜, E(90구경 그물) 쿨감, W 마지막
  },

  Jhin: {
    summoners: [BR, FL],
    startItems: [doranBlade, hpPot],
    boots: swiftBoots,
    coreItems: [galeforce, ie, mortalReminder],
    fullBuild: [swiftBoots, galeforce, ie, mortalReminder, shadowflame, guardianAngel],
    skillMaxOrder: ['W','Q','E'], // W(원거리속박) 킬찬스, Q(도탄) 라인·딜, E 마지막
  },

  Vayne: {
    summoners: [IG, FL],
    startItems: [doranBlade, hpPot],
    boots: berserkers,
    coreItems: [kraken, bork, ie],
    fullBuild: [berserkers, kraken, bork, ie, mortalReminder, guardianAngel],
    skillMaxOrder: ['Q','E','W'],
  },

  Kaisa: {
    summoners: [BR, FL],
    startItems: [doranBlade, hpPot],
    boots: berserkers,
    coreItems: [kraken, nashorsTooth, bork],
    fullBuild: [berserkers, kraken, nashorsTooth, bork, ie, guardianAngel],
    skillMaxOrder: ['Q','W','E'],
  },

  Draven: {
    summoners: [IG, FL],
    startItems: [doranBlade, hpPot],
    boots: berserkers,
    coreItems: [kraken, ie, mortalReminder],
    fullBuild: [berserkers, kraken, ie, mortalReminder, bork, guardianAngel],
    skillMaxOrder: ['Q','E','W'], // Q(회전 도끼) 주딜, E(스탠드 어사이드·넉백) 쿨감, W 마지막
  },

  Tristana: {
    summoners: [IG, FL],
    startItems: [doranBlade, hpPot],
    boots: berserkers,
    coreItems: [kraken, ie, bork],
    fullBuild: [berserkers, kraken, ie, bork, mortalReminder, guardianAngel],
    skillMaxOrder: ['E','Q','W'],
  },

  Samira: {
    summoners: [IG, FL],
    startItems: [doranBlade, hpPot],
    boots: berserkers,
    coreItems: [immortalBow, ie, bork],
    fullBuild: [berserkers, immortalBow, ie, bork, mortalReminder, guardianAngel],
    skillMaxOrder: ['Q','E','W'],
  },

  // ══ 서포터 ══════════════════════════════════════════

  Seraphine: {
    summoners: [EX, FL],
    startItems: [doranRing, hpPot],
    boots: ionianBoots,
    coreItems: [moonstone, ardentCenser, staffFlowing],
    fullBuild: [ionianBoots, moonstone, ardentCenser, staffFlowing, redemption, rabadons],
    skillMaxOrder: ['W','Q','E'], // W(서라운드사운드) 힐·쉴드, Q(하이노트) 2순위, E 마지막
  },

  Sona: {
    summoners: [EX, FL],
    startItems: [doranRing, hpPot],
    boots: ionianBoots,
    coreItems: [moonstone, ardentCenser, staffFlowing],
    fullBuild: [ionianBoots, moonstone, ardentCenser, staffFlowing, redemption, zhonyas],
    skillMaxOrder: ['W','Q','E'], // W(아리아) 힐·쉴드 먼저, Q(찬가) 딜, E 마지막
  },

  Brand: {
    summoners: [IG, FL],
    startItems: [doranRing, hpPot],
    boots: sorcShoes,
    coreItems: [ludens, liandrys, shadowflame],
    fullBuild: [sorcShoes, ludens, liandrys, shadowflame, rabadons, voidStaff],
    skillMaxOrder: ['W','Q','E'], // W(파이어볼트·점화주문) 주딜, Q(화염탄+스턴콤보) 쿨감, E 마지막
  },

  Thresh: {
    summoners: [EX, FL],
    startItems: [doranShield, hpPot],
    boots: ionianBoots,
    coreItems: [locketSolari, redemption, frozenHeart],
    fullBuild: [ionianBoots, locketSolari, redemption, frozenHeart, shurelyas, warmog],
    skillMaxOrder: ['E','Q','W'], // E(회초리) 주CC·딜, Q(훅) 쿨감, W 마지막
  },

  Leona: {
    summoners: [IG, FL],
    startItems: [doranShield, hpPot],
    boots: steelcaps,
    coreItems: [locketSolari, heartsteel, frozenHeart],
    fullBuild: [steelcaps, locketSolari, heartsteel, frozenHeart, redemption, warmog],
    skillMaxOrder: ['E','W','Q'],
  },

  Blitzcrank: {
    summoners: [EX, FL],
    startItems: [doranShield, hpPot],
    boots: ionianBoots,
    coreItems: [locketSolari, shurelyas, redemption],
    fullBuild: [ionianBoots, locketSolari, shurelyas, redemption, frozenHeart, warmog],
    skillMaxOrder: ['Q','E','W'],
  },

  Nautilus: {
    summoners: [EX, FL],
    startItems: [doranShield, hpPot],
    boots: steelcaps,
    coreItems: [locketSolari, heartsteel, frozenHeart],
    fullBuild: [steelcaps, locketSolari, heartsteel, frozenHeart, redemption, warmog],
    skillMaxOrder: ['E','W','Q'], // E(잔물결·AOE슬로우) 쿨감, W(타이탄의 분노·쉴드) 2순위, Q 마지막
  },

  Janna: {
    summoners: [EX, FL],
    startItems: [doranRing, hpPot],
    boots: ionianBoots,
    coreItems: [moonstone, ardentCenser, staffFlowing],
    fullBuild: [ionianBoots, moonstone, ardentCenser, staffFlowing, redemption, zhonyas],
    skillMaxOrder: ['E','W','Q'], // E(아이오브더스톰) 쉴드 쿨감, W(서풍) 슬로우, Q 마지막
  },

  Soraka: {
    summoners: [EX, FL],
    startItems: [doranRing, hpPot],
    boots: ionianBoots,
    coreItems: [moonstone, redemption, staffFlowing],
    fullBuild: [ionianBoots, moonstone, redemption, staffFlowing, ardentCenser, zhonyas],
    skillMaxOrder: ['W','Q','E'], // W(별의 은혜·힐) 주힐 먼저, Q(스타콜·자가힐) 2순위, E 마지막
  },

  Nami: {
    summoners: [EX, FL],
    startItems: [doranRing, hpPot],
    boots: ionianBoots,
    coreItems: [moonstone, ardentCenser, staffFlowing],
    fullBuild: [ionianBoots, moonstone, ardentCenser, staffFlowing, redemption, rabadons],
    skillMaxOrder: ['W','Q','E'],
  },

  Karma: {
    summoners: [IG, FL],
    startItems: [doranRing, hpPot],
    boots: ionianBoots,
    coreItems: [moonstone, shadowflame, rabadons],
    fullBuild: [ionianBoots, moonstone, shadowflame, rabadons, voidStaff, zhonyas],
    skillMaxOrder: ['Q','E','W'],
  },

  Pyke: {
    summoners: [EX, FL],
    startItems: [doranBlade, hpPot],
    boots: ionianBoots,
    coreItems: [youmuus, serpentsFang, deadMan],
    fullBuild: [ionianBoots, youmuus, serpentsFang, deadMan, blackCleaver, guardianAngel],
    skillMaxOrder: ['Q','E','W'],
  },

  Zyra: {
    summoners: [IG, FL],
    startItems: [doranRing, hpPot],
    boots: sorcShoes,
    coreItems: [ludens, liandrys, shadowflame],
    fullBuild: [sorcShoes, ludens, liandrys, shadowflame, rabadons, voidStaff],
    skillMaxOrder: ['Q','E','W'],
  },

  // ══ 기타 인기 챔피언 ══════════════════════════════════

  Pantheon: {
    summoners: [TP, FL],
    startItems: [doranShield, hpPot],
    boots: steelcaps,
    coreItems: [trinity, blackCleaver, deadMan],
    fullBuild: [trinity, steelcaps, blackCleaver, deadMan, mortalReminder, guardianAngel],
    skillMaxOrder: ['W','Q','E'],
  },

  Kayle: {
    summoners: [TP, FL],
    startItems: [doranRing, hpPot],
    boots: berserkers,
    coreItems: [nashorsTooth, riftmaker, rabadons],
    fullBuild: [berserkers, nashorsTooth, riftmaker, rabadons, voidStaff, guardianAngel],
    skillMaxOrder: ['E','Q','W'],
  },

  Sett: {
    summoners: [TP, FL],
    startItems: [doranShield, hpPot],
    boots: steelcaps,
    coreItems: [trinity, heartsteel, blackCleaver],
    fullBuild: [trinity, steelcaps, heartsteel, blackCleaver, deadMan, warmog],
    skillMaxOrder: ['Q','W','E'],
  },
}
