import { useState, useEffect } from 'react'
import './SubPage.css'
import './RankingPage.css'

// ── 티어 표기 유틸 ─────────────────────────────────────────────────────────
const TIER_KOR: Record<string, string> = {
  CHALLENGER: '챌린저', GRANDMASTER: '그랜드마스터', MASTER: '마스터',
  DIAMOND: '다이아', EMERALD: '에메랄드', PLATINUM: '플래티넘',
  GOLD: '골드', SILVER: '실버', BRONZE: '브론즈', IRON: '아이언',
}
const TIER_COLOR: Record<string, string> = {
  CHALLENGER: '#f4c874', GRANDMASTER: '#e84057', MASTER: '#9b59b6',
  DIAMOND: '#57c7e3', EMERALD: '#2ecc71', PLATINUM: '#1abc9c',
  GOLD: '#f1c40f', SILVER: '#95a5a6', BRONZE: '#cd7f32', IRON: '#7f8c8d',
}
const RANK_ICON: Record<string, string> = {
  CHALLENGER:  'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/ranked-mini-crests/challenger.png',
  GRANDMASTER: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/ranked-mini-crests/grandmaster.png',
  MASTER:      'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/ranked-mini-crests/master.png',
  DIAMOND:     'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/ranked-mini-crests/diamond.png',
  EMERALD:     'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/ranked-mini-crests/emerald.png',
  PLATINUM:    'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/ranked-mini-crests/platinum.png',
  GOLD:        'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/ranked-mini-crests/gold.png',
}
const TEAM_COLOR: Record<string, string> = {
  T1: '#c89b3c', 'Gen.G': '#1e3a5f', KT: '#cc0000',
  HLE: '#e67e22', DRX: '#0d47a1', NS: '#f06a00', KDF: '#6c3483', BRO: '#1a5276',
}
const POS_KOR: Record<string, string> = {
  탑: 'TOP', 정글: 'JGL', 미드: 'MID', 원딜: 'ADC', 서포터: 'SUP',
}

interface OverallEntry {
  rank: number
  gameName: string
  tagLine: string
  tierLabel: string
  leaguePoints: number
  wins: number
  losses: number
  winRate: number
  veteran: boolean
  hotStreak: boolean
}

interface ProEntry {
  proRank: number
  team: string
  pos: string
  proName: string
  gameName: string
  tagLine: string
  found: boolean
  tierLabel: string | null
  rank: string | null
  leaguePoints: number
  wins: number
  losses: number
  winRate: number
  hotStreak: boolean
  veteran: boolean
}

function TierBadge({ tier, lp, showLP = true }: { tier: string; lp?: number; showLP?: boolean }) {
  const color = TIER_COLOR[tier] ?? '#aaa'
  return (
    <div className="tier-badge-cell">
      <img
        src={RANK_ICON[tier] ?? RANK_ICON['GOLD']}
        alt={tier}
        className="rank-emblem"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      <div className="tier-text-group">
        <span className="tier-label-text" style={{ color }}>{TIER_KOR[tier] ?? tier}</span>
        {showLP && lp !== undefined && <span className="lp-text">{lp.toLocaleString()} LP</span>}
      </div>
    </div>
  )
}

function WinRateBar({ wr }: { wr: number }) {
  return (
    <div className="wr-bar-wrap">
      <div className="wr-bar-bg">
        <div className="wr-bar-fill" style={{
          width: `${Math.min(wr, 100)}%`,
          background: wr >= 55 ? '#27ae60' : wr >= 50 ? '#f1c40f' : '#e74c3c',
        }} />
      </div>
    </div>
  )
}

function useFetch<T>(url: string) {
  const [data,        setData]        = useState<T | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [lastUpdated, setLastUpdated] = useState('')

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    fetch(url, { signal: ctrl.signal })
      .then(async r => {
        const upd = r.headers.get('X-Last-Updated')
        if (upd) {
          const d = new Date(upd)
          setLastUpdated(`${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} 기준`)
        }
        setData(await r.json())
      })
      .catch(e => { if (e.name !== 'AbortError') setData(null) })
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [url])

  return { data, loading, lastUpdated }
}

// ─────────────────────────────────────────────────────────────────────────────
//  전체 랭킹 탭
// ─────────────────────────────────────────────────────────────────────────────
function OverallRanking() {
  const { data, loading, lastUpdated } = useFetch<OverallEntry[]>('/api/ranking?type=overall')
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  if (loading) return (
    <div className="ranking-loading">
      <div className="loading-spinner" />
      <p>챌린저 · 그랜드마스터 · 마스터 리그 순위 불러오는 중...</p>
      <p className="loading-hint">최초 조회 시 약 2~3분 소요, 6시간 캐시</p>
    </div>
  )

  const entries: OverallEntry[] = Array.isArray(data) ? data : []

  return (
    <div className="ranking-table-wrap">
      {lastUpdated && <div className="ranking-updated">{lastUpdated}</div>}
      <table className="ranking-table">
        <thead>
          <tr>
            <th className="col-r-rank">#</th>
            <th className="col-r-name">소환사</th>
            <th className="col-r-tier">티어</th>
            <th className="col-r-lp">LP</th>
            <th className="col-r-wr">승률</th>
            <th className="col-r-wl">승/패</th>
            <th className="col-r-badge">뱃지</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(e => (
            <tr
              key={e.rank}
              className={`ranking-row ${hoveredRow === e.rank ? 'hovered' : ''} ${e.rank <= 3 ? 'top3' : ''}`}
              onMouseEnter={() => setHoveredRow(e.rank)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td className="col-r-rank">
                <span className={`r-rank-num ${e.rank <= 3 ? 'gold' : e.rank <= 10 ? 'silver' : ''}`}>
                  {e.rank}
                </span>
              </td>
              <td className="col-r-name">
                <div className="summoner-name-cell">
                  <span className="summoner-game-name">{e.gameName}</span>
                  <span className="summoner-tag">#{e.tagLine}</span>
                </div>
              </td>
              <td className="col-r-tier">
                <TierBadge tier={e.tierLabel} showLP={false} />
              </td>
              <td className="col-r-lp">
                <span className="lp-value" style={{ color: TIER_COLOR[e.tierLabel] ?? '#aaa' }}>
                  {e.leaguePoints.toLocaleString()}
                </span>
              </td>
              <td className="col-r-wr">
                <div className="wr-cell">
                  <span className="wr-num" style={{ color: e.winRate >= 55 ? '#27ae60' : e.winRate >= 50 ? '#f1c40f' : '#e74c3c' }}>
                    {e.winRate.toFixed(1)}%
                  </span>
                  <WinRateBar wr={e.winRate} />
                </div>
              </td>
              <td className="col-r-wl">
                <span className="wl-text">
                  <span className="w-num">{e.wins}W</span>
                  <span className="wl-sep"> / </span>
                  <span className="l-num">{e.losses}L</span>
                </span>
              </td>
              <td className="col-r-badge">
                <div className="badge-chips">
                  {e.hotStreak && <span className="badge-chip hot">🔥 연승</span>}
                  {e.veteran   && <span className="badge-chip vet">🏆 베테랑</span>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  프로게이머 랭킹 탭
// ─────────────────────────────────────────────────────────────────────────────
const ALL_TEAMS = ['전체', 'T1', 'Gen.G', 'KT', 'HLE', 'DRX', 'NS', 'KDF', 'BRO']

function ProRanking() {
  const { data, loading, lastUpdated } = useFetch<ProEntry[]>('/api/ranking?type=pro')
  const [teamFilter, setTeamFilter] = useState('전체')
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  if (loading) return (
    <div className="ranking-loading">
      <div className="loading-spinner" />
      <p>프로게이머 랭킹 불러오는 중...</p>
      <p className="loading-hint">최초 조회 시 약 1~2분 소요, 6시간 캐시</p>
    </div>
  )

  const entries: ProEntry[] = Array.isArray(data)
    ? data.filter(e => teamFilter === '전체' || e.team === teamFilter)
    : []

  return (
    <div>
      {/* 팀 필터 */}
      <div className="pro-team-filter">
        {ALL_TEAMS.map(t => (
          <button
            key={t}
            className={'pro-team-chip ' + (teamFilter === t ? 'active' : '')}
            style={teamFilter === t && t !== '전체' ? { '--tc': TEAM_COLOR[t] ?? '#7c5af6' } as React.CSSProperties : {}}
            onClick={() => setTeamFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {lastUpdated && <div className="ranking-updated">{lastUpdated}</div>}

      <div className="ranking-table-wrap">
        <table className="ranking-table">
          <thead>
            <tr>
              <th className="col-r-rank">#</th>
              <th className="col-pro-team">팀</th>
              <th className="col-pro-pos">포지션</th>
              <th className="col-pro-name">선수</th>
              <th className="col-r-name">인게임 ID</th>
              <th className="col-r-tier">티어</th>
              <th className="col-r-lp">LP</th>
              <th className="col-r-wr">승률</th>
              <th className="col-r-wl">승/패</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, idx) => (
              <tr
                key={e.proName + e.team}
                className={`ranking-row ${hoveredRow === idx ? 'hovered' : ''} ${idx < 3 && teamFilter === '전체' ? 'top3' : ''}`}
                onMouseEnter={() => setHoveredRow(idx)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="col-r-rank">
                  <span className={`r-rank-num ${idx < 3 && teamFilter === '전체' ? 'gold' : ''}`}>
                    {e.proRank ?? idx + 1}
                  </span>
                </td>
                <td className="col-pro-team">
                  <span
                    className="team-badge"
                    style={{ background: (TEAM_COLOR[e.team] ?? '#444') + '30', color: TEAM_COLOR[e.team] ?? '#aaa', borderColor: (TEAM_COLOR[e.team] ?? '#444') + '60' }}
                  >
                    {e.team}
                  </span>
                </td>
                <td className="col-pro-pos">
                  <span className="pos-badge">{POS_KOR[e.pos] ?? e.pos}</span>
                </td>
                <td className="col-pro-name">
                  <span className="pro-display-name">{e.proName}</span>
                </td>
                <td className="col-r-name">
                  {e.found
                    ? <div className="summoner-name-cell">
                        <span className="summoner-game-name">{e.gameName}</span>
                        <span className="summoner-tag">#{e.tagLine}</span>
                      </div>
                    : <span className="not-found">계정 미확인</span>
                  }
                </td>
                <td className="col-r-tier">
                  {e.tierLabel
                    ? <TierBadge tier={e.tierLabel} showLP={false} />
                    : <span className="not-found">언랭크</span>
                  }
                </td>
                <td className="col-r-lp">
                  {e.tierLabel
                    ? <span className="lp-value" style={{ color: TIER_COLOR[e.tierLabel] ?? '#aaa' }}>
                        {e.leaguePoints.toLocaleString()}
                      </span>
                    : <span className="not-found">-</span>
                  }
                </td>
                <td className="col-r-wr">
                  {e.wins + e.losses > 0
                    ? <div className="wr-cell">
                        <span className="wr-num" style={{ color: e.winRate >= 55 ? '#27ae60' : e.winRate >= 50 ? '#f1c40f' : '#e74c3c' }}>
                          {e.winRate.toFixed(1)}%
                        </span>
                        <WinRateBar wr={e.winRate} />
                      </div>
                    : <span className="not-found">-</span>
                  }
                </td>
                <td className="col-r-wl">
                  {e.wins + e.losses > 0
                    ? <span className="wl-text">
                        <span className="w-num">{e.wins}W</span>
                        <span className="wl-sep"> / </span>
                        <span className="l-num">{e.losses}L</span>
                      </span>
                    : <span className="not-found">-</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  메인
// ─────────────────────────────────────────────────────────────────────────────
export default function RankingPage() {
  const [tab, setTab] = useState<'overall' | 'pro'>('overall')

  return (
    <div className="subpage ranking-page">
      <div className="subpage-header">
        <span className="ranking-deco ranking-deco-1">🏆</span>
        <span className="ranking-deco ranking-deco-2">🥇</span>
        <div className="subpage-header-inner">
          <div>
            <h1 className="subpage-title">랭킹</h1>
            <p className="subpage-desc">KR 서버 솔로랭크 실시간 순위</p>
          </div>
          <div className="subpage-meta">
            <span className="patch-badge">솔로랭크</span>
            <span className="update-info"><span className="update-dot" />6시간 자동 갱신</span>
          </div>
        </div>
      </div>

      <div className="subpage-body">
        {/* 탭 */}
        <div className="ranking-tabs">
          <button
            className={'ranking-tab ' + (tab === 'overall' ? 'active' : '')}
            onClick={() => setTab('overall')}
          >
            🌐 전체 티어 순위
          </button>
          <button
            className={'ranking-tab ' + (tab === 'pro' ? 'active' : '')}
            onClick={() => setTab('pro')}
          >
            🎮 프로게이머 순위
          </button>
        </div>

        {tab === 'overall' ? <OverallRanking /> : <ProRanking />}
      </div>
    </div>
  )
}
