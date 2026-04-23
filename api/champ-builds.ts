export const config = { runtime: 'edge' }

import { getRiotCache, setRiotCache } from './_supabase.js'

/* ── 상수 ────────────────────────────────────────────── */
const BOOT_IDS = new Set(['3006','3009','3020','3047','3111','3117','3158'])

// 서포터 퀘스트 아이템 최종 단계(ward 슬롯에 남음) → 시작템 역추적
const WARD_TO_STARTER: Record<string, string> = {
  '3853': '3850', // Shard of True Ice ← 요술사의 칼날
  '3854': '3850',
  '3855': '3850',
  '3856': '3850',
  '3860': '3858', // Bulwark ← 성물 방패
  '3861': '3858',
  '3862': '3857',
  '3863': '3857',
  '3864': '3857',
  '3865': '3857',
  '3866': '3858',
  '3867': '3858',
  '3869': '3857',
  '3876': '3857',
  '3877': '3850',
}

// 최종 집계서 제외할 아이템(소모품, 장신구, 서포터 퀘스트 전체)
const SUPPORT_QUEST_IDS = new Set(Object.keys(WARD_TO_STARTER).concat(
  ['3850','3851','3852','3857','3858','3859']
))
const TRINKET_IDS    = new Set(['3340','3363','3364','2055','3330'])
const CONSUMABLE_IDS = new Set(['2003','2031','2033','2138','4401','4403'])
const EXCLUDE_IDS    = new Set([...TRINKET_IDS, ...CONSUMABLE_IDS, ...SUPPORT_QUEST_IDS])

const POS_MAP: Record<string, string> = {
  '탑':'TOP','정글':'JUNGLE','미드':'MIDDLE','원딜':'BOTTOM','서포터':'UTILITY',
}

const SPELL_KEY_MAP: Record<number, string> = {
  1:'SummonerBoost', 3:'SummonerExhaust', 4:'SummonerFlash',
  6:'SummonerHaste',  7:'SummonerHeal',   11:'SummonerSmite',
  12:'SummonerTeleport', 14:'SummonerDot', 21:'SummonerBarrier',
}

/* ── 헬퍼 ────────────────────────────────────────────── */
async function riotFetch(url: string, key: string) {
  const r = await fetch(url, { headers: { 'X-Riot-Token': key } })
  if (!r.ok) throw new Error(`riot ${r.status}: ${url}`)
  return r.json()
}

function jsonRes(data: any, ttl = 43200) {
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 2}`,
    },
  })
}

/* ── 메인 핸들러 ─────────────────────────────────────── */
export default async function handler(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const champId  = searchParams.get('champId')
  const posKo    = searchParams.get('position') ?? '탑'
  const position = POS_MAP[posKo] ?? 'TOP'
  const force    = searchParams.get('force') === '1'

  if (!champId) return new Response('Missing champId', { status: 400 })
  const apiKey = process.env.RIOT_API_KEY
  if (!apiKey) return new Response('No API key', { status: 500 })

  // ── Supabase 캐시 확인 (12시간) ──────────────────────
  const cacheKey = `champ-builds-v3:${champId}:${position}`
  if (!force) {
    try {
      const cached = await getRiotCache(cacheKey)
      if (cached) return jsonRes(cached)
    } catch {}
  }

  try {
    // ── 1. DDragon 버전 + 챔피언 숫자 ID + 리그 데이터 병렬 ──
    const [versionsRaw, challData, gmData] = await Promise.all([
      fetch('https://ddragon.leagueoflegends.com/api/versions.json').then(r => r.json()),
      riotFetch('https://kr.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5', apiKey),
      riotFetch('https://kr.api.riotgames.com/lol/league/v4/grandmasterleagues/by-queue/RANKED_SOLO_5x5', apiKey),
    ])
    const ddVersion = versionsRaw[0]

    // 챔피언 숫자 ID (match 필터에 사용)
    const champJson = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${ddVersion}/data/en_US/champion.json`
    ).then(r => r.json())
    const champNumId = Number(champJson.data[champId]?.key ?? 0)

    // ── 2. LP 상위 25명 PUUID ────────────────────────────
    const top25: any[] = [...challData.entries, ...gmData.entries]
      .sort((a: any, b: any) => b.leaguePoints - a.leaguePoints)
      .slice(0, 25)

    const summoners = await Promise.all(
      top25.map(p => riotFetch(
        `https://kr.api.riotgames.com/lol/summoner/v4/summoners/${p.summonerId}`, apiKey
      ))
    )
    const puuids: string[] = summoners.map((s: any) => s.puuid)

    // ── 3. 챔피언 필터 매치 목록 조회 ───────────────────
    // champion 파라미터로 필터링 → 해당 챔피언 게임만 가져옴
    const matchIdBatches = await Promise.all(
      puuids.map(puuid => {
        let url = `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&count=5`
        if (champNumId > 0) url += `&champion=${champNumId}`
        return riotFetch(url, apiKey)
      })
    )
    const uniqueIds: string[] = [...new Set<string>(matchIdBatches.flat())].slice(0, 40)

    if (uniqueIds.length === 0) {
      return jsonRes({ sampleSize: 0, insufficient: true })
    }

    // ── 4. 매치 상세 조회 ────────────────────────────────
    const matches = await Promise.all(
      uniqueIds.map(id =>
        riotFetch(`https://asia.api.riotgames.com/lol/match/v5/matches/${id}`, apiKey)
      )
    )

    // ── 5. 해당 챔피언 + 포지션 참여자만 필터 ────────────
    const participants: any[] = matches
      .flatMap(m => m.info?.participants ?? [])
      .filter(p => p.championName === champId && p.teamPosition === position)

    if (participants.length < 3) {
      return jsonRes({ sampleSize: participants.length, insufficient: true })
    }

    const n = participants.length

    // ── 6. 집계 ──────────────────────────────────────────
    const itemCount: Record<string, number>  = {}
    const bootCount: Record<string, number>  = {}
    const slotSum:   Record<string, number>  = {}  // 슬롯 합계 (구매 순서 추정용)
    const slotCnt:   Record<string, number>  = {}
    const startCount:Record<string, number>  = {}  // 서포터 시작템
    const keystoneCount:     Record<number, number> = {}
    const primaryTreeCount:  Record<number, number> = {}
    const secondaryTreeCount:Record<number, number> = {}
    const runeCount: Record<number, { count: number; treeId: number; slot: number }> = {}
    const spellCount:Record<number, number>  = {}

    for (const p of participants) {
      // 서포터 시작템 감지 (ward 슬롯 item6으로 역추적)
      const wardId = String(p.item6 ?? 0)
      if (WARD_TO_STARTER[wardId]) {
        const sid = WARD_TO_STARTER[wardId]
        startCount[sid] = (startCount[sid] ?? 0) + 1
      }

      // 아이템 슬롯 0-5: 슬롯 번호 = 구매 순서 근사치
      // (같은 슬롯에 여러 아이템이 거쳐가지만 최종값 = 마지막으로 채운 아이템)
      for (let slot = 0; slot <= 5; slot++) {
        const id = String(p[`item${slot}`] ?? 0)
        if (id === '0' || EXCLUDE_IDS.has(id)) continue
        if (BOOT_IDS.has(id)) {
          bootCount[id] = (bootCount[id] ?? 0) + 1
        } else {
          itemCount[id] = (itemCount[id] ?? 0) + 1
          slotSum[id]   = (slotSum[id] ?? 0) + slot
          slotCnt[id]   = (slotCnt[id] ?? 0) + 1
        }
      }

      // 룬
      const styles: any[] = p.perks?.styles ?? []
      const primStyle = styles[0], secStyle = styles[1]
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

    // ── 7. 아이템 정렬: 평균 슬롯(구매 순서) 기준 ────────
    const sortedItems = Object.entries(itemCount)
      .map(([id, count]) => ({
        id,
        count,
        freq:    +(count / n).toFixed(2),
        avgSlot: +(slotSum[id] / slotCnt[id]).toFixed(2),
      }))
      .filter(it => it.freq >= 0.15)            // 15% 이상 픽률 아이템만
      .sort((a, b) => a.avgSlot - b.avgSlot)    // 낮은 슬롯(먼저 산 템) 순

    // 코어: 상위 3개 (가장 먼저 사는 아이템)
    // 완성: 나머지 (4번째~)
    const coreItems = sortedItems.slice(0, 3)
    const lateItems = sortedItems.slice(3, 6)

    const topBoots = Object.entries(bootCount)
      .sort((a, b) => b[1] - a[1]).slice(0, 1)
      .map(([id, count]) => ({ id, freq: +(count / n).toFixed(2) }))

    const topStartItems = Object.entries(startCount)
      .sort((a, b) => b[1] - a[1]).slice(0, 1)
      .map(([id, count]) => ({ id, freq: +(count / n).toFixed(2) }))

    const topKeystone = Object.entries(keystoneCount)
      .sort((a, b) => b[1] - a[1]).slice(0, 1)
      .map(([id, count]) => ({ id: Number(id), freq: +(count / n).toFixed(2) }))

    const topPrimaryTree = Object.entries(primaryTreeCount)
      .sort((a, b) => b[1] - a[1]).slice(0, 1)
      .map(([id]) => ({ id: Number(id) }))

    const topSecTree = Object.entries(secondaryTreeCount)
      .sort((a, b) => b[1] - a[1]).slice(0, 1)
      .map(([id]) => ({ id: Number(id) }))

    const topRunes = Object.entries(runeCount)
      .sort((a, b) => a[1].slot !== b[1].slot ? a[1].slot - b[1].slot : b[1].count - a[1].count)
      .map(([id, v]) => ({ id: Number(id), ...v }))

    const topSpells = Object.entries(spellCount)
      .sort((a, b) => b[1] - a[1]).slice(0, 2)
      .map(([id, count]) => ({
        id: Number(id),
        key: SPELL_KEY_MAP[Number(id)] ?? '',
        freq: +(count / n).toFixed(2),
      }))

    const result = {
      sampleSize:    n,
      startItems:    topStartItems,   // 서포터 시작템 (ward 슬롯 역추적)
      boots:         topBoots,
      coreItems,                      // 슬롯 순서 상위 3개 (가장 먼저 사는 코어)
      lateItems,                      // 슬롯 순서 4-6위 (완성 빌드 후반 아이템)
      items:         sortedItems,     // 전체 (호환성)
      keystone:      topKeystone[0] ?? null,
      primaryTree:   topPrimaryTree[0] ?? null,
      secondaryTree: topSecTree[0] ?? null,
      runes:         topRunes,
      summonerSpells: topSpells,
    }

    // ── 8. Supabase 캐시 저장 (12시간) ──────────────────
    try { await setRiotCache(cacheKey, result, 43200) } catch {}

    return jsonRes(result)

  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
