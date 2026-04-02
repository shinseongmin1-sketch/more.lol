export const config = { runtime: 'edge' }

const POSITIONS = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'] as const
const LABELS: Record<string, string> = {
  TOP: '탑', JUNGLE: '정글', MIDDLE: '미드', BOTTOM: '원딜', UTILITY: '서폿',
}

async function riotFetch(url: string, apiKey: string) {
  const res = await fetch(url, { headers: { 'X-Riot-Token': apiKey } })
  if (!res.ok) throw new Error(`riot ${res.status}`)
  return res.json()
}

export default async function handler(): Promise<Response> {
  const apiKey = process.env.RIOT_API_KEY
  if (!apiKey) return new Response('API key missing', { status: 500 })

  try {
    // 1. 챌린저 리그 목록
    const league = await riotFetch(
      'https://kr.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5',
      apiKey
    )

    // 2. LP 상위 5명
    const top5: any[] = [...league.entries]
      .sort((a, b) => b.leaguePoints - a.leaguePoints)
      .slice(0, 5)

    // 3. PUUID 조회
    const summoners = await Promise.all(
      top5.map((p) =>
        riotFetch(`https://kr.api.riotgames.com/lol/summoner/v4/summoners/${p.summonerId}`, apiKey)
      )
    )
    const puuids: string[] = summoners.map((s) => s.puuid)

    // 4. 최근 랭크 매치 ID (인당 4경기)
    const matchIdBatches = await Promise.all(
      puuids.map((puuid) =>
        riotFetch(
          `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&count=4`,
          apiKey
        )
      )
    )
    const uniqueIds: string[] = [...new Set<string>(matchIdBatches.flat())].slice(0, 12)

    // 5. 매치 상세 조회
    const matches = await Promise.all(
      uniqueIds.map((id) =>
        riotFetch(`https://asia.api.riotgames.com/lol/match/v5/matches/${id}`, apiKey)
      )
    )

    // 6. 포지션별 챔피언 픽 집계
    const counts: Record<string, Record<string, number>> = {
      TOP: {}, JUNGLE: {}, MIDDLE: {}, BOTTOM: {}, UTILITY: {},
    }
    for (const match of matches) {
      for (const p of match.info?.participants ?? []) {
        const pos: string = p.teamPosition
        if (!counts[pos]) continue
        counts[pos][p.championName] = (counts[pos][p.championName] ?? 0) + 1
      }
    }

    // 7. 포지션별 1위 챔피언
    const result = POSITIONS.map((pos) => {
      const sorted = Object.entries(counts[pos]).sort((a, b) => b[1] - a[1])
      const [championId, count] = sorted[0] ?? ['Aatrox', 0]
      return { position: pos, label: LABELS[pos], championId, count }
    })

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
}
