import { defineConfig, type Plugin, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// vite.config.ts는 클라이언트 env를 자동 로드하지 않으므로 직접 로드
const _env = loadEnv('development', process.cwd(), '')
const RIOT_API_KEY  = _env.RIOT_API_KEY  ?? _env.VITE_RIOT_API_KEY  ?? process.env.RIOT_API_KEY  ?? ''
const COHERE_API_KEY = _env.COHERE_API_KEY ?? process.env.COHERE_API_KEY ?? ''
const SB_URL        = _env.VITE_SUPABASE_URL       ?? process.env.VITE_SUPABASE_URL       ?? ''
const SB_KEY        = _env.VITE_SUPABASE_ANON_KEY  ?? process.env.VITE_SUPABASE_ANON_KEY  ?? ''

// ─── 상수 ────────────────────────────────────────────────────────────────────
const RANKED_CACHE  = path.resolve('public/data/ranked-tier-list.json')
const NORMAL_CACHE  = path.resolve('public/data/normal-tier-list.json')
const ARAM_CACHE    = path.resolve('public/data/aram-tier-list.json')
const CACHE_MAX_AGE = 30 * 24 * 60 * 60 * 1000 // 30일

const TOP_TIERS = ['CHALLENGER', 'GRANDMASTER', 'MASTER'] as const
const MID_TIERS = ['DIAMOND', 'EMERALD', 'PLATINUM']      as const
const LOW_TIERS = ['GOLD', 'SILVER', 'BRONZE', 'IRON']    as const
const ALL_TIERS = [...TOP_TIERS, ...MID_TIERS, ...LOW_TIERS] as const
type GameTier   = typeof ALL_TIERS[number]

const POSITIONS = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'] as const

// ─── Riot API 래퍼 (dev 키 제한: 100 req/2min → 1300ms 간격) ───────────────
let _lastCall = 0
async function riotFetch(url: string, apiKey: string, retry = 3): Promise<any> {
  const now  = Date.now()
  const wait = Math.max(0, _lastCall + 1300 - now)
  if (wait > 0) await new Promise(r => setTimeout(r, wait))
  _lastCall = Date.now()

  const res = await fetch(url, { headers: { 'X-Riot-Token': apiKey } })
  if (res.status === 429 && retry > 0) {
    const after = parseInt(res.headers.get('Retry-After') ?? '5') * 1000
    await new Promise(r => setTimeout(r, after))
    return riotFetch(url, apiKey, retry - 1)
  }
  if (!res.ok) throw new Error(`riot ${res.status}: ${url}`)
  return res.json()
}

// ─── DDragon 한국어 챔피언 이름 맵 ─────────────────────────────────────────
async function getKorNameMap(): Promise<Record<string, string>> {
  const dd = await getDDData()
  return dd.korNames
}

interface DDData {
  korNames: Record<string, string>   // champId(string) → 한국어 이름
  keyToId:  Record<string, string>   // key(number string) → champId
  tags:     Record<string, string[]> // champId → tags
}

async function getDDData(): Promise<DDData> {
  const versions = await fetch('https://ddragon.leagueoflegends.com/api/versions.json').then(r => r.json()) as string[]
  const data = await fetch(`https://ddragon.leagueoflegends.com/cdn/${versions[0]}/data/ko_KR/champion.json`).then(r => r.json()) as any
  const korNames: Record<string, string>   = {}
  const keyToId:  Record<string, string>   = {}
  const tags:     Record<string, string[]> = {}
  for (const champ of Object.values(data.data) as any[]) {
    korNames[champ.id] = champ.name
    keyToId[String(champ.key)] = champ.id
    tags[champ.id] = champ.tags ?? []
  }
  return { korNames, keyToId, tags }
}

// ─── 챔피언 포지션 추론 ──────────────────────────────────────────────────────
const CHAMP_POS_OVERRIDE: Record<string, string> = {
  Graves:'정글', Kindred:'정글', LeeSin:'정글', Kayn:'정글', Hecarim:'정글',
  Vi:'정글', JarvanIV:'정글', Warwick:'정글', Udyr:'정글', RekSai:'정글',
  Nocturne:'정글', Belveth:'정글', Briar:'정글', Viego:'정글', XinZhao:'정글',
  MasterYi:'정글', MonkeyKing:'정글', Volibear:'정글', Skarner:'정글',
  Trundle:'정글', Naafiri:'정글', Ekko:'정글', Diana:'정글', Elise:'정글',
  Gragas:'정글', Lillia:'정글', Khazix:'정글', Rengar:'정글', Shaco:'정글',
  Evelynn:'정글', Nidalee:'정글', Amumu:'정글', Sejuani:'정글', Rammus:'정글',
  Nunu:'정글', Zac:'정글', Fiddlesticks:'정글', Karthus:'정글', Taliyah:'정글',
  Ivern:'정글',
  Galio:'미드', Zed:'미드', Talon:'미드', Qiyana:'미드', Akali:'미드',
  Yasuo:'미드', Yone:'미드', Fizz:'미드', Sylas:'미드', Ryze:'미드', Corki:'미드',
  Teemo:'탑', Quinn:'탑',
  Nami:'서포터', Soraka:'서포터', Janna:'서포터', Lulu:'서포터', Sona:'서포터',
  Karma:'서포터', Morgana:'서포터', Zilean:'서포터', Lux:'서포터',
  Nautilus:'서포터', Blitzcrank:'서포터', Leona:'서포터', Alistar:'서포터',
  Rell:'서포터', Braum:'서포터', TahmKench:'서포터', Pyke:'서포터',
  Taric:'서포터', Brand:'서포터', Zyra:'서포터', VelKoz:'서포터',
  Swain:'서포터', Hwei:'서포터', Xerath:'서포터', Seraphine:'서포터', Senna:'서포터',
}

function getChampPosition(champId: string, tagMap: Record<string, string[]>): string {
  if (CHAMP_POS_OVERRIDE[champId]) return CHAMP_POS_OVERRIDE[champId]
  const t = tagMap[champId] ?? []
  if (t.includes('Support'))   return '서포터'
  if (t.includes('Marksman'))  return '원딜'
  if (t.includes('Assassin'))  return '미드'
  if (t.includes('Mage'))      return '미드'
  if (t.includes('Fighter'))   return '탑'
  if (t.includes('Tank'))      return '탑'
  return '탑'
}

// ─── 티어별 PUUID 샘플링 ─────────────────────────────────────────────────────
async function getTierPuuids(tier: GameTier, apiKey: string, count: number): Promise<string[]> {
  const queue = 'RANKED_SOLO_5x5'
  let entries: any[]

  if (tier === 'CHALLENGER') {
    const d = await riotFetch(`https://kr.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/${queue}`, apiKey)
    entries = d.entries ?? []
  } else if (tier === 'GRANDMASTER') {
    const d = await riotFetch(`https://kr.api.riotgames.com/lol/league/v4/grandmasterleagues/by-queue/${queue}`, apiKey)
    entries = d.entries ?? []
  } else if (tier === 'MASTER') {
    const d = await riotFetch(`https://kr.api.riotgames.com/lol/league/v4/masterleagues/by-queue/${queue}`, apiKey)
    entries = d.entries ?? []
  } else {
    const d = await riotFetch(
      `https://kr.api.riotgames.com/lol/league/v4/entries/${queue}/${tier}/I?page=1`,
      apiKey
    )
    entries = Array.isArray(d) ? d : []
  }

  const sorted = entries.sort((a: any, b: any) => (b.leaguePoints ?? 0) - (a.leaguePoints ?? 0))
  return sorted.slice(0, count).map((e: any) => e.puuid).filter(Boolean)
}

interface ChampStat {
  games: number; wins: number
  kills: number; deaths: number; assists: number; damage: number
}

function assignTier(wr: number, games: number): string {
  if (games >= 4 && wr >= 56) return 'S+'
  if (games >= 3 && wr >= 53) return 'S'
  if (games >= 2 && wr >= 51) return 'A'
  if (games >= 1 && wr >= 49) return 'B'
  if (wr >= 46)               return 'C'
  return 'D'
}

// ─── 공통: 매치 목록에서 챔피언 통계 집계 ────────────────────────────────────
function aggregateMatches(matches: any[], korMap: Record<string, string>): any[] {
  const totalMatches = matches.length
  const agg: Record<string, Record<string, ChampStat>> = {}
  for (const pos of POSITIONS) agg[pos] = {}

  for (const match of matches) {
    for (const p of (match.info?.participants ?? []) as any[]) {
      const pos: string = p.teamPosition
      if (!agg[pos]) continue
      const cid: string = p.championName
      if (!agg[pos][cid]) agg[pos][cid] = { games: 0, wins: 0, kills: 0, deaths: 0, assists: 0, damage: 0 }
      const s = agg[pos][cid]
      s.games++
      if (p.win) s.wins++
      s.kills   += p.kills   ?? 0
      s.deaths  += p.deaths  ?? 0
      s.assists += p.assists ?? 0
      s.damage  += p.totalDamageDealtToChampions ?? 0
    }
  }

  const result: any[] = []
  for (const pos of POSITIONS) {
    for (const [championId, s] of Object.entries(agg[pos])) {
      const wr   = (s.wins / s.games) * 100
      const avgK = s.kills   / s.games
      const avgD = s.deaths  / s.games
      const avgA = s.assists / s.games
      const kda  = avgD === 0 ? avgK + avgA : (avgK + avgA) / avgD
      result.push({
        championId,
        korName:    korMap[championId] ?? championId,
        position:   pos,
        games:      s.games,
        winRate:    Math.round(wr * 10) / 10,
        pickRate:   Math.round((s.games / totalMatches) * 1000) / 10,
        tier:       assignTier(wr, s.games),
        kda:        Math.round(kda * 100) / 100,
        avgKills:   Math.round(avgK * 10) / 10,
        avgDeaths:  Math.round(avgD * 10) / 10,
        avgAssists: Math.round(avgA * 10) / 10,
        avgDamage:  Math.round(s.damage / s.games),
      })
    }
  }
  result.sort((a, b) => b.games - a.games)
  return result
}

// ─── 매치 수집 공통 ─────────────────────────────────────────────────────────
async function fetchMatches(
  puuids: string[],
  queue: number,
  matchPerPlayer: number,
  maxMatches: number,
  apiKey: string
): Promise<any[]> {
  const matchIdBatches: string[][] = []
  for (const puuid of puuids) {
    const ids = await riotFetch(
      `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=${queue}&count=${matchPerPlayer}`,
      apiKey
    ).catch(() => [])
    matchIdBatches.push(ids)
  }
  const uniqueIds: string[] = [...new Set<string>(matchIdBatches.flat())].slice(0, maxMatches)
  if (uniqueIds.length === 0) return []

  const matches: any[] = []
  for (const id of uniqueIds) {
    const m = await riotFetch(`https://asia.api.riotgames.com/lol/match/v5/matches/${id}`, apiKey).catch(() => null)
    if (m) matches.push(m)
  }
  return matches
}

// ════════════════════════════════════════════════════════════════════════════
//  솔로랭크 수집
// ════════════════════════════════════════════════════════════════════════════
async function analyzeTier(tier: GameTier, apiKey: string, korMap: Record<string, string>): Promise<any[]> {
  try {
    const puuids = await getTierPuuids(tier, apiKey, 100)
    if (puuids.length === 0) return []
    const matches = await fetchMatches(puuids, 420, 2, 100, apiKey)
    return aggregateMatches(matches, korMap)
  } catch (e) {
    console.warn(`[ranked] ${tier} 수집 실패:`, e)
    return []
  }
}

let _rankedFetching = false
async function fetchRanked(apiKey: string): Promise<Record<string, any[]>> {
  if (_rankedFetching) {
    while (_rankedFetching) await new Promise(r => setTimeout(r, 500))
    return readJson(RANKED_CACHE)?.data ?? {}
  }
  _rankedFetching = true
  console.log('[ranked] 수집 시작 (티어당 ~5-8분, 총 ~50-80분)...')
  try {
    const korMap = await getKorNameMap()
    const result: Record<string, any[]> = {}
    for (const tier of ALL_TIERS) {
      console.log(`[ranked]  → ${tier} 수집 중...`)
      result[tier] = await analyzeTier(tier, apiKey, korMap)
    }
    saveJson(RANKED_CACHE, { lastUpdated: new Date().toISOString(), data: result })
    console.log('[ranked] 수집 완료 → 캐시 저장됨')
    return result
  } finally {
    _rankedFetching = false
  }
}

// ════════════════════════════════════════════════════════════════════════════
//  일반게임 수집 (queue=430 일반 드래프트)
//  플레이어 풀: 챌린저 100명 + 골드 100명 (다양한 실력대 반영)
// ════════════════════════════════════════════════════════════════════════════
async function fetchNormal(apiKey: string): Promise<any[]> {
  if (_normalFetching) {
    while (_normalFetching) await new Promise(r => setTimeout(r, 500))
    return readJson(NORMAL_CACHE)?.data ?? []
  }
  _normalFetching = true
  console.log('[normal] 일반게임 데이터 수집 시작 (~50-80분)...')
  try {
    const korMap = await getKorNameMap()

    // 다양한 티어 플레이어 풀 — 챌린저 50명 + 골드 50명
    const [challPuuids, goldPuuids] = await Promise.all([
      getTierPuuids('CHALLENGER', apiKey, 50),
      getTierPuuids('GOLD',       apiKey, 50),
    ])
    const puuids = [...new Set([...challPuuids, ...goldPuuids])]
    console.log(`[normal]  → ${puuids.length}명 대상, 일반게임(queue=430) 매치 수집 중...`)

    const matches = await fetchMatches(puuids, 430, 2, 100, apiKey)
    console.log(`[normal]  → ${matches.length}경기 분석 중...`)

    const result = aggregateMatches(matches, korMap)
    saveJson(NORMAL_CACHE, { lastUpdated: new Date().toISOString(), data: result })
    console.log('[normal] 수집 완료 → 캐시 저장됨')
    return result
  } catch (e) {
    console.warn('[normal] 수집 실패:', e)
    return []
  } finally {
    _normalFetching = false
  }
}

let _normalFetching = false

// ════════════════════════════════════════════════════════════════════════════
//  칼바람나락 수집 (queue=450, 포지션 없음 — 챔피언 단위 집계)
//  플레이어 풀: 챌린저 50명 + 골드 50명
// ════════════════════════════════════════════════════════════════════════════
function aggregateAram(matches: any[], korMap: Record<string, string>): any[] {
  const totalMatches = matches.length
  const agg: Record<string, ChampStat> = {}

  for (const match of matches) {
    for (const p of (match.info?.participants ?? []) as any[]) {
      const cid: string = p.championName
      if (!agg[cid]) agg[cid] = { games: 0, wins: 0, kills: 0, deaths: 0, assists: 0, damage: 0 }
      const s = agg[cid]
      s.games++
      if (p.win) s.wins++
      s.kills   += p.kills   ?? 0
      s.deaths  += p.deaths  ?? 0
      s.assists += p.assists ?? 0
      s.damage  += p.totalDamageDealtToChampions ?? 0
    }
  }

  const result: any[] = []
  for (const [championId, s] of Object.entries(agg)) {
    const wr   = (s.wins / s.games) * 100
    const avgK = s.kills   / s.games
    const avgD = s.deaths  / s.games
    const avgA = s.assists / s.games
    const kda  = avgD === 0 ? avgK + avgA : (avgK + avgA) / avgD
    result.push({
      championId,
      korName:    korMap[championId] ?? championId,
      position:   'ARAM',
      games:      s.games,
      winRate:    Math.round(wr * 10) / 10,
      pickRate:   Math.round((s.games / (totalMatches * 10)) * 1000) / 10,
      tier:       assignTier(wr, s.games),
      kda:        Math.round(kda * 100) / 100,
      avgKills:   Math.round(avgK * 10) / 10,
      avgDeaths:  Math.round(avgD * 10) / 10,
      avgAssists: Math.round(avgA * 10) / 10,
      avgDamage:  Math.round(s.damage / s.games),
    })
  }
  result.sort((a, b) => b.games - a.games)
  return result
}

let _aramFetching = false

async function fetchAram(apiKey: string): Promise<any[]> {
  if (_aramFetching) {
    while (_aramFetching) await new Promise(r => setTimeout(r, 500))
    return readJson(ARAM_CACHE)?.data ?? []
  }
  _aramFetching = true
  console.log('[aram] 칼바람 데이터 수집 시작 (~50-80분)...')
  try {
    const korMap = await getKorNameMap()
    const [challPuuids, goldPuuids] = await Promise.all([
      getTierPuuids('CHALLENGER', apiKey, 50),
      getTierPuuids('GOLD',       apiKey, 50),
    ])
    const puuids = [...new Set([...challPuuids, ...goldPuuids])]
    console.log(`[aram]  → ${puuids.length}명 대상, 칼바람(queue=450) 매치 수집 중...`)

    const matches = await fetchMatches(puuids, 450, 2, 100, apiKey)
    console.log(`[aram]  → ${matches.length}경기 분석 중...`)

    const result = aggregateAram(matches, korMap)
    saveJson(ARAM_CACHE, { lastUpdated: new Date().toISOString(), data: result })
    console.log('[aram] 수집 완료 → 캐시 저장됨')
    return result
  } catch (e) {
    console.warn('[aram] 수집 실패:', e)
    return []
  } finally {
    _aramFetching = false
  }
}

// ─── JSON 캐시 유틸 ──────────────────────────────────────────────────────────
function readJson(file: string): any {
  try {
    if (!fs.existsSync(file)) return null
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch { return null }
}

function saveJson(file: string, data: any) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
}

function isStale(file: string, maxAge = CACHE_MAX_AGE): boolean {
  const c = readJson(file)
  if (!c) return true
  return Date.now() - new Date(c.lastUpdated).getTime() > maxAge
}

// ════════════════════════════════════════════════════════════════════════════
//  랭킹 — 전체 티어 순위 + 프로게이머 순위
// ════════════════════════════════════════════════════════════════════════════
const OVERALL_CACHE    = path.resolve('public/data/overall-ranking.json')
const PRO_CACHE        = path.resolve('public/data/pro-ranking.json')
const RANKING_MAX_AGE  = 6 * 60 * 60 * 1000 // 6시간

// ── LCK 주요 프로게이머 목록 ──────────────────────────────────────────────
const PRO_LIST = [
  // T1
  { team: 'T1',       pos: '탑',     proName: 'Zeus',     gameId: 'T1 Zeus',      tag: 'KR1' },
  { team: 'T1',       pos: '정글',   proName: 'Oner',     gameId: 'T1 Oner',      tag: 'KR1' },
  { team: 'T1',       pos: '미드',   proName: 'Faker',    gameId: 'Hide on bush', tag: 'KR1' },
  { team: 'T1',       pos: '원딜',   proName: 'Gumayusi', gameId: 'T1 Gumayusi',  tag: 'KR1' },
  { team: 'T1',       pos: '서포터', proName: 'Keria',    gameId: 'T1 Keria',     tag: 'KR1' },
  // Gen.G
  { team: 'Gen.G',    pos: '탑',     proName: 'Kiin',     gameId: 'Gen G Kiin',   tag: 'KR1' },
  { team: 'Gen.G',    pos: '정글',   proName: 'Canyon',   gameId: 'Canyon',       tag: 'KR1' },
  { team: 'Gen.G',    pos: '미드',   proName: 'Chovy',    gameId: 'Chovy',        tag: 'KR1' },
  { team: 'Gen.G',    pos: '원딜',   proName: 'Ruler',    gameId: 'Ruler',        tag: 'KR1' },
  { team: 'Gen.G',    pos: '서포터', proName: 'Delight',  gameId: 'Delight',      tag: 'KR1' },
  // KT Rolster
  { team: 'KT',       pos: '탑',     proName: 'Doran',    gameId: 'Doran',        tag: 'KR1' },
  { team: 'KT',       pos: '정글',   proName: 'Cuzz',     gameId: 'Cuzz',         tag: 'KR1' },
  { team: 'KT',       pos: '미드',   proName: 'Bdd',      gameId: 'Bdd',          tag: 'KR1' },
  { team: 'KT',       pos: '원딜',   proName: 'Aiming',   gameId: 'Aiming',       tag: 'KR1' },
  { team: 'KT',       pos: '서포터', proName: 'Life',     gameId: 'Life',         tag: 'KR1' },
  // Hanwha Life
  { team: 'HLE',      pos: '탑',     proName: 'Deft',     gameId: 'Deft',         tag: 'KR1' },
  { team: 'HLE',      pos: '정글',   proName: 'Clid',     gameId: 'Clid',         tag: 'KR1' },
  { team: 'HLE',      pos: '미드',   proName: 'Zeka',     gameId: 'Zeka',         tag: 'KR1' },
  { team: 'HLE',      pos: '원딜',   proName: 'Viper',    gameId: 'Viper',        tag: 'KR1' },
  { team: 'HLE',      pos: '서포터', proName: 'Lehends',  gameId: 'Lehends',      tag: 'KR1' },
  // DRX
  { team: 'DRX',      pos: '탑',     proName: 'Rascal',   gameId: 'Rascal',       tag: 'KR1' },
  { team: 'DRX',      pos: '정글',   proName: 'Croco',    gameId: 'Croco',        tag: 'KR1' },
  { team: 'DRX',      pos: '미드',   proName: 'Ucal',     gameId: 'Ucal',         tag: 'KR1' },
  { team: 'DRX',      pos: '원딜',   proName: 'Teddy',    gameId: 'Teddy',        tag: 'KR1' },
  { team: 'DRX',      pos: '서포터', proName: 'BeryL',    gameId: 'BeryL',        tag: 'KR1' },
  // Nongshim RedForce
  { team: 'NS',       pos: '탑',     proName: 'DnDn',     gameId: 'DnDn',         tag: 'KR1' },
  { team: 'NS',       pos: '정글',   proName: 'Sylvie',   gameId: 'Sylvie',       tag: 'KR1' },
  { team: 'NS',       pos: '미드',   proName: 'Callme',   gameId: 'Callme',       tag: 'KR1' },
  // Kwangdong Freecs
  { team: 'KDF',      pos: '미드',   proName: 'Fate',     gameId: 'Fate',         tag: 'KR1' },
  // Fredit BRION
  { team: 'BRO',      pos: '정글',   proName: 'Willer',   gameId: 'Willer',       tag: 'KR1' },
  { team: 'BRO',      pos: '미드',   proName: 'Lava',     gameId: 'Lava',         tag: 'KR1' },
]

// ── 전체 랭킹 수집 (챌린저+GM+마스터 → LP 순 정렬) ─────────────────────────
let _overallFetching = false
async function fetchOverallRanking(apiKey: string): Promise<any[]> {
  if (_overallFetching) {
    while (_overallFetching) await new Promise(r => setTimeout(r, 500))
    return readJson(OVERALL_CACHE)?.data ?? []
  }
  _overallFetching = true
  console.log('[ranking] 전체 랭킹 수집 시작...')
  try {
    const queue = 'RANKED_SOLO_5x5'
    const [chall, gm, master] = await Promise.all([
      riotFetch(`https://kr.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/${queue}`, apiKey),
      riotFetch(`https://kr.api.riotgames.com/lol/league/v4/grandmasterleagues/by-queue/${queue}`, apiKey),
      riotFetch(`https://kr.api.riotgames.com/lol/league/v4/masterleagues/by-queue/${queue}`, apiKey),
    ])

    const taggedEntries: any[] = [
      ...(chall.entries  ?? []).map((e: any) => ({ ...e, tierLabel: 'CHALLENGER' })),
      ...(gm.entries     ?? []).map((e: any) => ({ ...e, tierLabel: 'GRANDMASTER' })),
      ...(master.entries ?? []).map((e: any) => ({ ...e, tierLabel: 'MASTER' })),
    ]
    taggedEntries.sort((a, b) => b.leaguePoints - a.leaguePoints)
    const top500 = taggedEntries.slice(0, 500)

    // DDragon 챔피언 데이터 (position 추론용)
    const ddData = await getDDData()

    // PUUID → gameName#tag + profileIcon + mostChampions + mainPosition
    const withNames: any[] = []
    for (const entry of top500) {
      // 계정명
      const acc = await riotFetch(
        `https://asia.api.riotgames.com/riot/account/v1/accounts/by-puuid/${entry.puuid}`,
        apiKey
      ).catch(() => null)
      // 프로필 아이콘 (summoner API)
      const summ = await riotFetch(
        `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${entry.puuid}`,
        apiKey
      ).catch(() => null)
      // 모스트 챔피언 top3
      const masteries: any[] = await riotFetch(
        `https://kr.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${entry.puuid}/top?count=3`,
        apiKey
      ).catch(() => [])
      const mostChampions: string[] = (masteries as any[])
        .slice(0, 3)
        .map(m => ddData.keyToId[String(m.championId)] ?? '')
        .filter(Boolean)
      const mainPosition = mostChampions.length > 0
        ? getChampPosition(mostChampions[0], ddData.tags)
        : '알 수 없음'
      withNames.push({
        rank:          0,
        puuid:         entry.puuid,
        gameName:      acc?.gameName ?? '???',
        tagLine:       acc?.tagLine  ?? 'KR1',
        tierLabel:     entry.tierLabel,
        leaguePoints:  entry.leaguePoints,
        wins:          entry.wins,
        losses:        entry.losses,
        winRate:       Math.round((entry.wins / (entry.wins + entry.losses)) * 1000) / 10,
        veteran:       entry.veteran,
        hotStreak:     entry.hotStreak,
        profileIconId: summ?.profileIconId ?? 1,
        region:        'KR',
        mainPosition,
        mostChampions,
      })
    }
    withNames.forEach((e, i) => { e.rank = i + 1 })

    saveJson(OVERALL_CACHE, { lastUpdated: new Date().toISOString(), data: withNames })
    console.log('[ranking] 전체 랭킹 수집 완료')
    return withNames
  } finally {
    _overallFetching = false
  }
}

// ── 프로게이머 랭킹 수집 ──────────────────────────────────────────────────
let _proFetching = false
async function fetchProRanking(apiKey: string): Promise<any[]> {
  if (_proFetching) {
    while (_proFetching) await new Promise(r => setTimeout(r, 500))
    return readJson(PRO_CACHE)?.data ?? []
  }
  _proFetching = true
  console.log('[ranking] 프로게이머 랭킹 수집 시작...')
  try {
    const ddData = await getDDData()
    const result: any[] = []
    for (const pro of PRO_LIST) {
      try {
        // Riot ID → PUUID
        const acc = await riotFetch(
          `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(pro.gameId)}/${pro.tag}`,
          apiKey
        ).catch(() => null)
        if (!acc?.puuid) {
          result.push({ ...pro, found: false })
          continue
        }
        // PUUID → 솔로랭크 통계
        const entries: any[] = await riotFetch(
          `https://kr.api.riotgames.com/lol/league/v4/entries/by-puuid/${acc.puuid}`,
          apiKey
        ).catch(() => [])
        const solo = entries.find((e: any) => e.queueType === 'RANKED_SOLO_5x5')
        // 프로필 아이콘
        const summ = await riotFetch(
          `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${acc.puuid}`,
          apiKey
        ).catch(() => null)
        // 모스트 챔피언 top3
        const masteries: any[] = await riotFetch(
          `https://kr.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${acc.puuid}/top?count=3`,
          apiKey
        ).catch(() => [])
        const mostChampions: string[] = masteries
          .slice(0, 3)
          .map(m => ddData.keyToId[String(m.championId)] ?? '')
          .filter(Boolean)
        result.push({
          team:         pro.team,
          pos:          pro.pos,
          proName:      pro.proName,
          gameName:     acc.gameName,
          tagLine:      acc.tagLine,
          found:        true,
          tierLabel:    solo?.tier     ?? null,
          rank:         solo?.rank     ?? null,
          leaguePoints: solo?.leaguePoints ?? 0,
          wins:         solo?.wins     ?? 0,
          losses:       solo?.losses   ?? 0,
          winRate:      solo ? Math.round((solo.wins / (solo.wins + solo.losses)) * 1000) / 10 : 0,
          hotStreak:    solo?.hotStreak ?? false,
          veteran:      solo?.veteran  ?? false,
          profileIconId: summ?.profileIconId ?? 1,
          region:        'KR',
          mostChampions,
        })
      } catch {
        result.push({ ...pro, found: false })
      }
    }
    // LP 높은 순
    result.sort((a, b) => {
      const tierOrder: Record<string, number> = { CHALLENGER: 0, GRANDMASTER: 1, MASTER: 2, DIAMOND: 3, EMERALD: 4, PLATINUM: 5, GOLD: 6, SILVER: 7, BRONZE: 8, IRON: 9 }
      const ta = tierOrder[a.tierLabel ?? 'IRON'] ?? 9
      const tb = tierOrder[b.tierLabel ?? 'IRON'] ?? 9
      if (ta !== tb) return ta - tb
      return b.leaguePoints - a.leaguePoints
    })
    result.forEach((e, i) => { e.proRank = i + 1 })

    saveJson(PRO_CACHE, { lastUpdated: new Date().toISOString(), data: result })
    console.log('[ranking] 프로게이머 랭킹 수집 완료')
    return result
  } finally {
    _proFetching = false
  }
}

// ─── Vite 플러그인 ──────────────────────────────────────────────────────────
function tierListPlugin(): Plugin {
  return {
    name: 'tier-list-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // ── 랭킹 API ──────────────────────────────────────────────────────────
        if (req.url?.startsWith('/api/ranking')) {
          const url    = new URL(req.url, 'http://localhost')
          const type   = url.searchParams.get('type') ?? 'overall'
          const apiKey = RIOT_API_KEY
          if (!apiKey) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ error: 'RIOT_API_KEY missing' }))
          }
          try {
            if (type === 'overall') {
              let cache = readJson(OVERALL_CACHE)
              if (isStale(OVERALL_CACHE, RANKING_MAX_AGE)) {
                const data = await fetchOverallRanking(apiKey)
                cache = { lastUpdated: new Date().toISOString(), data }
              }
              res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Last-Updated': cache.lastUpdated })
              return res.end(JSON.stringify(cache.data ?? []))
            }
            if (type === 'pro') {
              let cache = readJson(PRO_CACHE)
              if (isStale(PRO_CACHE, RANKING_MAX_AGE)) {
                const data = await fetchProRanking(apiKey)
                cache = { lastUpdated: new Date().toISOString(), data }
              }
              res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Last-Updated': cache.lastUpdated })
              return res.end(JSON.stringify(cache.data ?? []))
            }
            return next()
          } catch (e: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ error: e.message }))
          }
        }

        // ── AI 피드백 API ─────────────────────────────────────────────────────
        if (req.url?.startsWith('/api/ai-feedback')) {
          if (req.method !== 'POST') {
            res.writeHead(405); return res.end('Method Not Allowed')
          }
          const chunks: Buffer[] = []
          req.on('data', (c: Buffer) => chunks.push(c))
          req.on('end', async () => {
            let body: any
            try { body = JSON.parse(Buffer.concat(chunks).toString()) } catch { res.writeHead(400); return res.end('Bad Request') }
            const { matchId, puuid, championName, kills, deaths, assists, cs, visionScore, duration, win, queueLabel } = body
            if (!matchId || !puuid) { res.writeHead(400); return res.end('Missing params') }
            if (!RIOT_API_KEY || !COHERE_API_KEY) { res.writeHead(500); return res.end(JSON.stringify({ error: 'Server misconfigured: missing API keys' })) }

            // 캐시 확인
            if (SB_URL && SB_KEY) {
              const cached = await fetch(
                `${SB_URL}/rest/v1/ai_match_feedback?match_id=eq.${encodeURIComponent(matchId)}&limit=1`,
                { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
              ).catch(() => null)
              if (cached?.ok) {
                const rows: any[] = await (cached as any).json().catch(() => [])
                const row = rows[0]
                if (row?.feedback) {
                  res.writeHead(200, { 'Content-Type': 'application/json' })
                  return res.end(JSON.stringify({ feedback: row.feedback, cached: true }))
                }
              }
            }

            // 타임라인 fetch
            let earlyKills = 0, earlyDeaths = 0, dragonCount = 0, baronCount = 0, heraldCount = 0, grubCount = 0, towerCount = 0
            const teamfights: { timeSec: number; size: number; withMe: boolean }[] = []
            let hasTimeline = false
            const tlController = new AbortController()
            const tlTimeout = setTimeout(() => tlController.abort(), 4000)
            const tlRes = await fetch(
              `https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}/timeline`,
              { headers: { 'X-Riot-Token': RIOT_API_KEY }, signal: tlController.signal }
            ).catch(() => null).finally(() => clearTimeout(tlTimeout))
            if (tlRes && (tlRes as any).ok) {
              const tl = await (tlRes as any).json().catch(() => null)
              if (tl) {
                hasTimeline = true
                const participants: any[] = tl.info?.participants ?? []
                const myId = participants.find((p: any) => p.puuid === puuid)?.participantId ?? -1
                const allEvents: any[] = (tl.info?.frames ?? []).flatMap((f: any) => f.events ?? [])
                const EARLY = 900_000
                earlyKills  = allEvents.filter((e: any) => e.type === 'CHAMPION_KILL' && e.timestamp < EARLY && e.killerId === myId).length
                earlyDeaths = allEvents.filter((e: any) => e.type === 'CHAMPION_KILL' && e.timestamp < EARLY && e.victimId === myId).length
                dragonCount = allEvents.filter((e: any) => e.type === 'ELITE_MONSTER_KILL' && e.monsterType === 'DRAGON').length
                baronCount  = allEvents.filter((e: any) => e.type === 'ELITE_MONSTER_KILL' && e.monsterType === 'BARON_NASHOR').length
                heraldCount = allEvents.filter((e: any) => e.type === 'ELITE_MONSTER_KILL' && e.monsterType === 'RIFTHERALD').length
                grubCount   = allEvents.filter((e: any) => e.type === 'ELITE_MONSTER_KILL' && e.monsterType === 'HORDE').length
                towerCount  = allEvents.filter((e: any) => e.type === 'BUILDING_KILL' && e.buildingType === 'TOWER_BUILDING').length
                const killEvts = allEvents.filter((e: any) => e.type === 'CHAMPION_KILL')
                let skip = 0
                for (let i = 0; i < killEvts.length; i++) {
                  if (skip > 0) { skip--; continue }
                  const w = killEvts[i].timestamp + 30_000
                  const cluster = killEvts.filter((e: any) => e.timestamp >= killEvts[i].timestamp && e.timestamp <= w)
                  if (cluster.length >= 3) {
                    teamfights.push({ timeSec: Math.floor(killEvts[i].timestamp / 1000), size: cluster.length, withMe: cluster.some((e: any) => e.killerId === myId || e.victimId === myId) })
                    skip = cluster.length - 1
                  }
                }
              }
            }

            const durMin   = Math.floor(duration / 60)
            const kda      = deaths === 0 ? (kills + assists).toFixed(1) : ((kills + assists) / deaths).toFixed(1)
            const csPerMin = (cs / Math.max(duration / 60, 1)).toFixed(1)
            const tfLines  = teamfights.slice(0, 5).map(tf => `  • ${Math.floor(tf.timeSec / 60)}분 ${tf.timeSec % 60}초 (${tf.size}킬 규모${tf.withMe ? ', 플레이어 참여' : ''})`).join('\n')
            const timelineSection = hasTimeline ? `\n[초반 15분]\n킬 ${earlyKills}회 / 데스 ${earlyDeaths}회\n\n[오브젝트]\n드래곤 ${dragonCount}마리 / 바론 ${baronCount}회 / 전령 ${heraldCount}회 / 공허쐐기벌레 ${grubCount}마리 / 포탑 ${towerCount}개\n\n[한타 발생 ${teamfights.length}회]\n${tfLines || '  (없음)'}` : ''
            const prompt = `당신은 리그 오브 레전드 전문 코치입니다. 아래 데이터를 분석해 한국어로 피드백을 주세요.\n\n[게임 정보]\n챔피언: ${championName} / 모드: ${queueLabel} / 결과: ${win ? '승리' : '패배'} / 시간: ${durMin}분\nKDA: ${kills}/${deaths}/${assists} (${kda} 평점) / CS: ${cs} (${csPerMin}/분) / 시야: ${visionScore}\n${timelineSection}\n\n위 데이터를 바탕으로 다음 형식으로 간결하게 분석해주세요. 총 300자 이내, 이모지 적극 사용:\n⚔️ 초반 운영: (2문장)\n🏯 오브젝트: (2문장)\n🔥 한타: (2문장)\n💡 총평: (1문장)`

            const aiController = new AbortController()
            const aiTimeout = setTimeout(() => aiController.abort(), 8000)
            const aiRes = await fetch('https://api.cohere.com/v2/chat', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${COHERE_API_KEY}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ model: 'command-r-08-2024', messages: [{ role: 'user', content: prompt }] }),
              signal: aiController.signal,
            }).catch((e: any) => { console.error('Cohere fetch error:', e); return null }).finally(() => clearTimeout(aiTimeout))

            if (!aiRes || !(aiRes as any).ok) {
              const errText = await (aiRes as any)?.text().catch(() => 'no body')
              console.error('Cohere error status:', (aiRes as any)?.status, 'body:', errText)
              res.writeHead(502, { 'Content-Type': 'application/json' })
              return res.end(JSON.stringify({ error: `Cohere ${(aiRes as any)?.status}: ${errText}` }))
            }
            const aiData = await (aiRes as any).json()
            const feedback = aiData.message?.content?.[0]?.text ?? '피드백을 생성할 수 없습니다.'

            if (SB_URL && SB_KEY) {
              fetch(`${SB_URL}/rest/v1/ai_match_feedback`, {
                method: 'POST',
                headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
                body: JSON.stringify({ match_id: matchId, feedback }),
              }).catch(() => {})
            }
            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ feedback }))
          })
          return
        }

        if (!req.url?.startsWith('/api/tier-list')) return next()

        const url    = new URL(req.url, 'http://localhost')
        const mode   = url.searchParams.get('mode') ?? 'ranked'
        const apiKey = RIOT_API_KEY

        if (!apiKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          return res.end(JSON.stringify({ error: 'RIOT_API_KEY missing' }))
        }

        try {
          // ── 솔로랭크 ──────────────────────────────────────────────────────
          if (mode === 'ranked') {
            const tierParam = (url.searchParams.get('tier') ?? 'CHALLENGER').toUpperCase() as GameTier
            let cache = readJson(RANKED_CACHE)
            if (isStale(RANKED_CACHE)) {
              const data = await fetchRanked(apiKey)
              cache = { lastUpdated: new Date().toISOString(), data }
            }
            const payload = cache.data[tierParam] ?? cache.data['CHALLENGER'] ?? []
            res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Last-Updated': cache.lastUpdated })
            return res.end(JSON.stringify(payload))
          }

          // ── 일반게임 ──────────────────────────────────────────────────────
          if (mode === 'normal') {
            let cache = readJson(NORMAL_CACHE)
            if (isStale(NORMAL_CACHE)) {
              const data = await fetchNormal(apiKey)
              cache = { lastUpdated: new Date().toISOString(), data }
            }
            res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Last-Updated': cache.lastUpdated })
            return res.end(JSON.stringify(cache.data ?? []))
          }

          // ── 칼바람나락 ────────────────────────────────────────────────────
          if (mode === 'aram') {
            let cache = readJson(ARAM_CACHE)
            if (isStale(ARAM_CACHE)) {
              const data = await fetchAram(apiKey)
              cache = { lastUpdated: new Date().toISOString(), data }
            }
            res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Last-Updated': cache.lastUpdated })
            return res.end(JSON.stringify(cache.data ?? []))
          }

          return next()
        } catch (e: any) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: e.message }))
        }
      })
    },
  }
}

// ─── Vite 설정 ──────────────────────────────────────────────────────────────
export default defineConfig({
  plugins: [react(), tierListPlugin()],
  server: {
    proxy: {
      '/riot-kr': {
        target: 'https://kr.api.riotgames.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/riot-kr/, ''),
      },
      '/riot-asia': {
        target: 'https://asia.api.riotgames.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/riot-asia/, ''),
      },
    },
  },
})
