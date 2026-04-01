import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  getAccount, getSummonerByPuuid, getRankedInfo,
  getMatchIds, getMatch, getDDVersion, getChampMap,
  champIconUrl, itemIconUrl, profileIconUrl, QUEUE_LABELS,
} from '../utils/riotApi'
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

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}

function formatDuration(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
}

function handleApiError(e: unknown): string {
  const msg = String((e as Error).message)
  if (msg === '404') return '소환사를 찾을 수 없습니다. 소환사명#태그를 확인해주세요.'
  if (msg === '429') return 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
  if (msg === '403') return 'API 키가 만료되었습니다.'
  return `오류: ${msg}`
}

interface Teammate {
  puuid: string
  gameName: string
  tagLine: string
  championId: string
  win: boolean
}

interface MatchData {
  matchId: string
  win: boolean
  queueId: number
  queueLabel: string
  championName: string
  championId: string
  kills: number
  deaths: number
  assists: number
  cs: number
  duration: number
  gameStartTimestamp: number
  items: number[]
  teammates: Teammate[]
}

export default function SummonerPage() {
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
  const [ddVersion, setDdVersion] = useState('')
  const [activeFilter, setActiveFilter] = useState('전체')
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setError(null)
      setMatches([])
      setRankInfo([])
      try {
        const [version, champMap] = await Promise.all([getDDVersion(), getChampMap()])
        if (cancelled) return
        setDdVersion(version)

        const acc = await getAccount(gameName, tagLine)
        if (cancelled) return
        setAccount(acc)

        const [summ, matchIds] = await Promise.all([
          getSummonerByPuuid(acc.puuid),
          getMatchIds(acc.puuid, 20),
        ])
        if (cancelled) return
        setSummoner(summ)

        const [ranks, ...matchDetails] = await Promise.all([
          getRankedInfo(acc.puuid),
          ...matchIds.map((id: string) => getMatch(id)),
        ])
        if (cancelled) return
        setRankInfo(ranks)

        const processed: MatchData[] = (matchDetails as any[])
          .map((match) => {
            const participants: any[] = match.info.participants
            const me = participants.find((p: any) => p.puuid === acc.puuid)
            if (!me) return null
            const champ = champMap[String(me.championId)]
            const teammates: Teammate[] = participants
              .filter(p => p.puuid !== acc.puuid && p.teamId === me.teamId)
              .map(p => {
                const tc = champMap[String(p.championId)]
                return {
                  puuid: p.puuid,
                  gameName: p.riotIdGameName ?? '',
                  tagLine: p.riotIdTagline ?? '',
                  championId: tc?.id ?? p.championName,
                  win: p.win,
                }
              })
            return {
              matchId: match.metadata.matchId,
              win: me.win,
              queueId: match.info.queueId,
              queueLabel: QUEUE_LABELS[match.info.queueId as number] ?? '기타',
              championName: champ?.name ?? me.championName,
              championId: champ?.id ?? me.championName,
              kills: me.kills,
              deaths: me.deaths,
              assists: me.assists,
              cs: me.totalMinionsKilled + me.neutralMinionsKilled,
              duration: match.info.gameDuration,
              gameStartTimestamp: match.info.gameStartTimestamp,
              items: [me.item0, me.item1, me.item2, me.item3, me.item4, me.item5],
              teammates,
            }
          })
          .filter(Boolean) as MatchData[]

        setMatches(processed)
      } catch (e) {
        if (!cancelled) setError(handleApiError(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [gameName, tagLine, refresh])

  const filteredMatches = matches.filter(m => {
    if (activeFilter === '전체')   return true
    if (activeFilter === 'ARAM')   return m.queueId === 450
    if (activeFilter === '솔로랭크') return m.queueId === 420
    if (activeFilter === '자유랭크') return m.queueId === 440
    if (activeFilter === '일반')   return m.queueId === 430 || m.queueId === 400
    return true
  })

  const winCount  = filteredMatches.filter(m => m.win).length
  const totalCount = filteredMatches.length
  const winRate   = totalCount > 0 ? Math.round((winCount / totalCount) * 100) : 0
  const avgKills   = totalCount > 0 ? (filteredMatches.reduce((s, m) => s + m.kills,   0) / totalCount).toFixed(1) : '0.0'
  const avgDeaths  = totalCount > 0 ? (filteredMatches.reduce((s, m) => s + m.deaths,  0) / totalCount).toFixed(1) : '0.0'
  const avgAssists = totalCount > 0 ? (filteredMatches.reduce((s, m) => s + m.assists, 0) / totalCount).toFixed(1) : '0.0'

  const champStats: Record<string, { name: string; id: string; wins: number; total: number; kills: number; deaths: number; assists: number }> = {}
  matches.forEach(m => {
    if (!champStats[m.championId]) {
      champStats[m.championId] = { name: m.championName, id: m.championId, wins: 0, total: 0, kills: 0, deaths: 0, assists: 0 }
    }
    champStats[m.championId].total++
    if (m.win) champStats[m.championId].wins++
    champStats[m.championId].kills   += m.kills
    champStats[m.championId].deaths  += m.deaths
    champStats[m.championId].assists += m.assists
  })
  const mostChamps = Object.values(champStats).sort((a, b) => b.total - a.total).slice(0, 5)

  // 같이한 유저 집계
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
  const displayRanks = [
    soloRank ? { ...soloRank, queue: '솔로랭크' } : null,
    flexRank ? { ...flexRank, queue: '자유랭크' } : null,
  ].filter(Boolean) as any[]

  if (loading) {
    return (
      <div className="summoner-page">
        <div className="summoner-loading">
          <div className="loading-spinner" />
          <p>소환사 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="summoner-page">
        <div className="summoner-error">
          <div className="error-icon">⚠</div>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="summoner-page">
      <div className="summoner-header">
        <div className="summoner-header-inner">
          <div className="summoner-profile">
            <div className="summoner-avatar">
              {summoner?.profileIconId ? (
                <img
                  src={profileIconUrl(ddVersion, summoner.profileIconId)}
                  alt="프로필"
                  className="avatar-icon"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="avatar-icon">{gameName.slice(0, 2).toUpperCase()}</div>
              )}
              <div className="summoner-level">{summoner?.summonerLevel ?? ''}</div>
            </div>
            <div className="summoner-info">
              <div className="summoner-name-row">
                <h1 className="summoner-name">{account?.gameName ?? gameName}</h1>
                <span className="summoner-server">KR</span>
              </div>
              <div className="summoner-tag">#{account?.tagLine ?? tagLine}</div>
              <div className="summoner-actions">
                <button className="btn-refresh" onClick={() => setRefresh(r => r + 1)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  전적 갱신
                </button>
                <button className="btn-favorite">즐겨찾기</button>
              </div>
            </div>
          </div>

          <div className="summoner-ranks">
            {displayRanks.length === 0 && (
              <div className="rank-card">
                <div className="rank-icon" style={{ borderColor: '#ffffff22', background: '#ffffff08' }}>
                  <span style={{ color: '#6b7280', fontSize: 20, fontWeight: 900 }}>?</span>
                </div>
                <div className="rank-details">
                  <div className="rank-queue">솔로랭크</div>
                  <div className="rank-tier" style={{ color: '#6b7280' }}>UNRANKED</div>
                  <div className="rank-lp">0 LP</div>
                </div>
              </div>
            )}
            {displayRanks.map((r: any) => {
              const color = TIER_COLORS[r.tier] ?? '#6b7280'
              const wr = Math.round(r.wins / (r.wins + r.losses) * 100)
              return (
                <div key={r.queueType} className="rank-card">
                  <div className="rank-icon" style={{ borderColor: color + '44', background: color + '18' }}>
                    <span style={{ color, fontSize: 20, fontWeight: 900 }}>{r.tier[0]}</span>
                  </div>
                  <div className="rank-details">
                    <div className="rank-queue">{r.queue}</div>
                    <div className="rank-tier" style={{ color }}>{r.tier} {r.rank}</div>
                    <div className="rank-lp">{r.leaguePoints} LP</div>
                    <div className="rank-record">
                      <span className="win-text">{r.wins}승</span>
                      <span className="lose-text">{r.losses}패</span>
                      <span className="rate-text">{wr}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="summoner-content">
        <div className="summoner-content-inner">
          <div className="content-left">
            <div className="recent-summary-card">
              <div className="summary-header">최근 {totalCount}게임</div>
              <div className="summary-body">
                <div className="summary-circle">
                  <svg viewBox="0 0 80 80" className="circle-svg">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="var(--bg-secondary)" strokeWidth="8" />
                    <circle cx="40" cy="40" r="32" fill="none" stroke="var(--accent-blue)" strokeWidth="8"
                      strokeDasharray={`${(winRate / 100) * 200.96} 200.96`}
                      strokeLinecap="round"
                      transform="rotate(-90 40 40)" />
                  </svg>
                  <div className="circle-text">
                    <span className="circle-rate">{winRate}%</span>
                  </div>
                </div>
                <div className="summary-stats">
                  <div>
                    <span className="win-text">{winCount}승</span>{' '}
                    <span className="lose-text">{totalCount - winCount}패</span>
                  </div>
                  <div className="summary-kda">
                    평균 <strong>{avgKills}/{avgDeaths}/{avgAssists}</strong>
                  </div>
                </div>
              </div>
            </div>

            {mostChamps.length > 0 && (
              <div className="most-champs-card">
                <div className="card-title">모스트 챔피언</div>
                {mostChamps.map((c, i) => {
                  const kda = c.deaths === 0
                    ? (c.kills + c.assists).toFixed(1)
                    : ((c.kills + c.assists) / c.deaths).toFixed(2)
                  const wr = Math.round((c.wins / c.total) * 100)
                  return (
                    <div key={c.id} className="most-champ-row">
                      <div className="most-rank">{i + 1}</div>
                      <img
                        src={champIconUrl(ddVersion, c.id)}
                        alt={c.name}
                        style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div className="most-info">
                        <div className="most-name">{c.name}</div>
                        <div className="most-rate">
                          <span className="win-text">{wr}%</span>
                          <span className="most-games"> ({c.total}게임)</span>
                        </div>
                      </div>
                      <div className="most-kda-val">{kda}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="content-right">
            <div className="match-list">
              <div className="match-list-header">
                <div className="match-filters">
                  {['전체', 'ARAM', '솔로랭크', '자유랭크', '일반'].map(f => (
                    <button
                      key={f}
                      className={`match-filter-btn ${activeFilter === f ? 'active' : ''}`}
                      onClick={() => setActiveFilter(f)}
                    >{f}</button>
                  ))}
                </div>
              </div>

              {filteredMatches.length === 0 ? (
                <div className="no-matches">해당 게임 모드의 전적이 없습니다.</div>
              ) : (
                filteredMatches.map(match => (
                  <div key={match.matchId} className={`match-card ${match.win ? 'win' : 'lose'}`}>
                    <div className="match-mode">{match.queueLabel}</div>
                    <img
                      src={champIconUrl(ddVersion, match.championId)}
                      alt={match.championName}
                      style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border-color)' }}
                    />
                    <div className="match-main">
                      <div className="match-top">
                        <span className={`match-result-text ${match.win ? 'win' : 'lose'}`}>
                          {match.win ? '승리' : '패배'}
                        </span>
                        <span className="match-champ-name">{match.championName}</span>
                        <span className="match-kda">{match.kills}/{match.deaths}/{match.assists}</span>
                        {match.cs > 0 && <span className="match-cs">CS {match.cs}</span>}
                      </div>
                      <div className="match-items">
                        {match.items.filter(id => id > 0).map((itemId, idx) => (
                          <img
                            key={idx}
                            src={itemIconUrl(ddVersion, itemId)}
                            alt={`아이템`}
                            style={{ width: 22, height: 22, borderRadius: 4, objectFit: 'cover' }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="match-meta">
                      <div className="match-duration">{formatDuration(match.duration)}</div>
                      <div className="match-ago">{timeAgo(match.gameStartTimestamp)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
