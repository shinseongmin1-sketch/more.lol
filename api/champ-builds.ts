export const config = { runtime: 'edge' }

const BOOT_IDS = new Set(['3006','3009','3020','3047','3111','3117','3158'])
const EXCLUDE_IDS = new Set(['0','3340','3363','3364','2055','2003','2031','2033','2138','3330','4401','4403','3866','3865'])

const POS_MAP: Record<string, string> = {
  '탑': 'TOP', '정글': 'JUNGLE', '미드': 'MIDDLE', '원딜': 'BOTTOM', '서포터': 'UTILITY',
}

const SPELL_KEY_MAP: Record<number, string> = {
  1: 'SummonerBoost', 3: 'SummonerExhaust', 4: 'SummonerFlash',
  6: 'SummonerHaste', 7: 'SummonerHeal', 11: 'SummonerSmite',
  12: 'SummonerTeleport', 13: 'SummonerMana', 14: 'SummonerDot',
  21: 'SummonerBarrier', 32: 'SummonerSnowball',
}

async function riotFetch(url: string, apiKey: string) {
  const res = await fetch(url, { headers: { 'X-Riot-Token': apiKey } })
  if (!res.ok) throw new Error(`riot ${res.status}: ${url}`)
  return res.json()
}

export default async function handler(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const champId  = searchParams.get('champId')
  const posKo    = searchParams.get('position') ?? '탑'
  const position = POS_MAP[posKo] ?? 'TOP'

  if (!champId) return new Response('Missing champId', { status: 400 })

  const apiKey = process.env.RIOT_API_KEY
  if (!apiKey) return new Response('API key missing', { status: 500 })

  try {
    // 1. 챌린저 + 그랜드마스터 입장
    const [challData, gmData] = await Promise.all([
      riotFetch('https://kr.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5', apiKey),
      riotFetch('https://kr.api.riotgames.com/lol/league/v4/grandmasterleagues/by-queue/RANKED_SOLO_5x5', apiKey),
    ])

    // 2. LP 상위 25명
    const allEntries: any[] = [...challData.entries, ...gmData.entries]
    const top25 = allEntries.sort((a, b) => b.leaguePoints - a.leaguePoints).slice(0, 25)

    // 3. PUUID 조회
    const summoners = await Promise.all(
      top25.map(p => riotFetch(`https://kr.api.riotgames.com/lol/summoner/v4/summoners/${p.summonerId}`, apiKey))
    )
    const puuids: string[] = summoners.map((s: any) => s.puuid)

    // 4. 솔랭 최근 5경기씩
    const matchIdBatches = await Promise.all(
      puuids.map(puuid =>
        riotFetch(`https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&count=5`, apiKey)
      )
    )
    const uniqueIds: string[] = [...new Set<string>(matchIdBatches.flat())].slice(0, 60)

    // 5. 매치 상세 조회
    const matches = await Promise.all(
      uniqueIds.map(id => riotFetch(`https://asia.api.riotgames.com/lol/match/v5/matches/${id}`, apiKey))
    )

    // 6. 해당 챔피언 + 포지션 참여자만 필터
    const participants: any[] = matches
      .flatMap(m => m.info?.participants ?? [])
      .filter(p => p.championName === champId && p.teamPosition === position)

    if (participants.length < 4) {
      return new Response(JSON.stringify({ sampleSize: participants.length, insufficient: true }), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, s-maxage=10800' },
      })
    }

    // 7. 집계
    const itemCount: Record<string, number> = {}
    const bootCount: Record<string, number> = {}
    const keystoneCount: Record<number, number> = {}
    const primaryTreeCount: Record<number, number> = {}
    const secondaryTreeCount: Record<number, number> = {}
    const runeCount: Record<number, { count: number; treeId: number; slot: number }> = {}
    const spellCount: Record<number, number> = {}

    for (const p of participants) {
      // 아이템
      for (let i = 0; i <= 5; i++) {
        const id = String(p[`item${i}`] ?? 0)
        if (id === '0' || EXCLUDE_IDS.has(id)) continue
        if (BOOT_IDS.has(id)) {
          bootCount[id] = (bootCount[id] ?? 0) + 1
        } else {
          itemCount[id] = (itemCount[id] ?? 0) + 1
        }
      }

      // 룬
      const styles: any[] = p.perks?.styles ?? []
      const primStyle = styles[0]
      const secStyle  = styles[1]
      if (primStyle) {
        primaryTreeCount[primStyle.style] = (primaryTreeCount[primStyle.style] ?? 0) + 1
        primStyle.selections?.forEach((sel: any, si: number) => {
          if (!sel.perk) return
          if (si === 0) keystoneCount[sel.perk] = (keystoneCount[sel.perk] ?? 0) + 1
          if (!runeCount[sel.perk]) runeCount[sel.perk] = { count: 0, treeId: primStyle.style, slot: si }
          runeCount[sel.perk].count++
        })
      }
      if (secStyle) {
        secondaryTreeCount[secStyle.style] = (secondaryTreeCount[secStyle.style] ?? 0) + 1
        secStyle.selections?.forEach((sel: any) => {
          if (!sel.perk) return
          if (!runeCount[sel.perk]) runeCount[sel.perk] = { count: 0, treeId: secStyle.style, slot: 99 }
          runeCount[sel.perk].count++
        })
      }

      // 소환사 주문
      if (p.summoner1Id) spellCount[p.summoner1Id] = (spellCount[p.summoner1Id] ?? 0) + 1
      if (p.summoner2Id) spellCount[p.summoner2Id] = (spellCount[p.summoner2Id] ?? 0) + 1
    }

    const n = participants.length

    const topItems       = Object.entries(itemCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id, count]) => ({ id, count, freq: +(count / n).toFixed(2) }))
    const topBoots       = Object.entries(bootCount).sort((a, b) => b[1] - a[1]).slice(0, 1).map(([id, count]) => ({ id, count, freq: +(count / n).toFixed(2) }))
    const topKeystone    = Object.entries(keystoneCount).sort((a, b) => b[1] - a[1]).slice(0, 1).map(([id, count]) => ({ id: Number(id), count, freq: +(count / n).toFixed(2) }))
    const topPrimaryTree = Object.entries(primaryTreeCount).sort((a, b) => b[1] - a[1]).slice(0, 1).map(([id, count]) => ({ id: Number(id), count }))
    const topSecTree     = Object.entries(secondaryTreeCount).sort((a, b) => b[1] - a[1]).slice(0, 1).map(([id, count]) => ({ id: Number(id), count }))
    const topRunes       = Object.entries(runeCount)
      .sort((a, b) => {
        // sort by slot then count so we get one best rune per slot
        if (a[1].slot !== b[1].slot) return a[1].slot - b[1].slot
        return b[1].count - a[1].count
      })
      .map(([id, v]) => ({ id: Number(id), ...v }))
    const topSpells      = Object.entries(spellCount).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([id, count]) => ({ id: Number(id), key: SPELL_KEY_MAP[Number(id)] ?? '', count, freq: +(count / n).toFixed(2) }))

    return new Response(JSON.stringify({
      sampleSize:    n,
      items:         topItems,
      boots:         topBoots,
      keystone:      topKeystone[0] ?? null,
      primaryTree:   topPrimaryTree[0] ?? null,
      secondaryTree: topSecTree[0] ?? null,
      runes:         topRunes,
      summonerSpells: topSpells,
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=10800, stale-while-revalidate=21600',
      },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
