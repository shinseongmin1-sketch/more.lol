export const config = { runtime: 'edge' }

const POSITIONS = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'] as const

const MODE_CONFIG = {
  ranked: { queue: 420, leagueEndpoint: 'https://kr.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5' },
  normal: { queue: 400, leagueEndpoint: 'https://kr.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5' },
  aram:   { queue: 450, leagueEndpoint: 'https://kr.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5' },
} as const

async function riotFetch(url: string, apiKey: string) {
  const res = await fetch(url, { headers: { 'X-Riot-Token': apiKey } })
  if (!res.ok) throw new Error(`riot ${res.status}: ${url}`)
  return res.json()
}

async function getKorNameMap(): Promise<Record<string, string>> {
  const versions: string[] = await fetch('https://ddragon.leagueoflegends.com/api/versions.json').then(r => r.json())
  const v = versions[0]
  const data = await fetch(`https://ddragon.leagueoflegends.com/cdn/${v}/data/ko_KR/champion.json`).then(r => r.json())
  const map: Record<string, string> = {}
  for (const champ of Object.values(data.data) as any[]) {
    map[champ.id] = champ.name
  }
  return map
}

function assignTier(winRate: number, games: number): string {
  if (games >= 3 && winRate >= 56) return 'S+'
  if (games >= 2 && winRate >= 53) return 'S'
  if (games >= 2 && winRate >= 51) return 'A'
  if (games >= 1 && winRate >= 49) return 'B'
  if (winRate >= 46) return 'C'
  return 'D'
}

export default async function handler(req: Request): Promise<Response> {
  const apiKey = process.env.RIOT_API_KEY
  if (!apiKey) return new Response('API key missing', { status: 500 })

  const url = new URL(req.url)
  const modeParam = url.searchParams.get('mode') ?? 'ranked'
  const mode = modeParam in MODE_CONFIG ? (modeParam as keyof typeof MODE_CONFIG) : 'ranked'
  const { queue, leagueEndpoint } = MODE_CONFIG[mode]
  const isAram = mode === 'aram'

  try {
    const [korMap, league] = await Promise.all([
      getKorNameMap(),
      riotFetch(leagueEndpoint, apiKey),
    ])

    // LP 상위 10명
    const top10: any[] = [...league.entries]
      .sort((a: any, b: any) => b.leaguePoints - a.leaguePoints)
      .slice(0, 10)

    // PUUID 조회
    const summoners = await Promise.all(
      top10.map((p: any) =>
        riotFetch(`https://kr.api.riotgames.com/lol/summoner/v4/summoners/${p.summonerId}`, apiKey)
      )
    )
    const puuids: string[] = summoners.map((s: any) => s.puuid)

    // 최근 매치 ID (인당 5경기, 해당 큐 필터)
    const matchIdBatches = await Promise.all(
      puuids.map((puuid) =>
        riotFetch(
          `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=${queue}&count=5`,
          apiKey
        )
      )
    )
    const uniqueIds: string[] = [...new Set<string>(matchIdBatches.flat())].slice(0, 40)

    if (uniqueIds.length === 0) {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
      })
    }

    // 매치 상세 조회
    const matches = await Promise.all(
      uniqueIds.map((id) =>
        riotFetch(`https://asia.api.riotgames.com/lol/match/v5/matches/${id}`, apiKey)
      )
    )

    const totalMatches = matches.length

    interface Stats { games: number; wins: number; kills: number; deaths: number; assists: number; damage: number }

    if (isAram) {
      // ARAM: 포지션 없이 챔피언 단위 집계
      const agg: Record<string, Stats> = {}
      for (const match of matches) {
        for (const p of (match.info?.participants ?? []) as any[]) {
          const cid: string = p.championName
          if (!agg[cid]) agg[cid] = { games: 0, wins: 0, kills: 0, deaths: 0, assists: 0, damage: 0 }
          const s = agg[cid]
          s.games++
          if (p.win) s.wins++
          s.kills += p.kills ?? 0
          s.deaths += p.deaths ?? 0
          s.assists += p.assists ?? 0
          s.damage += p.totalDamageDealtToChampions ?? 0
        }
      }

      const result: any[] = []
      for (const [championId, s] of Object.entries(agg)) {
        const winRate = (s.wins / s.games) * 100
        const avgKills = s.kills / s.games
        const avgDeaths = s.deaths / s.games
        const avgAssists = s.assists / s.games
        const kda = avgDeaths === 0 ? avgKills + avgAssists : (avgKills + avgAssists) / avgDeaths
        result.push({
          championId,
          korName: korMap[championId] ?? championId,
          position: 'ARAM',
          games: s.games,
          winRate: Math.round(winRate * 10) / 10,
          pickRate: Math.round((s.games / (totalMatches * 10)) * 1000) / 10,
          tier: assignTier(winRate, s.games),
          kda: Math.round(kda * 100) / 100,
          avgKills: Math.round(avgKills * 10) / 10,
          avgDeaths: Math.round(avgDeaths * 10) / 10,
          avgAssists: Math.round(avgAssists * 10) / 10,
          avgDamage: Math.round(s.damage / s.games),
        })
      }
      result.sort((a, b) => b.games - a.games)

      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
      })
    }

    // 랭크/일반: 포지션별 집계
    const agg: Record<string, Record<string, Stats>> = {}
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
        s.kills += p.kills ?? 0
        s.deaths += p.deaths ?? 0
        s.assists += p.assists ?? 0
        s.damage += p.totalDamageDealtToChampions ?? 0
      }
    }

    const result: any[] = []
    for (const pos of POSITIONS) {
      for (const [championId, s] of Object.entries(agg[pos])) {
        const winRate = (s.wins / s.games) * 100
        const avgKills = s.kills / s.games
        const avgDeaths = s.deaths / s.games
        const avgAssists = s.assists / s.games
        const kda = avgDeaths === 0 ? avgKills + avgAssists : (avgKills + avgAssists) / avgDeaths
        result.push({
          championId,
          korName: korMap[championId] ?? championId,
          position: pos,
          games: s.games,
          winRate: Math.round(winRate * 10) / 10,
          pickRate: Math.round((s.games / totalMatches) * 1000) / 10,
          tier: assignTier(winRate, s.games),
          kda: Math.round(kda * 100) / 100,
          avgKills: Math.round(avgKills * 10) / 10,
          avgDeaths: Math.round(avgDeaths * 10) / 10,
          avgAssists: Math.round(avgAssists * 10) / 10,
          avgDamage: Math.round(s.damage / s.games),
        })
      }
    }
    result.sort((a, b) => b.games - a.games)

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
}
