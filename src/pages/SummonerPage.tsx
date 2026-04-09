import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getAccount, getSummonerByPuuid, getRankedInfo,
  getMatchIds, getAllMatchIds, getMatch, getDDVersion, getChampMap,
  getSpellMap, getRuneMap,
  champIconUrl, itemIconUrl, profileIconUrl, spellIconUrl, runeIconUrl, QUEUE_LABELS,
} from '../utils/riotApi'
import { saveSummoners, saveRankHistory, getRankHistory } from '../utils/supabase'
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
                        <div className="sp-teammate-avatar">{t.gameName.slice(0, 1).toUpperCase()}</div>
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
                      <div className="mc-left">
                        <div className="mc-mode">{match.queueLabel}</div>
                        <div className={`mc-result ${match.win ? 'win' : 'lose'}`}>{match.win ? '승리' : '패배'}</div>
                        <div className="mc-sep-line" />
                        <div className="mc-duration">{formatDuration(match.duration)}</div>
                        <div className="mc-ago">{timeAgo(match.gameStartTimestamp)}</div>
                      </div>

                      <div className="mc-champ">
                        <div className="mc-champ-wrap">
                          <img src={champIconUrl(ddVersion, match.championId)} alt={match.championName} className="mc-champ-img" />
                          <span className="mc-champ-level">{match.champLevel}</span>
                        </div>
                        <div className="mc-champ-name">{match.championName}</div>
                      </div>

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

                      <div className="mc-items">
                        <div className="mc-items-row">
                          {match.items.slice(0, 6).map((id, idx) =>
                            id > 0
                              ? <img key={idx} src={itemIconUrl(ddVersion, id)} alt="아이템" className="mc-item-img" />
                              : <div key={idx} className="mc-item-empty" />
                          )}
                        </div>
                        <div className="mc-trinket-row">
                          {match.items[6] > 0
                            ? <img src={itemIconUrl(ddVersion, match.items[6])} alt="장신구" className="mc-trinket-img" />
                            : <div className="mc-item-empty mc-trinket-empty" />
                          }
                        </div>
                      </div>

                      <div className="mc-participants">
                        <div className="mc-team-col">
                          {blueTeam.slice(0, 5).map(p => (
                            <div key={p.puuid} className="mc-part">
                              <img src={champIconUrl(ddVersion, p.championId)} alt={p.gameName} className={`mc-part-icon${p.puuid === account?.puuid ? ' mc-part-me' : ''}`} />
                              <span className={`mc-part-name${p.puuid === account?.puuid ? ' mc-part-name-me' : ''}`}>{p.gameName || '?'}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mc-team-col">
                          {redTeam.slice(0, 5).map(p => (
                            <div key={p.puuid} className="mc-part">
                              <img src={champIconUrl(ddVersion, p.championId)} alt={p.gameName} className={`mc-part-icon${p.teamId !== myTeamId ? ' mc-part-enemy' : ''}`} />
                              <span className="mc-part-name">{p.gameName || '?'}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 확장 토글 버튼 */}
                      <button
                        className={`mc-expand-btn ${isExpanded ? 'open' : ''}`}
                        onClick={() => setExpandedMatch(isExpanded ? null : match.matchId)}
                        title="상세 보기"
                      >▼</button>
                    </div>

                    {/* ── 확장 상세 뷰 ── */}
                    {isExpanded && match.allParticipants.length > 0 && (
                      <div className="mc-detail">
                        {[blueTeam, redTeam].map((team, ti) => {
                          const isMyTeam = (ti === 0 ? 100 : 200) === myTeamId
                          return (
                            <div key={ti} className={`mc-detail-team ${ti === 0 ? 'blue' : 'red'}`}>
                              <div className="mc-detail-team-label">{ti === 0 ? '🔵 블루팀' : '🔴 레드팀'}{isMyTeam ? ' (내 팀)' : ''}</div>
                              <div className="mc-detail-header">
                                <span className="mc-dh-champ">챔피언</span>
                                <span className="mc-dh-name">닉네임</span>
                                <span className="mc-dh-kda">KDA</span>
                                <span className="mc-dh-dmg">피해량</span>
                                <span className="mc-dh-cs">CS</span>
                                <span className="mc-dh-items">아이템</span>
                              </div>
                              {team.map(p => {
                                const pkda = p.deaths === 0
                                  ? (p.kills + p.assists).toFixed(2)
                                  : ((p.kills + p.assists) / p.deaths).toFixed(2)
                                const spell1 = spellMap[p.spell1Id]
                                const spell2 = spellMap[p.spell2Id]
                                const pRune  = runeMap[p.primaryRuneId]
                                const subStyle = runeMap[p.subStyleId]
                                const isMe = p.puuid === account?.puuid
                                return (
                                  <div key={p.puuid} className={`mc-detail-row ${isMe ? 'me' : ''}`}>
                                    <div className="mc-dr-champ">
                                      <div className="mc-dr-icons">
                                        <img src={champIconUrl(ddVersion, p.championId)} alt="" className="mc-dr-champ-img" />
                                        <div className="mc-dr-spells">
                                          {spell1 && <img src={spellIconUrl(ddVersion, spell1.id)} alt={spell1.name} className="mc-dr-spell" />}
                                          {spell2 && <img src={spellIconUrl(ddVersion, spell2.id)} alt={spell2.name} className="mc-dr-spell" />}
                                        </div>
                                        <div className="mc-dr-runes">
                                          {pRune && <img src={runeIconUrl(pRune.icon)} alt={pRune.name} className="mc-dr-rune" />}
                                          {subStyle && <img src={runeIconUrl(subStyle.icon)} alt={subStyle.name} className="mc-dr-rune mc-dr-rune-sub" />}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mc-dr-name">
                                      <span
                                        className={`mc-dr-nick ${isMe ? 'me' : ''}`}
                                        onClick={() => navigate(`/summoner/${encodeURIComponent(`${p.gameName}#${p.tagLine}`)}`)}
                                        style={{ cursor: 'pointer' }}
                                      >{p.gameName || '?'}</span>
                                      {p.tagLine && <span className="mc-dr-tag">#{p.tagLine}</span>}
                                    </div>
                                    <div className="mc-dr-kda">
                                      <span>{p.kills}/<span style={{ color:'#ef4444' }}>{p.deaths}</span>/{p.assists}</span>
                                      <span className="mc-dr-kda-ratio">{pkda} KDA</span>
                                    </div>
                                    <div className="mc-dr-dmg">{p.totalDamage.toLocaleString()}</div>
                                    <div className="mc-dr-cs">{p.cs}</div>
                                    <div className="mc-dr-items">
                                      {p.items.slice(0, 7).map((id, idx) =>
                                        id > 0
                                          ? <img key={idx} src={itemIconUrl(ddVersion, id)} alt="" className="mc-dr-item" />
                                          : <div key={idx} className="mc-dr-item-empty" />
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
