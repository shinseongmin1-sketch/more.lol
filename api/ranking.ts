export const config = { runtime: 'edge' }

import { getRankingCache, setRankingCache } from './_supabase.js'

const CACHE_TTL_MS = 10 * 60 * 1000 // 10분

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
  if (t.includes('Support'))  return '서포터'
  if (t.includes('Marksman')) return '원딜'
  if (t.includes('Assassin')) return '미드'
  if (t.includes('Mage'))     return '미드'
  if (t.includes('Fighter'))  return '탑'
  if (t.includes('Tank'))     return '탑'
  return '탑'
}

async function riotFetch(url: string, apiKey: string) {
  const res = await fetch(url, { headers: { 'X-Riot-Token': apiKey } })
  if (!res.ok) throw new Error(`riot ${res.status}`)
  return res.json()
}

async function getDDData() {
  const versions: string[] = await fetch('https://ddragon.leagueoflegends.com/api/versions.json').then(r => r.json())
  const data: any = await fetch(`https://ddragon.leagueoflegends.com/cdn/${versions[0]}/data/ko_KR/champion.json`).then(r => r.json())
  const keyToId: Record<string, string> = {}
  const tags: Record<string, string[]> = {}
  for (const champ of Object.values(data.data) as any[]) {
    keyToId[String(champ.key)] = champ.id
    tags[champ.id] = champ.tags ?? []
  }
  return { keyToId, tags }
}

const PRO_LIST = [
  { team: 'T1',    pos: '탑',     proName: 'Zeus',     gameId: 'T1 Zeus',      tag: 'KR1' },
  { team: 'T1',    pos: '정글',   proName: 'Oner',     gameId: 'T1 Oner',      tag: 'KR1' },
  { team: 'T1',    pos: '미드',   proName: 'Faker',    gameId: 'Hide on bush', tag: 'KR1' },
  { team: 'T1',    pos: '원딜',   proName: 'Gumayusi', gameId: 'T1 Gumayusi',  tag: 'KR1' },
  { team: 'T1',    pos: '서포터', proName: 'Keria',    gameId: 'T1 Keria',     tag: 'KR1' },
  { team: 'Gen.G', pos: '탑',     proName: 'Kiin',     gameId: 'Gen G Kiin',   tag: 'KR1' },
  { team: 'Gen.G', pos: '정글',   proName: 'Canyon',   gameId: 'Canyon',       tag: 'KR1' },
  { team: 'Gen.G', pos: '미드',   proName: 'Chovy',    gameId: 'Chovy',        tag: 'KR1' },
  { team: 'Gen.G', pos: '원딜',   proName: 'Ruler',    gameId: 'Ruler',        tag: 'KR1' },
  { team: 'Gen.G', pos: '서포터', proName: 'Delight',  gameId: 'Delight',      tag: 'KR1' },
  { team: 'KT',    pos: '탑',     proName: 'Doran',    gameId: 'Doran',        tag: 'KR1' },
  { team: 'KT',    pos: '정글',   proName: 'Cuzz',     gameId: 'Cuzz',         tag: 'KR1' },
  { team: 'KT',    pos: '미드',   proName: 'Bdd',      gameId: 'Bdd',          tag: 'KR1' },
  { team: 'KT',    pos: '원딜',   proName: 'Aiming',   gameId: 'Aiming',       tag: 'KR1' },
  { team: 'KT',    pos: '서포터', proName: 'Life',     gameId: 'Life',         tag: 'KR1' },
  { team: 'HLE',   pos: '탑',     proName: 'Deft',     gameId: 'Deft',         tag: 'KR1' },
  { team: 'HLE',   pos: '정글',   proName: 'Clid',     gameId: 'Clid',         tag: 'KR1' },
  { team: 'HLE',   pos: '미드',   proName: 'Zeka',     gameId: 'Zeka',         tag: 'KR1' },
  { team: 'HLE',   pos: '원딜',   proName: 'Viper',    gameId: 'Viper',        tag: 'KR1' },
  { team: 'HLE',   pos: '서포터', proName: 'Lehends',  gameId: 'Lehends',      tag: 'KR1' },
  { team: 'DRX',   pos: '탑',     proName: 'Rascal',   gameId: 'Rascal',       tag: 'KR1' },
  { team: 'DRX',   pos: '정글',   proName: 'Croco',    gameId: 'Croco',        tag: 'KR1' },
  { team: 'DRX',   pos: '미드',   proName: 'Ucal',     gameId: 'Ucal',         tag: 'KR1' },
  { team: 'DRX',   pos: '원딜',   proName: 'Teddy',    gameId: 'Teddy',        tag: 'KR1' },
  { team: 'DRX',   pos: '서포터', proName: 'BeryL',    gameId: 'BeryL',        tag: 'KR1' },
  { team: 'NS',    pos: '탑',     proName: 'DnDn',     gameId: 'DnDn',         tag: 'KR1' },
  { team: 'NS',    pos: '정글',   proName: 'Sylvie',   gameId: 'Sylvie',       tag: 'KR1' },
  { team: 'NS',    pos: '미드',   proName: 'Callme',   gameId: 'Callme',       tag: 'KR1' },
  { team: 'KDF',   pos: '미드',   proName: 'Fate',     gameId: 'Fate',         tag: 'KR1' },
  { team: 'BRO',   pos: '정글',   proName: 'Willer',   gameId: 'Willer',       tag: 'KR1' },
  { team: 'BRO',   pos: '미드',   proName: 'Lava',     gameId: 'Lava',         tag: 'KR1' },
]

async function fetchOverall(apiKey: string, limit = 100): Promise<any[]> {
  const queue = 'RANKED_SOLO_5x5'
  const [chall, gm, master, ddData] = await Promise.all([
    riotFetch(`https://kr.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/${queue}`, apiKey),
    riotFetch(`https://kr.api.riotgames.com/lol/league/v4/grandmasterleagues/by-queue/${queue}`, apiKey),
    riotFetch(`https://kr.api.riotgames.com/lol/league/v4/masterleagues/by-queue/${queue}`, apiKey),
    getDDData(),
  ])

  const tagged: any[] = [
    ...(chall.entries  ?? []).map((e: any) => ({ ...e, tierLabel: 'CHALLENGER' })),
    ...(gm.entries     ?? []).map((e: any) => ({ ...e, tierLabel: 'GRANDMASTER' })),
    ...(master.entries ?? []).map((e: any) => ({ ...e, tierLabel: 'MASTER' })),
  ]
  tagged.sort((a, b) => b.leaguePoints - a.leaguePoints)
  const top = tagged.slice(0, limit)

  // 배치 처리: 10명씩 concurrent
  const results: any[] = []
  const BATCH = 10
  for (let i = 0; i < top.length; i += BATCH) {
    const batch = top.slice(i, i + BATCH)
    const batchResults = await Promise.all(batch.map(async (entry: any) => {
      const [acc, summ, masteries] = await Promise.allSettled([
        riotFetch(`https://asia.api.riotgames.com/riot/account/v1/accounts/by-puuid/${entry.puuid}`, apiKey),
        riotFetch(`https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${entry.puuid}`, apiKey),
        riotFetch(`https://kr.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${entry.puuid}/top?count=3`, apiKey),
      ])
      const accVal  = acc.status  === 'fulfilled' ? acc.value  : null
      const summVal = summ.status === 'fulfilled' ? summ.value : null
      const mastVal = masteries.status === 'fulfilled' ? masteries.value : []
      const mostChampions: string[] = (mastVal as any[]).slice(0, 3).map((m: any) => ddData.keyToId[String(m.championId)] ?? '').filter(Boolean)
      const mainPosition = mostChampions.length > 0 ? getChampPosition(mostChampions[0], ddData.tags) : '알 수 없음'
      return {
        rank:          0,
        puuid:         entry.puuid,
        gameName:      accVal?.gameName ?? '???',
        tagLine:       accVal?.tagLine  ?? 'KR1',
        tierLabel:     entry.tierLabel,
        leaguePoints:  entry.leaguePoints,
        wins:          entry.wins,
        losses:        entry.losses,
        winRate:       Math.round((entry.wins / (entry.wins + entry.losses)) * 1000) / 10,
        veteran:       entry.veteran,
        hotStreak:     entry.hotStreak,
        profileIconId: summVal?.profileIconId ?? 1,
        region:        'KR',
        mainPosition,
        mostChampions,
      }
    }))
    results.push(...batchResults)
    // 배치 사이 rate limit 방지
    if (i + BATCH < top.length) await new Promise(r => setTimeout(r, 2000))
  }
  results.forEach((e, i) => { e.rank = i + 1 })
  return results
}

async function fetchPro(apiKey: string): Promise<any[]> {
  const ddData = await getDDData()
  const result: any[] = []
  for (const pro of PRO_LIST) {
    const acc = await riotFetch(
      `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(pro.gameId)}/${pro.tag}`,
      apiKey
    ).catch(() => null)
    if (!acc?.puuid) { result.push({ ...pro, found: false }); continue }

    const [entries, summ, masteries] = await Promise.allSettled([
      riotFetch(`https://kr.api.riotgames.com/lol/league/v4/entries/by-puuid/${acc.puuid}`, apiKey),
      riotFetch(`https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${acc.puuid}`, apiKey),
      riotFetch(`https://kr.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${acc.puuid}/top?count=3`, apiKey),
    ])
    const solo = (entries.status === 'fulfilled' ? entries.value : []).find((e: any) => e.queueType === 'RANKED_SOLO_5x5')
    const summVal = summ.status === 'fulfilled' ? summ.value : null
    const mastVal = masteries.status === 'fulfilled' ? masteries.value : []
    const mostChampions: string[] = (mastVal as any[]).slice(0, 3).map((m: any) => ddData.keyToId[String(m.championId)] ?? '').filter(Boolean)
    result.push({
      team: pro.team, pos: pro.pos, proName: pro.proName,
      gameName: acc.gameName, tagLine: acc.tagLine, found: true,
      tierLabel: solo?.tier ?? null, rank: solo?.rank ?? null,
      leaguePoints: solo?.leaguePoints ?? 0,
      wins: solo?.wins ?? 0, losses: solo?.losses ?? 0,
      winRate: solo ? Math.round((solo.wins / (solo.wins + solo.losses)) * 1000) / 10 : 0,
      hotStreak: solo?.hotStreak ?? false, veteran: solo?.veteran ?? false,
      profileIconId: summVal?.profileIconId ?? 1,
      region: 'KR', mostChampions,
    })
  }
  result.sort((a, b) => {
    const ord: Record<string, number> = { CHALLENGER:0, GRANDMASTER:1, MASTER:2, DIAMOND:3, EMERALD:4, PLATINUM:5, GOLD:6, SILVER:7, BRONZE:8, IRON:9 }
    const ta = ord[a.tierLabel ?? 'IRON'] ?? 9
    const tb = ord[b.tierLabel ?? 'IRON'] ?? 9
    if (ta !== tb) return ta - tb
    return b.leaguePoints - a.leaguePoints
  })
  result.forEach((e, i) => { e.proRank = i + 1 })
  return result
}

export default async function handler(req: Request): Promise<Response> {
  const apiKey = process.env.RIOT_API_KEY
  if (!apiKey) return new Response('API key missing', { status: 500 })

  const url   = new URL(req.url)
  const type  = url.searchParams.get('type') ?? 'overall'
  const force = url.searchParams.get('force') === '1'

  // DB 캐시 확인 (force=1 이면 건너뜀)
  if (!force) {
    const cached = await getRankingCache(type)
    if (cached) {
      const age = Date.now() - new Date(cached.updatedAt).getTime()
      if (age < CACHE_TTL_MS) {
        return new Response(JSON.stringify(cached.data), {
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT-DB',
            'X-Last-Updated': cached.updatedAt,
          },
        })
      }
    }
  }

  try {
    let data: any[]
    if (type === 'pro') {
      data = await fetchPro(apiKey)
    } else {
      data = await fetchOverall(apiKey, 100)
    }

    // DB에 저장 (다음 요청부터 캐시 사용)
    setRankingCache(type, data)

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
        'X-Last-Updated': new Date().toISOString(),
      },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
}
