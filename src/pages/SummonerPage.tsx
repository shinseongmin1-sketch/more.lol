import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getAccount, getSummonerByPuuid, getRankedInfo,
  getMatchIds, getAllMatchIds, getMatch, getDDVersion, getChampMap,
  getSpellMap, getRuneMap, getLiveGame,
  champIconUrl, itemIconUrl, profileIconUrl, spellIconUrl, runeIconUrl, QUEUE_LABELS,
} from '../utils/riotApi'
import { saveSummoners, saveRankHistory, getRankHistory } from '../utils/supabase'
import { findCelebrityByAccount } from '../data/celebrities'
import './SummonerPage.css'

const TIER_COLORS: Record<string, string> = {
  IRON: '#6b7280',
  BRONZE: '#cd7f32',
  SILVER: '#a8a8a8',
  GOLD: '#ffd700',
  PLATINUM: '#00d4aa',
  EMERALD: '#50c878',
  DIAMOND: '#a8d4f5',
  MASTER: '#9d5da8',
  GRANDMASTER: '#e25c5c',
  CHALLENGER: '#e8d5b7',
}

function tierEmblemUrl(tier: string): string {
  return `https://opgg-static.akamaized.net/images/medals_new/${tier.toLowerCase()}.png`
}

const TIER_BG: Record<string, string> = {
  IRON: '#6b728022',
  BRONZE: '#cd7f3222',
  SILVER: '#a8a8a822',
  GOLD: '#ffd70022',
  PLATINUM: '#00d4aa22',
  EMERALD: '#50c87822',
  DIAMOND: '#a8d4f522',
  MASTER: '#9d5da822',
  GRANDMASTER: '#e25c5c22',
  CHALLENGER: '#e8d5b722',
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}

function formatRefreshedAt(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 1) return '방금 전'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}

function formatDuration(sec: number): string {
  return `${Math.floor(sec / 60)}분 ${String(sec % 60).padStart(2, '0')}초`
}

function handleApiError(e: unknown): string {
  const msg = String((e as Error).message)
  if (msg === '404') return '소환사를 찾을 수 없습니다. 소환사명#태그를 확인해주세요.'
  if (msg === '429') return 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
  if (msg === '403') return 'API 키가 만료되었습니다.'
  return `오류: ${msg}`
}

interface Participant {
  puuid: string
  gameName: string
  tagLine: string
  championId: string
  win: boolean
  teamId: number
  spell1Id: string
  spell2Id: string
  primaryRuneId: number
  subStyleId: number
  kills: number
  deaths: number
  assists: number
  totalDamage: number
  cs: number
  items: number[]
}

interface MatchData {
  matchId: string
  win: boolean
  queueId: number
  queueLabel: string
  championName: string
  championId: string
  champLevel: number
  kills: number
  deaths: number
  assists: number
  cs: number
  visionScore: number
  duration: number
  gameStartTimestamp: number
  items: number[]
  spell1Id: string
  spell2Id: string
  primaryRuneId: number
  subStyleId: number
  teammates: Participant[]
  opponents: Participant[]
  allParticipants: Participant[]
}

export default function SummonerPage() {
  const navigate = useNavigate()
  const { name } = useParams<{ name: string }>()
  const decoded = decodeURIComponent(name || '')
  const hashIdx = decoded.indexOf('#')
  const gameName = hashIdx >= 0 ? decoded.slice(0, hashIdx) : decoded
  const tagLine  = hashIdx >= 0 ? decoded.slice(hashIdx + 1) : 'KR1'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [account, setAccount] = useState<any>(null)
  const [summoner, setSummoner] = useState<any>(null)
  const [rankInfo, setRankInfo] = useState<any[]>([])
  const [matches, setMatches] = useState<MatchData[]>([])
  const [allMatches, setAllMatches] = useState<MatchData[]>([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalMatchCount, setTotalMatchCount] = useState(0)
  const [ddVersion, setDdVersion] = useState('')
  const [activeFilter, setActiveFilter] = useState('전체')
  const [mostFilter, setMostFilter] = useState('전체')
  const [refresh, setRefresh] = useState(0)
  const [rankHistory, setRankHistory] = useState<Array<{ season: string; tier: string; rank: string; leaguePoints: number; wins: number; losses: number }>>([])
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null)
  const [, setNow] = useState(Date.now())
  const [cooldown, setCooldown] = useState(0)
  const [spellMap, setSpellMap] = useState<Record<string, { id: string; name: string }>>({})
  const [runeMap, setRuneMap] = useState<Record<number, { icon: string; name: string }>>({})
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)
  const [teammateIcons, setTeammateIcons] = useState<Record<string, number>>({})
  const [allMatchIds, setAllMatchIds] = useState<string[]>([])
  const [loadingMoreVisible, setLoadingMoreVisible] = useState(false)
  const [liveGame, setLiveGame] = useState<any>(null)
  const [liveLoading, setLiveLoading] = useState(false)
  const [showLiveGame, setShowLiveGame] = useState(false)
  const [liveError, setLiveError] = useState<string | null>(null)
  const [liveRanks, setLiveRanks] = useState<Record<string, any[]>>({})
  const [liveTimer, setLiveTimer] = useState(0)
  const [aiFeedback, setAiFeedback] = useState<Record<string, string>>({})
  const [aiFeedbackLoading, setAiFeedbackLoading] = useState<Record<string, boolean>>({})
  const [aiFeedbackError, setAiFeedbackError] = useState<Record<string, string>>({})
  const [aiFeedbackOpen, setAiFeedbackOpen] = useState<Record<string, boolean>>({})


  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setError(null)
      setMatches([])
      setRankInfo([])
      try {
        const [version, champMap, sMap, rMap] = await Promise.all([getDDVersion(), getChampMap(), getSpellMap(), getRuneMap()])
        if (cancelled) return
        setDdVersion(version)
        setSpellMap(sMap)
        setRuneMap(rMap)

        const acc = await getAccount(gameName, tagLine)
        if (cancelled) return
        setAccount(acc)
        // 검색된 소환사 DB에 저장 (fire and forget)
        saveSummoners([{ gameName: acc.gameName, tagLine: acc.tagLine }])

        const [summ, recentIds, allIds] = await Promise.all([
          getSummonerByPuuid(acc.puuid),
          getMatchIds(acc.puuid, 20),
          getAllMatchIds(acc.puuid, 1000),
        ])
        if (cancelled) return
        setSummoner(summ)
        setTotalMatchCount(allIds.length)
        setAllMatchIds(allIds as string[])

        const ranks = await getRankedInfo(acc.puuid)
        if (cancelled) return
        setRankInfo(ranks)

        // 솔로랭크 히스토리 저장 및 로드
        const solo = ranks.find((r: any) => r.queueType === 'RANKED_SOLO_5x5')
        if (solo) {
          saveRankHistory(acc.puuid, solo.tier, solo.rank, solo.leaguePoints, solo.wins, solo.losses)
        }
        const history = await getRankHistory(acc.puuid)
        if (!cancelled) setRankHistory(history)

        // 최근 20게임 상세 (전적 카드용)
        const BATCH = 5
        const matchDetails: any[] = []
        for (let i = 0; i < recentIds.length; i += BATCH) {
          if (cancelled) return
          const batch = await Promise.all(
            (recentIds as string[]).slice(i, i + BATCH).map((id: string) => getMatch(id))
          )
          matchDetails.push(...batch)
        }

        const mapParticipant = (p: any): Participant => {
          const tc = champMap[String(p.championId)]
          return {
            puuid: p.puuid,
            gameName: p.riotIdGameName ?? '',
            tagLine: p.riotIdTagline ?? '',
            championId: tc?.id ?? p.championName,
            win: p.win,
            teamId: p.teamId,
            spell1Id: String(p.summoner1Id),
            spell2Id: String(p.summoner2Id),
            primaryRuneId: p.perks?.styles?.[0]?.selections?.[0]?.perk ?? 0,
            subStyleId: p.perks?.styles?.[1]?.style ?? 0,
            kills: p.kills,
            deaths: p.deaths,
            assists: p.assists,
            totalDamage: p.totalDamageDealtToChampions ?? 0,
            cs: (p.totalMinionsKilled ?? 0) + (p.neutralMinionsKilled ?? 0),
            items: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6],
          }
        }

        const processed: MatchData[] = (matchDetails as any[])
          .map((match) => {
            const participants: any[] = match.info.participants
            const me = participants.find((p: any) => p.puuid === acc.puuid)
            if (!me) return null
            const champ = champMap[String(me.championId)]

            const allParticipants = participants.map(mapParticipant)
            const teammates = allParticipants.filter(p => p.puuid !== acc.puuid && p.teamId === me.teamId)
            const opponents = allParticipants.filter(p => p.teamId !== me.teamId)

            return {
              matchId: match.metadata.matchId,
              win: me.win,
              queueId: match.info.queueId,
              queueLabel: QUEUE_LABELS[match.info.queueId as number] ?? '기타',
              championName: champ?.name ?? me.championName,
              championId: champ?.id ?? me.championName,
              champLevel: me.champLevel ?? 1,
              kills: me.kills,
              deaths: me.deaths,
              assists: me.assists,
              cs: me.totalMinionsKilled + me.neutralMinionsKilled,
              visionScore: me.visionScore ?? 0,
              duration: match.info.gameDuration,
              gameStartTimestamp: match.info.gameStartTimestamp,
              items: [me.item0, me.item1, me.item2, me.item3, me.item4, me.item5, me.item6],
              spell1Id: String(me.summoner1Id),
              spell2Id: String(me.summoner2Id),
              primaryRuneId: me.perks?.styles?.[0]?.selections?.[0]?.perk ?? 0,
              subStyleId: me.perks?.styles?.[1]?.style ?? 0,
              teammates,
              opponents,
              allParticipants,
            }
          })
          .filter(Boolean) as MatchData[]

        setMatches(processed)
        // 같이 게임한 유저 전체 DB에 저장
        const participants = processed.flatMap(m => [...m.teammates, ...m.opponents])
        const unique = Array.from(
          new Map(participants.filter(p => p.gameName && p.tagLine).map(p => [`${p.gameName}#${p.tagLine}`, p])).values()
        )
        if (unique.length > 0) saveSummoners(unique)

        // 전체 매치 상세 백그라운드 로드 (모스트챔피언용)
        const remainingIds = (allIds as string[]).filter((id: string) => !(recentIds as string[]).includes(id))
        if (remainingIds.length > 0 && !cancelled) {
          setLoadingMore(true)
          const allDetails: MatchData[] = [...processed]
          for (let i = 0; i < remainingIds.length; i += BATCH) {
            if (cancelled) break
            const batch = await Promise.all(
              remainingIds.slice(i, i + BATCH).map((id: string) => getMatch(id).catch(() => null))
            )
            const batchProcessed = batch
              .filter(Boolean)
              .map((match: any) => {
                const pts: any[] = match.info.participants
                const me = pts.find((p: any) => p.puuid === acc.puuid)
                if (!me) return null
                const champ = champMap[String(me.championId)]
                return {
                  matchId: match.metadata.matchId,
                  win: me.win,
                  queueId: match.info.queueId,
                  queueLabel: QUEUE_LABELS[match.info.queueId as number] ?? '기타',
                  championName: champ?.name ?? me.championName,
                  championId: champ?.id ?? me.championName,
                  champLevel: me.champLevel ?? 1,
                  kills: me.kills, deaths: me.deaths, assists: me.assists,
                  cs: me.totalMinionsKilled + me.neutralMinionsKilled,
                  visionScore: me.visionScore ?? 0,
                  duration: match.info.gameDuration,
                  gameStartTimestamp: match.info.gameStartTimestamp,
                  items: [me.item0, me.item1, me.item2, me.item3, me.item4, me.item5, me.item6],
                  spell1Id: String(me.summoner1Id ?? ''),
                  spell2Id: String(me.summoner2Id ?? ''),
                  primaryRuneId: me.perks?.styles?.[0]?.selections?.[0]?.perk ?? 0,
                  subStyleId: me.perks?.styles?.[1]?.style ?? 0,
                  teammates: [], opponents: [], allParticipants: [],
                } as MatchData
              })
              .filter(Boolean) as MatchData[]
            allDetails.push(...batchProcessed)
            if (!cancelled) setAllMatches([...allDetails])
            // rate limit 방지
            await new Promise(r => setTimeout(r, 120))
          }
          if (!cancelled) setLoadingMore(false)
        } else {
          setAllMatches(processed)
        }
      } catch (e) {
        if (!cancelled) setError(handleApiError(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [gameName, tagLine, refresh])

  // 더보기: 다음 20경기 로드
  const loadMoreMatches = async () => {
    if (!account || loadingMoreVisible) return
    const loaded = matches.length
    const nextIds = allMatchIds.slice(loaded, loaded + 20)
    if (nextIds.length === 0) return
    setLoadingMoreVisible(true)
    try {
      const champMap = await getChampMap()
      const BATCH = 5
      const details: any[] = []
      for (let i = 0; i < nextIds.length; i += BATCH) {
        const batch = await Promise.all(nextIds.slice(i, i + BATCH).map(id => getMatch(id).catch(() => null)))
        details.push(...batch.filter(Boolean))
        await new Promise(r => setTimeout(r, 100))
      }
      const mapP = (p: any): Participant => {
        const tc = champMap[String(p.championId)]
        return {
          puuid: p.puuid,
          gameName: p.riotIdGameName ?? '',
          tagLine: p.riotIdTagline ?? '',
          championId: tc?.id ?? p.championName,
          win: p.win, teamId: p.teamId,
          spell1Id: String(p.summoner1Id),
          spell2Id: String(p.summoner2Id),
          primaryRuneId: p.perks?.styles?.[0]?.selections?.[0]?.perk ?? 0,
          subStyleId: p.perks?.styles?.[1]?.style ?? 0,
          kills: p.kills, deaths: p.deaths, assists: p.assists,
          totalDamage: p.totalDamageDealtToChampions ?? 0,
          cs: (p.totalMinionsKilled ?? 0) + (p.neutralMinionsKilled ?? 0),
          items: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6],
        }
      }
      const newMatches: MatchData[] = details.map((match: any) => {
        const pts: any[] = match.info.participants
        const me = pts.find((p: any) => p.puuid === account.puuid)
        if (!me) return null
        const champ = champMap[String(me.championId)]
        const all = pts.map(mapP)
        return {
          matchId: match.metadata.matchId,
          win: me.win,
          queueId: match.info.queueId,
          queueLabel: QUEUE_LABELS[match.info.queueId] ?? '기타',
          championName: champ?.name ?? me.championName,
          championId: champ?.id ?? me.championName,
          champLevel: me.champLevel ?? 1,
          kills: me.kills, deaths: me.deaths, assists: me.assists,
          cs: me.totalMinionsKilled + me.neutralMinionsKilled,
          visionScore: me.visionScore ?? 0,
          duration: match.info.gameDuration,
          gameStartTimestamp: match.info.gameStartTimestamp,
          items: [me.item0, me.item1, me.item2, me.item3, me.item4, me.item5, me.item6],
          spell1Id: String(me.summoner1Id),
          spell2Id: String(me.summoner2Id),
          primaryRuneId: me.perks?.styles?.[0]?.selections?.[0]?.perk ?? 0,
          subStyleId: me.perks?.styles?.[1]?.style ?? 0,
          teammates: all.filter(p => p.puuid !== account.puuid && p.teamId === me.teamId),
          opponents: all.filter(p => p.teamId !== me.teamId),
          allParticipants: all,
        } as MatchData
      }).filter(Boolean) as MatchData[]
      setMatches(prev => [...prev, ...newMatches])
    } finally {
      setLoadingMoreVisible(false)
    }
  }

  // 갱신 완료 시점 기록
  useEffect(() => {
    if (!loading && !error) setLastRefreshedAt(new Date())
  }, [loading])

  // 1분마다 재렌더해서 "몇분전" 업데이트
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(id)
  }, [])

  // 쿨타임 카운트다운
  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  // 인게임 타이머
  useEffect(() => {
    if (!showLiveGame) return
    const iv = setInterval(() => setLiveTimer(t => t + 1), 1000)
    return () => clearInterval(iv)
  }, [showLiveGame])

  // 인게임 자동 감지 폴링 (30초마다)
  useEffect(() => {
    if (!summoner?.id) return
    let cancelled = false

    const poll = async () => {
      try {
        const game = await getLiveGame(summoner.puuid)
        if (cancelled) return
        if (game && !game.status) {
          setLiveGame(game)
          setLiveTimer(game.gameLength ?? 0)
          setShowLiveGame(true)
          setLiveError(null)
          const ranks: Record<string, any[]> = {}
          await Promise.all(game.participants.map(async (p: any) => {
            try { ranks[p.puuid] = await getRankedInfo(p.puuid) ?? [] }
            catch { ranks[p.puuid] = [] }
          }))
          if (!cancelled) setLiveRanks(ranks)
        } else {
          // 게임 종료 감지 — 패널이 열려 있었다면 닫기
          if (!cancelled) setShowLiveGame(prev => {
            if (prev) setLiveError(null)
            return false
          })
        }
      } catch (e) {
        const code = String((e as Error).message)
        if (code !== '404' && !cancelled) {
          setLiveError(
            code === '403' ? '인게임 조회 실패 (API 키 권한 없음)' :
            code === '429' ? '인게임 조회 실패 (잠시 후 재시도)' :
            `인게임 조회 실패 (${code})`
          )
        }
      }
    }

    poll() // 즉시 1회 실행
    const iv = setInterval(poll, 30000)
    return () => { cancelled = true; clearInterval(iv) }
  }, [summoner?.puuid]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLiveGame = async () => {
    if (!summoner?.puuid) return
    setLiveLoading(true)
    setLiveError(null)
    // 패널이 이미 열려 있으면 닫지 않고 조용히 갱신
    try {
      const game = await getLiveGame(summoner.puuid)
      if (!game || game.status) {
        setShowLiveGame(false)
        setLiveError('현재 게임 중이 아닙니다.')
        return
      }
      setLiveGame(game)
      setLiveTimer(game.gameLength ?? 0)
      setShowLiveGame(true)
      const ranks: Record<string, any[]> = {}
      await Promise.all(game.participants.map(async (p: any) => {
        try { ranks[p.puuid] = await getRankedInfo(p.puuid) ?? [] }
        catch { ranks[p.puuid] = [] }
      }))
      setLiveRanks(ranks)
    } catch (e) {
      const msg = String((e as Error).message)
      if (msg === '429') {
        // rate limit: 패널이 이미 열려 있으면 그냥 유지
        if (!showLiveGame) setLiveError('잠시 후 다시 시도해주세요.')
      } else {
        setShowLiveGame(false)
        setLiveError('현재 게임 중이 아닙니다.')
      }
    } finally {
      setLiveLoading(false)
    }
  }

  const fetchAiFeedback = async (match: MatchData) => {
    if (aiFeedback[match.matchId] || aiFeedbackLoading[match.matchId]) return
    setAiFeedbackLoading(prev => ({ ...prev, [match.matchId]: true }))
    setAiFeedbackError(prev => ({ ...prev, [match.matchId]: '' }))
    try {
      const res = await fetch('/api/ai-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: match.matchId,
          puuid: account?.puuid,
          championName: match.championName,
          kills: match.kills,
          deaths: match.deaths,
          assists: match.assists,
          cs: match.cs,
          visionScore: match.visionScore,
          duration: match.duration,
          win: match.win,
          queueLabel: match.queueLabel,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setAiFeedback(prev => ({ ...prev, [match.matchId]: data.feedback }))
      } else {
        const errData = await res.json().catch(() => ({}))
        setAiFeedbackError(prev => ({ ...prev, [match.matchId]: errData.error ?? `AI 분석 실패 (${res.status})` }))
      }
    } catch {
      setAiFeedbackError(prev => ({ ...prev, [match.matchId]: '네트워크 오류로 AI 분석에 실패했습니다.' }))
    } finally {
      setAiFeedbackLoading(prev => ({ ...prev, [match.matchId]: false }))
    }
  }

  const filteredMatches = matches.filter(m => {
    if (activeFilter === '전체')   return true
    if (activeFilter === 'ARAM')   return m.queueId === 450
    if (activeFilter === '솔로랭크') return m.queueId === 420
    if (activeFilter === '자유랭크') return m.queueId === 440
    if (activeFilter === '일반')   return m.queueId === 430 || m.queueId === 400
    return true
  })

  const winCount   = filteredMatches.filter(m => m.win).length
  const totalCount = filteredMatches.length
  const winRate    = totalCount > 0 ? Math.round((winCount / totalCount) * 100) : 0
  const avgKills   = totalCount > 0 ? (filteredMatches.reduce((s, m) => s + m.kills,   0) / totalCount).toFixed(1) : '0.0'
  const avgDeaths  = totalCount > 0 ? (filteredMatches.reduce((s, m) => s + m.deaths,  0) / totalCount).toFixed(1) : '0.0'
  const avgAssists = totalCount > 0 ? (filteredMatches.reduce((s, m) => s + m.assists, 0) / totalCount).toFixed(1) : '0.0'
  const avgKda     = Number(avgDeaths) === 0
    ? (Number(avgKills) + Number(avgAssists)).toFixed(2)
    : ((Number(avgKills) + Number(avgAssists)) / Number(avgDeaths)).toFixed(2)

  const mostFilteredMatches = allMatches.filter(m => {
    if (mostFilter === '솔로랭크') return m.queueId === 420
    if (mostFilter === '자유랭크') return m.queueId === 440
    return true
  })

  const champStats: Record<string, { name: string; id: string; wins: number; total: number; kills: number; deaths: number; assists: number }> = {}
  mostFilteredMatches.forEach(m => {
    if (!champStats[m.championId]) {
      champStats[m.championId] = { name: m.championName, id: m.championId, wins: 0, total: 0, kills: 0, deaths: 0, assists: 0 }
    }
    champStats[m.championId].total++
    if (m.win) champStats[m.championId].wins++
    champStats[m.championId].kills   += m.kills
    champStats[m.championId].deaths  += m.deaths
    champStats[m.championId].assists += m.assists
  })
  const allMostChamps = Object.values(champStats).sort((a, b) => b.total - a.total)
  const mostChamps = allMostChamps.slice(0, 6)

  const teammateStats: Record<string, { gameName: string; tagLine: string; puuid: string; total: number; wins: number }> = {}
  matches.forEach(m => {
    m.teammates.forEach(t => {
      if (!t.gameName) return
      if (!teammateStats[t.puuid]) {
        teammateStats[t.puuid] = { gameName: t.gameName, tagLine: t.tagLine, puuid: t.puuid, total: 0, wins: 0 }
      }
      teammateStats[t.puuid].total++
      if (t.win) teammateStats[t.puuid].wins++
    })
  })
  const topTeammates = Object.values(teammateStats).sort((a, b) => b.total - a.total).slice(0, 5)

  // 팀원 프로필 아이콘 백그라운드 로드
  useEffect(() => {
    if (topTeammates.length === 0) return
    let cancelled = false
    Promise.all(
      topTeammates.map(t =>
        getSummonerByPuuid(t.puuid)
          .then(s => ({ puuid: t.puuid, iconId: s.profileIconId as number }))
          .catch(() => null)
      )
    ).then(results => {
      if (cancelled) return
      const map: Record<string, number> = {}
      results.forEach(r => { if (r) map[r.puuid] = r.iconId })
      setTeammateIcons(map)
    })
    return () => { cancelled = true }
  }, [topTeammates.map(t => t.puuid).join(',')])

  const soloRank = rankInfo.find(r => r.queueType === 'RANKED_SOLO_5x5')
  const flexRank = rankInfo.find(r => r.queueType === 'RANKED_FLEX_SR')

  const currentYear = String(new Date().getFullYear())
  const displayHistory = [
    ...(soloRank ? [{ season: currentYear, tier: soloRank.tier, rank: soloRank.rank, leaguePoints: soloRank.leaguePoints, wins: soloRank.wins, losses: soloRank.losses }] : []),
    ...rankHistory.filter(h => h.season !== currentYear),
  ].slice(0, 5)

  if (loading) {
    return (
      <div className="sp-page">
        <div className="sp-loading">
          <div className="sp-spinner" />
          <p>소환사 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="sp-page">
        <div className="sp-error">
          <span className="sp-error-icon">⚠</span>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="sp-page">
      {/* ── 상단 프로필 헤더 ── */}
      <div className="sp-header">
        <div className="sp-header-inner">
          {/* 프로필 아이콘 + 이름 */}
          <div className="sp-profile">
            <div className="sp-avatar-wrap">
              {summoner?.profileIconId ? (
                <img
                  src={profileIconUrl(ddVersion, summoner.profileIconId)}
                  alt="프로필"
                  className="sp-avatar-img"
                />
              ) : (
                <div className="sp-avatar-placeholder">{gameName.slice(0, 2).toUpperCase()}</div>
              )}
              <div className="sp-level-badge">{summoner?.summonerLevel ?? '-'}</div>
            </div>
            <div className="sp-profile-info">
              {displayHistory.length > 0 && (
                <div className="sp-season-history">
                  {displayHistory.map(h => (
                    <div key={h.season} className="sp-season-badge" style={{ color: TIER_COLORS[h.tier] ?? '#9096b8', borderColor: (TIER_COLORS[h.tier] ?? '#9096b8') + '55', background: (TIER_COLORS[h.tier] ?? '#9096b8') + '18' }}>
                      <span className="sp-season-year">{h.season}</span>
                      <span className="sp-season-tier">{h.tier.charAt(0) + h.tier.slice(1).toLowerCase()} {h.rank}</span>
                    </div>
                  ))}
                </div>
              )}
              <h1 className="sp-name">{account?.gameName ?? gameName}</h1>
              <div className="sp-tag">#{account?.tagLine ?? tagLine}</div>
              <div className="sp-actions">
                <button
                  className={`sp-btn-refresh ${cooldown > 0 ? 'disabled' : ''}`}
                  disabled={cooldown > 0}
                  onClick={() => { setRefresh(r => r + 1); setCooldown(50) }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="13" height="13">
                    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  {cooldown > 0 ? `${cooldown}초` : '전적 갱신'}
                </button>
                <button
                  className={`sp-btn-ingame ${liveLoading ? 'loading' : ''} ${showLiveGame ? 'active' : ''}`}
                  onClick={handleLiveGame}
                  disabled={liveLoading}
                >
                  {liveLoading ? '확인 중...' : showLiveGame ? '🔴 인게임' : '인게임'}
                </button>
                {lastRefreshedAt && (
                  <span className="sp-last-refresh">최근갱신: {formatRefreshedAt(lastRefreshedAt)}</span>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── 본문 ── */}
      <div className="sp-body">
        {/* 왼쪽 광고 */}
        <div className="sp-ad-side sp-ad-left">
          <div className="sp-ad-box">AD</div>
        </div>

        <div className="sp-body-inner">

          {/* ── 왼쪽 사이드바 ── */}
          <div className="sp-sidebar">

            {/* 랭크 카드 */}
            <div className="sp-ranks">
              {[
                soloRank ? { ...soloRank, label: '솔로랭크' } : null,
                flexRank ? { ...flexRank, label: '자유랭크' } : null,
              ].map((r, idx) => r ? (
                <div key={r.queueType} className="sp-rank-card" style={{ background: TIER_BG[r.tier] ?? '#7c5af61a', borderColor: (TIER_COLORS[r.tier] ?? '#7c5af6') + '44' }}>
                  <div className="sp-rank-emblem">
                    <img src={tierEmblemUrl(r.tier)} alt={r.tier} className="sp-rank-emblem-img" />
                  </div>
                  <div className="sp-rank-info">
                    <div className="sp-rank-queue">{r.label}</div>
                    <div className="sp-rank-tier" style={{ color: TIER_COLORS[r.tier] ?? '#6b7280' }}>{r.tier} {r.rank}</div>
                    <div className="sp-rank-lp">{r.leaguePoints} LP</div>
                    <div className="sp-rank-record">
                      <span className="sp-win">{r.wins}승</span>
                      <span className="sp-lose">{r.losses}패</span>
                      <span className="sp-wr">{Math.round(r.wins / (r.wins + r.losses) * 100)}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={idx} className="sp-rank-card sp-rank-unranked">
                  <div className="sp-rank-emblem sp-rank-emblem-none">?</div>
                  <div className="sp-rank-info">
                    <div className="sp-rank-queue">{idx === 0 ? '솔로랭크' : '자유랭크'}</div>
                    <div className="sp-rank-tier" style={{ color: '#9096b8' }}>UNRANKED</div>
                    <div className="sp-rank-lp">-</div>
                  </div>
                </div>
              ))}
            </div>

            {/* 요약 카드 */}
            <div className="sp-card">
              <div className="sp-card-title">최근 {matches.length}게임</div>
              <div className="sp-summary">
                <div className="sp-donut">
                  <svg viewBox="0 0 80 80" width="80" height="80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border-color)" strokeWidth="9" />
                    <circle cx="40" cy="40" r="32" fill="none"
                      stroke={winRate >= 60 ? '#3b82f6' : winRate >= 50 ? '#7c5af6' : '#ef4444'}
                      strokeWidth="9"
                      strokeDasharray={`${(winRate / 100) * 201} 201`}
                      strokeLinecap="round"
                      transform="rotate(-90 40 40)" />
                  </svg>
                  <div className="sp-donut-text">
                    <span className="sp-donut-rate">{winRate}%</span>
                  </div>
                </div>
                <div className="sp-summary-info">
                  <div className="sp-summary-wl">
                    <span className="sp-win">{winCount}승</span>
                    <span className="sp-lose">{totalCount - winCount}패</span>
                  </div>
                  <div className="sp-summary-kda">
                    <span className="sp-kda-nums">{avgKills} / <span style={{ color: '#ef4444' }}>{avgDeaths}</span> / {avgAssists}</span>
                  </div>
                  <div className="sp-summary-ratio">
                    <span className="sp-kda-val">{avgKda}</span>
                    <span className="sp-kda-label"> 평점</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 모스트 챔피언 */}
            <div className="sp-card">
              <div className="sp-card-title-row">
                <span className="sp-card-title">
                  모스트 챔피언
                  {loadingMore && <span className="sp-loading-more"> ({allMatches.length}/{totalMatchCount})</span>}
                </span>
                <div className="sp-most-filter-tabs">
                  {(['전체', '솔로랭크', '자유랭크'] as const).map(f => (
                    <button key={f} className={`sp-most-filter-btn ${mostFilter === f ? 'active' : ''}`} onClick={() => setMostFilter(f)}>{f}</button>
                  ))}
                </div>
              </div>
              {mostChamps.length === 0 ? (
                <div className="sp-most-empty">해당 모드의 전적이 없습니다.</div>
              ) : (
                <>
                  <div className="sp-most-list">
                    {mostChamps.map((c) => {
                      const wr = Math.round((c.wins / c.total) * 100)
                      const kda = c.deaths === 0
                        ? (c.kills + c.assists).toFixed(2)
                        : ((c.kills + c.assists) / c.deaths).toFixed(2)
                      return (
                        <div key={c.id} className="sp-most-row">
                          <img src={champIconUrl(ddVersion, c.id)} alt={c.name} className="sp-most-icon" />
                          <div className="sp-most-info">
                            <div className="sp-most-name">{c.name}</div>
                            <div className="sp-most-bar-wrap">
                              <div className="sp-most-bar" style={{ width: `${wr}%`, background: wr >= 60 ? '#3b82f6' : wr >= 50 ? '#7c5af6' : '#ef4444' }} />
                            </div>
                            <div className="sp-most-meta">
                              <span style={{ color: wr >= 60 ? '#3b82f6' : wr >= 50 ? '#7c5af6' : '#ef4444', fontWeight: 700 }}>{wr}%</span>
                              <span className="sp-most-games">{c.total}게임</span>
                            </div>
                          </div>
                          <div className="sp-most-kda-col">
                            <span className="sp-most-kda-val">{kda}</span>
                            <span className="sp-most-kda-lbl">평점</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {allMostChamps.length > 6 && (
                    <button
                      className="sp-more-btn"
                      onClick={() => navigate(`/summoner/${encodeURIComponent(name!)}/champions`, { state: { allMostChamps, ddVersion, mostFilter } })}
                    >
                      더보기 ({allMostChamps.length}개)
                    </button>
                  )}
                </>
              )}
            </div>

            {/* 같이한 유저 */}
            {topTeammates.length > 0 && (
              <div className="sp-card">
                <div className="sp-card-title">같이한 유저</div>
                <div className="sp-most-list">
                  {topTeammates.map(t => {
                    const wr = Math.round((t.wins / t.total) * 100)
                    return (
                      <div
                        key={t.puuid}
                        className="sp-teammate-row"
                        onClick={() => window.location.href = `/summoner/${encodeURIComponent(`${t.gameName}#${t.tagLine}`)}`}
                      >
                        {teammateIcons[t.puuid] != null
                          ? <img src={profileIconUrl(ddVersion, teammateIcons[t.puuid])} alt={t.gameName} className="sp-teammate-icon" />
                          : <div className="sp-teammate-avatar">{t.gameName.slice(0, 1).toUpperCase()}</div>
                        }
                        <div className="sp-most-info">
                          <div className="sp-most-name">
                            {t.gameName}
                            <span className="sp-teammate-tag">#{t.tagLine}</span>
                          </div>
                          <div className="sp-most-meta">
                            <span className="sp-win">{t.wins}승</span>
                            <span className="sp-lose" style={{ marginLeft: 4 }}>{t.total - t.wins}패</span>
                            <span className="sp-most-games"> {t.total}게임</span>
                          </div>
                        </div>
                        <div className="sp-most-kda-col">
                          <span className="sp-most-kda-val" style={{ color: wr >= 50 ? '#3b82f6' : '#ef4444' }}>{wr}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── 오른쪽 매치 목록 ── */}
          <div className="sp-matches">

            {/* ── 인게임 패널 ── */}
            {liveError && !showLiveGame && (
              <div className="sp-ingame-error">{liveError}</div>
            )}
            {showLiveGame && liveGame && (() => {
              const blueTeam = liveGame.participants.filter((p: any) => p.teamId === 100)
              const redTeam  = liveGame.participants.filter((p: any) => p.teamId === 200)
              const mins = Math.floor(liveTimer / 60)
              const secs = String(liveTimer % 60).padStart(2, '0')
              const queueName = QUEUE_LABELS[liveGame.gameQueueConfigId] ?? '게임 중'
              const TIER_BADGE_COLORS: Record<string, string> = {
                IRON: '#6b7280', BRONZE: '#b45309', SILVER: '#64748b', GOLD: '#d97706',
                PLATINUM: '#0891b2', EMERALD: '#059669', DIAMOND: '#2563eb', MASTER: '#7c3aed',
                GRANDMASTER: '#dc2626', CHALLENGER: '#eab308',
              }
              const renderPlayer = (p: any) => {
                const champInfo = p.championId ? { id: String(p.championId) } : null
                const soloRankInfo = liveRanks[p.puuid]?.find((r: any) => r.queueType === 'RANKED_SOLO_5x5')
                const tierColor = soloRankInfo ? (TIER_BADGE_COLORS[soloRankInfo.tier] ?? '#9096b8') : '#9096b8'
                const wins = soloRankInfo?.wins ?? 0
                const losses = soloRankInfo?.losses ?? 0
                const total = wins + losses
                const wr = total > 0 ? Math.round((wins / total) * 100) : null
                const isMe = p.puuid === account?.puuid
                const spell1 = spellMap[String(p.spell1Id)]
                const spell2 = spellMap[String(p.spell2Id)]
                return (
                  <div key={p.puuid} className={`sp-ig-row ${isMe ? 'sp-ig-row-me' : ''}`}>
                    <div className="sp-ig-champ">
                      {ddVersion && champInfo && (
                        <img
                          src={champIconUrl(ddVersion, champInfo.id)}
                          alt=""
                          className="sp-ig-champ-icon"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      )}
                    </div>
                    <div className="sp-ig-name" style={{ fontWeight: isMe ? 700 : 400 }}>
                      {p.riotId ?? p.summonerName ?? '알 수 없음'}
                    </div>
                    <div className="sp-ig-tier">
                      {soloRankInfo ? (
                        <span className="sp-ig-tier-badge" style={{ color: tierColor, borderColor: tierColor + '55', background: tierColor + '18' }}>
                          {soloRankInfo.tier.charAt(0) + soloRankInfo.tier.slice(1).toLowerCase()} {soloRankInfo.rank} {soloRankInfo.leaguePoints}LP
                        </span>
                      ) : (
                        <span className="sp-ig-tier-badge" style={{ color: '#9096b8', borderColor: '#9096b855', background: '#9096b818' }}>Unranked</span>
                      )}
                    </div>
                    <div className="sp-ig-winrate">
                      {wr !== null ? (
                        <span style={{ color: wr >= 60 ? '#3b82f6' : wr >= 50 ? '#7c5af6' : '#ef4444', fontWeight: 600 }}>
                          {wr}% <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({total})</span>
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                    </div>
                    <div className="sp-ig-spells">
                      {ddVersion && spell1 && <img src={spellIconUrl(ddVersion, spell1.id)} alt="" className="sp-ig-spell-icon" />}
                      {ddVersion && spell2 && <img src={spellIconUrl(ddVersion, spell2.id)} alt="" className="sp-ig-spell-icon" />}
                    </div>
                  </div>
                )
              }
              return (
                <div className="sp-ingame">
                  <div className="sp-ig-topbar">
                    <span className="sp-ig-live-dot" />
                    <span className="sp-ig-live-label">LIVE</span>
                    <span className="sp-ig-timer">{mins}:{secs}</span>
                    <span className="sp-ig-queue">{queueName}</span>
                    <button className="sp-ig-close" onClick={() => setShowLiveGame(false)}>✕</button>
                  </div>
                  <div className="sp-ig-col-header">
                    <span className="sp-ig-col-champ">챔피언</span>
                    <span className="sp-ig-col-name">소환사명</span>
                    <span className="sp-ig-col-tier">티어/LP</span>
                    <span className="sp-ig-col-wr">승률</span>
                    <span className="sp-ig-col-spells">스펠</span>
                  </div>
                  <div className="sp-ig-team sp-ig-team-blue">
                    <div className="sp-ig-team-label">블루팀</div>
                    {blueTeam.map(renderPlayer)}
                  </div>
                  <div className="sp-ig-team sp-ig-team-red">
                    <div className="sp-ig-team-label">레드팀</div>
                    {redTeam.map(renderPlayer)}
                  </div>
                </div>
              )
            })()}

            {/* 필터 탭 */}
            <div className="sp-filters">
              {['전체', '솔로랭크', '자유랭크'].map(f => (
                <button
                  key={f}
                  className={`sp-filter-btn ${activeFilter === f ? 'active' : ''}`}
                  onClick={() => setActiveFilter(f)}
                >{f}</button>
              ))}
            </div>

            {filteredMatches.length === 0 ? (
              <div className="sp-no-matches">해당 게임 모드의 전적이 없습니다.</div>
            ) : (
              filteredMatches.map(match => {
                const kda = match.deaths === 0
                  ? ((match.kills + match.assists)).toFixed(2)
                  : ((match.kills + match.assists) / match.deaths).toFixed(2)
                const isExpanded = expandedMatch === match.matchId
                const blueTeam = match.allParticipants.filter(p => p.teamId === 100)
                const redTeam  = match.allParticipants.filter(p => p.teamId === 200)
                const myTeamId = match.allParticipants.find(p => p.puuid === account?.puuid)?.teamId ?? 100

                return (
                  <div key={match.matchId} className={`sp-match-card ${match.win ? 'win' : 'lose'}`}>
                    {/* ── 기본 행 ── */}
                    <div className="mc-main-row">

                      {/* 왼쪽: 모드·결과·시간 */}
                      <div className="mc-left">
                        <div className="mc-mode">{match.queueLabel}</div>
                        <div className="mc-ago">{timeAgo(match.gameStartTimestamp)}</div>
                        <div className="mc-sep-line" />
                        <div className={`mc-result ${match.win ? 'win' : 'lose'}`}>{match.win ? '승리' : '패배'}</div>
                        <div className="mc-duration">{formatDuration(match.duration)}</div>
                      </div>

                      {/* 챔피언 + 스펠/룬 */}
                      <div className="mc-champ-block">
                        <div className="mc-champ-wrap">
                          {ddVersion && <img src={champIconUrl(ddVersion, match.championId)} alt={match.championName} className="mc-champ-img" />}
                          <span className="mc-champ-level">{match.champLevel}</span>
                        </div>
                        <div className="mc-spells">
                          {ddVersion && spellMap[match.spell1Id] &&
                            <img src={spellIconUrl(ddVersion, spellMap[match.spell1Id].id)} alt="" className="mc-spell-img" />}
                          {ddVersion && spellMap[match.spell2Id] &&
                            <img src={spellIconUrl(ddVersion, spellMap[match.spell2Id].id)} alt="" className="mc-spell-img" />}
                          {runeMap[match.primaryRuneId] &&
                            <img src={runeIconUrl(runeMap[match.primaryRuneId].icon)} alt="" className="mc-rune-img" />}
                          {runeMap[match.subStyleId] &&
                            <img src={runeIconUrl(runeMap[match.subStyleId].icon)} alt="" className="mc-rune-img mc-rune-sub" />}
                        </div>
                      </div>

                      {/* KDA */}
                      <div className="mc-kda">
                        <div className="mc-kda-numbers">
                          <span className="mc-k">{match.kills}</span>
                          <span className="mc-slash"> / </span>
                          <span className="mc-d">{match.deaths}</span>
                          <span className="mc-slash"> / </span>
                          <span className="mc-a">{match.assists}</span>
                        </div>
                        <div className="mc-kda-ratio">{kda} KDA</div>
                        <div className="mc-cs">CS {match.cs} · 시야 {match.visionScore}</div>
                      </div>

                      {/* 아이템 (6개 + 장신구 1개 가로 한 줄) */}
                      <div className="mc-items">
                        <div className="mc-items-row">
                          {match.items.slice(0, 6).map((id, idx) =>
                            id > 0 && ddVersion
                              ? <img key={idx} src={itemIconUrl(ddVersion, id)} alt="아이템" className="mc-item-img" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                              : <div key={idx} className="mc-item-empty" />
                          )}
                          {match.items[6] > 0 && ddVersion
                            ? <img src={itemIconUrl(ddVersion, match.items[6])} alt="장신구" className="mc-item-img mc-trinket-img" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                            : <div className="mc-item-empty mc-trinket-empty" />
                          }
                        </div>
                        <div className="mc-champ-name-label">{match.championName}</div>
                        <button
                          className={`mc-ai-btn ${aiFeedbackLoading[match.matchId] ? 'loading' : ''} ${aiFeedback[match.matchId] ? 'done' : ''}`}
                          onClick={e => {
                            e.stopPropagation()
                            if (aiFeedback[match.matchId]) {
                              setAiFeedbackOpen(prev => ({ ...prev, [match.matchId]: !prev[match.matchId] }))
                            } else {
                              setAiFeedbackOpen(prev => ({ ...prev, [match.matchId]: true }))
                              fetchAiFeedback(match)
                            }
                          }}
                        >
                          {aiFeedbackLoading[match.matchId] ? '분석 중...' : aiFeedback[match.matchId] ? (aiFeedbackOpen[match.matchId] ? '✓ AI 분석 완료' : '🤖 AI 분석 보기') : '🤖 AI 분석'}
                        </button>
                      </div>

                      {/* 참가자 */}
                      <div className="mc-participants">
                        {[blueTeam, redTeam].map((team, ti) => (
                          <div key={ti} className="mc-team-col">
                            {team.slice(0, 5).map(p => {
                              const celeb = p.gameName && p.tagLine ? findCelebrityByAccount(p.gameName, p.tagLine) : null
                              const isMe  = p.puuid === account?.puuid
                              const isEnemy = ti === 1 && p.teamId !== myTeamId
                              return (
                                <div
                                  key={p.puuid}
                                  className={`mc-part${p.gameName && p.tagLine ? ' mc-part-clickable' : ''}`}
                                  onClick={() => p.gameName && p.tagLine && navigate(`/summoner/${encodeURIComponent(`${p.gameName}#${p.tagLine}`)}`)}
                                >
                                  {celeb && (
                                    <span className={`mc-celeb-badge ${celeb.type === 'pro' ? 'pro' : 'streamer'}`}>
                                      {celeb.type === 'pro' ? 'P' : 'S'}
                                    </span>
                                  )}
                                  {ddVersion && <img src={champIconUrl(ddVersion, p.championId)} alt="" className={`mc-part-icon${isMe ? ' mc-part-me' : isEnemy ? ' mc-part-enemy' : ''}`} />}
                                  <span className={`mc-part-name${isMe ? ' mc-part-name-me' : ''}`}>{p.gameName || '?'}</span>
                                </div>
                              )
                            })}
                          </div>
                        ))}
                      </div>

                      {/* 확장 토글 버튼 */}
                      <button
                        className={`mc-expand-btn ${isExpanded ? 'open' : ''}`}
                        onClick={() => setExpandedMatch(isExpanded ? null : match.matchId)}
                        title="상세 보기"
                      >▼</button>
                    </div>

                    {/* ── AI 피드백 패널 ── */}
                    {(aiFeedbackLoading[match.matchId] || ((aiFeedback[match.matchId] || aiFeedbackError[match.matchId]) && aiFeedbackOpen[match.matchId])) && (
                      <div className="mc-ai-panel">
                        {aiFeedbackLoading[match.matchId] ? (
                          <div className="mc-ai-loading">
                            <div className="mc-ai-spinner" />
                            <span>AI가 게임을 분석하고 있습니다...</span>
                          </div>
                        ) : aiFeedbackError[match.matchId] ? (
                          <div className="mc-ai-content">
                            <div className="mc-ai-header">
                              <span className="mc-ai-icon">⚠️</span>
                              <span className="mc-ai-title">AI 분석 실패</span>
                              <button className="mc-ai-close" onClick={e => { e.stopPropagation(); setAiFeedbackOpen(prev => ({ ...prev, [match.matchId]: false })) }}>✕</button>
                            </div>
                            <div className="mc-ai-text" style={{ color: 'var(--lose-color)' }}>{aiFeedbackError[match.matchId]}</div>
                          </div>
                        ) : (
                          <div className="mc-ai-content">
                            <div className="mc-ai-header">
                              <span className="mc-ai-icon">🤖</span>
                              <span className="mc-ai-title">AI 게임 분석</span>
                              <span className="mc-ai-badge">AI 분석</span>
                              <button className="mc-ai-close" onClick={e => { e.stopPropagation(); setAiFeedbackOpen(prev => ({ ...prev, [match.matchId]: false })) }}>✕</button>
                            </div>
                            <div className="mc-ai-text">{aiFeedback[match.matchId]}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── 확장 상세 뷰 ── */}
                    {isExpanded && match.allParticipants.length > 0 && (() => {
                      const teams = [
                        { team: blueTeam, teamId: 100 },
                        { team: redTeam,  teamId: 200 },
                      ]
                      return (
                        <div className="mc-detail">
                          {teams.map(({ team, teamId: tid }) => {
                            const isWinTeam = team[0]?.win ?? false
                            const isMyTeam  = tid === myTeamId
                            const maxDmg     = Math.max(...team.map(p => p.totalDamage), 1)
                            const avgCs      = team.reduce((s, p) => s + p.cs, 0) / Math.max(team.length, 1)
                            const avgAssists = team.reduce((s, p) => s + p.assists, 0) / Math.max(team.length, 1)

                            const getStyle = (p: typeof team[0], roleIdx: number): [{ label: string; cls: string }, { label: string; cls: string } | null] => {
                              const dur          = (match.duration / 60) || 1
                              const teamTotalDmg = team.reduce((s, q) => s + q.totalDamage, 0) || 1
                              const teamKills    = team.reduce((s, q) => s + q.kills, 0) || 1
                              const kda      = p.deaths === 0 ? p.kills + p.assists : (p.kills + p.assists) / p.deaths
                              const dmgShare = p.totalDamage / teamTotalDmg
                              const kp       = (p.kills + p.assists) / teamKills
                              const cpm      = p.cs / dur

                              // KDA·딜 모두 준수하면 흔들림 제외
                              const skipShaky = kda >= 3 && dmgShare >= 0.28

                              // ── 라인 태그 (우선순위: 1.흔들림·리스크 → 2.캐리·폭딜 → 3.일반 → 4.안정적) ──
                              let lineTag: { label: string; cls: string }

                              if (roleIdx === 0) {
                                // 탑: 흔들림
                                if      (!skipShaky && (p.deaths >= 8 || (p.deaths >= 6 && dmgShare < 0.15)))  lineTag = { label: '변동성 있음', cls: 'troll' }
                                // 탑: 캐리·폭딜
                                else if (p.win && kda >= 3 && dmgShare >= 0.25)                lineTag = { label: '캐리',        cls: 'carry' }
                                else if (dmgShare >= 0.28 && kda >= 2.5)                       lineTag = { label: '딜 압박',     cls: 'carry' }
                                // 탑: 일반
                                else if (p.deaths <= 3 && p.assists >= avgAssists)             lineTag = { label: '철벽',        cls: 'stable' }
                                else if (cpm >= 6.5)                                            lineTag = { label: '사이드 압박', cls: 'strong' }
                                else if (kp >= 0.65)                                            lineTag = { label: '한타 강세',   cls: 'jg-gank' }
                                else if (p.cs >= avgCs * 1.15)                                 lineTag = { label: '라인전 우세', cls: 'strong' }
                                else if (cpm >= 6.0)                                            lineTag = { label: '성장 중',     cls: 'jg-ks' }
                                else                                                            lineTag = { label: '안정적',      cls: 'stable' }
                              } else if (roleIdx === 1) {
                                // 정글: 흔들림
                                if      (!skipShaky && p.deaths >= 7 && cpm < 4.5)             lineTag = { label: '변동성 있음', cls: 'troll' }
                                // 정글: 캐리·영향력
                                else if (p.win && kp >= 0.6 && dmgShare >= 0.2)               lineTag = { label: '캐리 영향력',  cls: 'carry' }
                                // 정글: 일반
                                else if (p.assists >= 8 && kp >= 0.6)                          lineTag = { label: '팀 지원',     cls: 'jg-gank' }
                                else if (kp >= 0.65)                                            lineTag = { label: '갱킹 활발',   cls: 'jg-gank' }
                                else if (p.win && kda >= 3.0)                                  lineTag = { label: '흐름 좋음',   cls: 'jg-impact' }
                                else if (p.deaths <= 5 && cpm >= 5.0)                          lineTag = { label: '운영 중심',   cls: 'stable' }
                                else if (cpm >= 4.5)                                            lineTag = { label: '성장 중',     cls: 'jg-ks' }
                                else if (kp >= 0.5)                                             lineTag = { label: '갱킹 활발',   cls: 'jg-gank' }
                                else                                                            lineTag = { label: '안정적',      cls: 'stable' }
                              } else if (roleIdx === 2) {
                                // 미드: 흔들림
                                if      (!skipShaky && (p.deaths >= 7 || (p.deaths >= 6 && dmgShare < 0.15)))  lineTag = { label: '변동성 있음', cls: 'troll' }
                                // 미드: 캐리·폭딜
                                else if (p.win && dmgShare >= 0.28 && kda >= 3.5)              lineTag = { label: '캐리',        cls: 'carry' }
                                else if (dmgShare >= 0.3)                                       lineTag = { label: '폭딜',        cls: 'carry' }
                                // 미드: 일반
                                else if (kp >= 0.7)                                             lineTag = { label: '플레이메이킹', cls: 'jg-gank' }
                                else if (kp >= 0.65)                                            lineTag = { label: '로밍 활발',   cls: 'jg-gank' }
                                else if (p.deaths <= 5 && cpm >= 6.5)                          lineTag = { label: '운영 플레이', cls: 'jg-ks' }
                                else if (p.cs >= avgCs * 1.1)                                  lineTag = { label: '라인킹',      cls: 'strong' }
                                else if (kda >= 2.5 && dmgShare >= 0.22 && p.deaths <= 5)      lineTag = { label: '균형 잡힘',   cls: 'stable' }
                                else                                                            lineTag = { label: '안정적',      cls: 'stable' }
                              } else if (roleIdx === 3) {
                                // 원딜: 흔들림
                                if      (!skipShaky && (p.deaths >= 6 || (p.deaths >= 5 && dmgShare < 0.15)))  lineTag = { label: '변동성 있음', cls: 'troll' }
                                // 원딜: 캐리·폭딜
                                else if (p.win && dmgShare >= 0.3 && kda >= 3)                 lineTag = { label: '캐리',        cls: 'carry' }
                                else if (dmgShare >= 0.32)                                      lineTag = { label: '폭딜',        cls: 'carry' }
                                // 원딜: 일반
                                else if (p.deaths <= 3)                                         lineTag = { label: '생존력 좋음', cls: 'strong' }
                                else if (cpm >= 7.0)                                            lineTag = { label: '성장 중',     cls: 'jg-ks' }
                                else if (p.cs >= avgCs * 1.1)                                  lineTag = { label: '파밍형',      cls: 'jg-ks' }
                                else if (p.deaths <= 4 && kda >= 2.8)                          lineTag = { label: '딜 집중',     cls: 'carry' }
                                else                                                            lineTag = { label: '안정적',      cls: 'stable' }
                              } else {
                                // 서폿: 흔들림
                                if      (!skipShaky && p.deaths >= 8 && kp < 0.4)              lineTag = { label: '변동성 있음', cls: 'troll' }
                                // 서폿: 최고 기여
                                else if (p.assists >= 10 && kp >= 0.65)                        lineTag = { label: '팀 케어',     cls: 'jg-gank' }
                                // 서폿: 일반
                                else if (kp >= 0.7)                                             lineTag = { label: '플레이메이킹', cls: 'jg-gank' }
                                else if (kp >= 0.65)                                            lineTag = { label: '이니시 주도', cls: 'jg-gank' }
                                else if (p.assists >= 8 && p.deaths <= 6)                      lineTag = { label: '팀 지원',     cls: 'strong' }
                                else if (p.assists >= 6 && kp >= 0.5)                          lineTag = { label: '로밍 활발',   cls: 'jg-gank' }
                                else                                                            lineTag = { label: '안정적',      cls: 'stable' }
                              }

                              // ── 공통 태그 ──
                              let commonTag: { label: string; cls: string } | null = null
                              // 억울함: 패배인데 딜·KDA·킬관여 모두 준수한 경우
                              if (!p.win && dmgShare >= 0.28 && kda >= 3 && p.deaths <= 7 && kp >= 0.6)
                                                                                               commonTag = { label: '높은 영향력', cls: 'unfair' }
                              else if (p.deaths >= 7 && dmgShare >= 0.28)                     commonTag = { label: '하이리스크', cls: 'weak' }
                              else if (p.kills >= 10 || dmgShare >= 0.35)                     commonTag = { label: '한방 있음', cls: 'carry' }

                              return [lineTag!, commonTag]
                            }
                            return (
                              <div key={tid} className={`mc-detail-team ${isWinTeam ? 'win' : 'lose'}`}>
                                {/* 팀 헤더 */}
                                <div className={`mc-dt-header ${isWinTeam ? 'win' : 'lose'}`}>
                                  <div className="mc-dt-header-left">
                                    <span className="mc-dt-result">{isWinTeam ? '승리' : '패배'}</span>
                                    {isMyTeam && <span className="mc-dt-me-badge">내 팀</span>}
                                  </div>
                                  <span className="mc-dt-header-col">플레이 유형</span>
                                  <span className="mc-dt-header-col">KDA</span>
                                  <span className="mc-dt-header-col">피해량</span>
                                  <span className="mc-dt-header-col">CS</span>
                                  <span className="mc-dt-header-col">아이템</span>
                                </div>
                                {/* 플레이어 행 */}
                                {team.map((p, roleIdx) => {
                                  const pkda   = p.deaths === 0 ? (p.kills + p.assists).toFixed(2) : ((p.kills + p.assists) / p.deaths).toFixed(2)
                                  const [lineStyle, commonStyle] = getStyle(p, roleIdx)
                                  const spell1  = spellMap[p.spell1Id]
                                  const spell2  = spellMap[p.spell2Id]
                                  const pRune   = runeMap[p.primaryRuneId]
                                  const subSty  = runeMap[p.subStyleId]
                                  const isMe    = p.puuid === account?.puuid
                                  const dmgPct  = Math.round((p.totalDamage / maxDmg) * 100)
                                  return (
                                    <div key={p.puuid} className={`mc-dr-row ${isMe ? 'me' : ''} ${isWinTeam ? 'win' : 'lose'}`}>
                                      {/* 챔피언 + 스펠/룬 */}
                                      <div className="mc-dr-champ-cell">
                                        <div className="mc-dr-champ-wrap">
                                          {ddVersion && <img src={champIconUrl(ddVersion, p.championId)} alt="" className="mc-dr-champ-img" />}
                                        </div>
                                        <div className="mc-dr-spells">
                                          {spell1 && ddVersion && <img src={spellIconUrl(ddVersion, spell1.id)} alt="" className="mc-dr-spell" />}
                                          {spell2 && ddVersion && <img src={spellIconUrl(ddVersion, spell2.id)} alt="" className="mc-dr-spell" />}
                                          {pRune  && <img src={runeIconUrl(pRune.icon)} alt="" className="mc-dr-rune" />}
                                          {subSty && <img src={runeIconUrl(subSty.icon)} alt="" className="mc-dr-rune mc-dr-rune-sub" />}
                                        </div>
                                      </div>
                                      {/* 닉네임 */}
                                      <div className="mc-dr-name-cell">
                                        <span
                                          className={`mc-dr-nick ${isMe ? 'me' : ''}`}
                                          onClick={() => p.gameName && navigate(`/summoner/${encodeURIComponent(`${p.gameName}#${p.tagLine}`)}`)}
                                        >{p.gameName || '?'}</span>
                                        {p.tagLine && <span className="mc-dr-tag">#{p.tagLine}</span>}
                                      </div>
                                      {/* 스타일 유형 */}
                                      <div className="mc-dr-style-cell">
                                        <span className={`mc-dr-style-badge ${lineStyle.cls}`}>{lineStyle.label}</span>
                                        {commonStyle && <span className={`mc-dr-style-badge ${commonStyle.cls}`}>{commonStyle.label}</span>}
                                      </div>
                                      {/* KDA */}
                                      <div className="mc-dr-kda-cell">
                                        <span className="mc-dr-kda-nums">
                                          <span className="mc-dr-k">{p.kills}</span>
                                          <span className="mc-dr-slash"> / </span>
                                          <span className="mc-dr-d">{p.deaths}</span>
                                          <span className="mc-dr-slash"> / </span>
                                          <span className="mc-dr-a">{p.assists}</span>
                                        </span>
                                        <span className="mc-dr-kda-ratio">{pkda} KDA</span>
                                      </div>
                                      {/* 피해량 + 바 */}
                                      <div className="mc-dr-dmg-cell">
                                        <span className="mc-dr-dmg-num">{p.totalDamage.toLocaleString()}</span>
                                        <div className="mc-dr-dmg-bar-wrap">
                                          <div className="mc-dr-dmg-bar" style={{ width: `${dmgPct}%`, background: isWinTeam ? '#3b82f6' : '#ef4444' }} />
                                        </div>
                                      </div>
                                      {/* CS */}
                                      <div className="mc-dr-cs-cell">
                                        <span>{p.cs}</span>
                                        <span className="mc-dr-cs-per-min">({(p.cs / (match.duration / 60)).toFixed(1)}/분)</span>
                                      </div>
                                      {/* 아이템 */}
                                      <div className="mc-dr-items-cell">
                                        {p.items.slice(0, 6).map((id, idx) =>
                                          id > 0 && ddVersion
                                            ? <img key={idx} src={itemIconUrl(ddVersion, id)} alt="" className="mc-dr-item" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                            : <div key={idx} className="mc-dr-item-empty" />
                                        )}
                                        {p.items[6] > 0 && ddVersion
                                          ? <img src={itemIconUrl(ddVersion, p.items[6])} alt="" className="mc-dr-item mc-dr-trinket" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                          : <div className="mc-dr-item-empty mc-dr-trinket" />}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()}
                  </div>
                )
              })
            )}
          {/* 더보기 버튼 */}
          {matches.length < allMatchIds.length && (
            <button
              className={`sp-load-more-btn ${loadingMoreVisible ? 'loading' : ''}`}
              onClick={loadMoreMatches}
              disabled={loadingMoreVisible}
            >
              {loadingMoreVisible
                ? '불러오는 중...'
                : `더보기 (${matches.length} / ${allMatchIds.length}경기)`}
            </button>
          )}
          </div>
        </div>

        {/* 오른쪽 광고 */}
        <div className="sp-ad-side sp-ad-right">
          <div className="sp-ad-box">AD</div>
        </div>
      </div>
    </div>
  )
}
