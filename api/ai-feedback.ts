export const config = { runtime: 'nodejs' }

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  let body: any
  try { body = await req.json() } catch { return new Response('Bad Request', { status: 400 }) }

  const { matchId, puuid, championName, kills, deaths, assists, cs, visionScore, duration, win, queueLabel, teamKills, teamDeaths, teamAssists } = body
  if (!matchId || !puuid) return new Response('Missing params', { status: 400 })
  const cacheKey = `${matchId}_${puuid}`

  const RIOT_API_KEY    = process.env.RIOT_API_KEY
  const COHERE_API_KEY  = process.env.COHERE_API_KEY
  const SB_URL          = process.env.VITE_SUPABASE_URL
  const SB_KEY          = process.env.VITE_SUPABASE_ANON_KEY
  if (!RIOT_API_KEY || !COHERE_API_KEY) return new Response('Server misconfigured', { status: 500 })

  // 1. 캐시 확인
  if (SB_URL && SB_KEY) {
    const cached = await fetch(
      `${SB_URL}/rest/v1/ai_match_feedback?match_id=eq.${encodeURIComponent(cacheKey)}&limit=1`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    ).catch(() => null)
    if (cached?.ok) {
      const [row] = await cached.json().catch(() => [])
      if (row?.feedback) {
        return new Response(JSON.stringify({ feedback: row.feedback, cached: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }
  }

  // 2. Riot 타임라인 fetch (실패해도 계속 진행)
  let earlyKills = 0, earlyDeaths = 0
  let dragonCount = 0, baronCount = 0, heraldCount = 0, grubCount = 0, towerCount = 0
  const teamfights: { timeSec: number; size: number; withMe: boolean }[] = []
  let hasTimeline = false

  const tlController = new AbortController()
  const tlTimeout = setTimeout(() => tlController.abort(), 4000)
  const tlRes = await fetch(
    `https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}/timeline`,
    { headers: { 'X-Riot-Token': RIOT_API_KEY }, signal: tlController.signal }
  ).catch(() => null).finally(() => clearTimeout(tlTimeout))

  if (tlRes?.ok) {
    const tl = await tlRes.json().catch(() => null)
    if (tl) {
      hasTimeline = true
      const participants: any[] = tl.info?.participants ?? []
      const myId = participants.find((p: any) => p.puuid === puuid)?.participantId ?? -1
      const allEvents: any[] = (tl.info?.frames ?? []).flatMap((f: any) => f.events ?? [])
      const EARLY = 900_000

      earlyKills  = allEvents.filter(e => e.type === 'CHAMPION_KILL' && e.timestamp < EARLY && e.killerId === myId).length
      earlyDeaths = allEvents.filter(e => e.type === 'CHAMPION_KILL' && e.timestamp < EARLY && e.victimId === myId).length
      dragonCount = allEvents.filter(e => e.type === 'ELITE_MONSTER_KILL' && e.monsterType === 'DRAGON').length
      baronCount  = allEvents.filter(e => e.type === 'ELITE_MONSTER_KILL' && e.monsterType === 'BARON_NASHOR').length
      heraldCount = allEvents.filter(e => e.type === 'ELITE_MONSTER_KILL' && e.monsterType === 'RIFTHERALD').length
      grubCount   = allEvents.filter(e => e.type === 'ELITE_MONSTER_KILL' && e.monsterType === 'HORDE').length
      towerCount  = allEvents.filter(e => e.type === 'BUILDING_KILL' && e.buildingType === 'TOWER_BUILDING').length

      const killEvts = allEvents.filter(e => e.type === 'CHAMPION_KILL')
      let skip = 0
      for (let i = 0; i < killEvts.length; i++) {
        if (skip > 0) { skip--; continue }
        const w = killEvts[i].timestamp + 30_000
        const cluster = killEvts.filter(e => e.timestamp >= killEvts[i].timestamp && e.timestamp <= w)
        if (cluster.length >= 3) {
          teamfights.push({
            timeSec: Math.floor(killEvts[i].timestamp / 1000),
            size: cluster.length,
            withMe: cluster.some(e => e.killerId === myId || e.victimId === myId),
          })
          skip = cluster.length - 1
        }
      }
    }
  }

  // 3. 프롬프트 구성
  const durMin   = Math.floor(duration / 60)
  const kda      = deaths === 0 ? (kills + assists).toFixed(1) : ((kills + assists) / deaths).toFixed(1)
  const csPerMin = (cs / Math.max(duration / 60, 1)).toFixed(1)
  const tfLines  = teamfights.slice(0, 5)
    .map(tf => `  • ${Math.floor(tf.timeSec / 60)}분 ${tf.timeSec % 60}초 (${tf.size}킬 규모${tf.withMe ? ', 플레이어 참여' : ''})`)
    .join('\n')

  const timelineSection = hasTimeline ? `
[초반 15분]
킬 ${earlyKills}회 / 데스 ${earlyDeaths}회

[오브젝트]
드래곤 ${dragonCount}마리 / 바론 ${baronCount}회 / 전령 ${heraldCount}회 / 공허쐐기벌레 ${grubCount}마리 / 포탑 ${towerCount}개

[한타 발생 ${teamfights.length}회]
${tfLines || '  (없음)'}` : ''

  const killParticipation = teamKills > 0 ? Math.round(((kills + assists) / teamKills) * 100) : 0
  const teamKdaNote = (teamKills != null && teamDeaths != null && teamAssists != null)
    ? `팀 전체 KDA: ${teamKills}/${teamDeaths}/${teamAssists} / 킬관여율: ${killParticipation}%`
    : ''

  const prompt = `당신은 리그 오브 레전드 전문 코치입니다. 아래 데이터를 분석해 한국어로 피드백을 주세요.

[게임 정보]
챔피언: ${championName} / 모드: ${queueLabel} / 결과: ${win ? '승리' : '패배'} / 시간: ${durMin}분
KDA: ${kills}/${deaths}/${assists} (${kda} 평점) / CS: ${cs} (${csPerMin}/분) / 시야: ${visionScore}
${teamKdaNote}
${timelineSection}

팀 KDA 대비 개인 기여도를 반드시 반영하세요. 킬관여율이 낮으면 팀원에게 의존한 경기임을 명시하고, 높으면 팀에 기여한 경기임을 명시하세요.
위 데이터를 바탕으로 다음 형식으로 간결하게 분석해주세요. 총 300자 이내, 이모지 적극 사용:
⚔️ 초반 운영: (2문장)
🏯 오브젝트: (2문장)
🔥 한타: (2문장)
💡 총평: (1문장)`

  // 3. Gemini API 호출
  const aiController = new AbortController()
  const aiTimeout = setTimeout(() => aiController.abort(), 25000)
  let aiTimedOut = false
  const aiRes = await fetch('https://api.cohere.com/v2/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${COHERE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'command-r-08-2024',
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: aiController.signal,
  }).catch((e) => {
    if (e?.name === 'AbortError') aiTimedOut = true
    else console.error('Cohere fetch error:', e)
    return null
  }).finally(() => clearTimeout(aiTimeout))

  if (aiTimedOut) {
    return new Response(JSON.stringify({ error: 'AI 분석 시간 초과 — 다시 시도해주세요.' }), { status: 504, headers: { 'Content-Type': 'application/json' } })
  }
  if (!aiRes || !aiRes.ok) {
    const errText = await aiRes?.text().catch(() => '')
    console.error('Cohere error:', aiRes?.status, errText)
    return new Response(JSON.stringify({ error: `AI 서버 오류 (${aiRes?.status ?? 'network'})` }), { status: 502, headers: { 'Content-Type': 'application/json' } })
  }

  const aiData = await aiRes.json()
  const feedback = aiData.message?.content?.[0]?.text ?? '피드백을 생성할 수 없습니다.'

  // 캐시 저장 (fire and forget)
  if (SB_URL && SB_KEY) {
    fetch(`${SB_URL}/rest/v1/ai_match_feedback`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({ match_id: cacheKey, feedback }),
    }).catch(() => {})
  }

  return new Response(JSON.stringify({ feedback }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
