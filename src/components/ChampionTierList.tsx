import { useState, useEffect, useRef } from 'react'
import { tierColors } from '../data/mockChampions'
import { getDDVersion, champIconUrl } from '../utils/riotApi'
import './ChampionTierList.css'

interface ChampionTierListProps {
  mode: 'aram' | 'ranked' | 'normal'
  position?: string
  playerTier?: string          // 'CHALLENGER' | 'DIAMOND' | ... (ranked 전용)
  playerTierLabel?: string
  playerTierColor?: string
  aramTierFilter?: string      // 'S+' | 'S' | 'A' | 'B' | 'C' | 'D' (aram 전용)
}

interface TierEntry {
  championId: string
  korName: string
  position: string
  games: number
  winRate: number
  pickRate: number
  tier: string
  kda: number
  avgKills: number
  avgDeaths: number
  avgAssists: number
  avgDamage: number
}

type SortKey = 'tier' | 'winRate' | 'pickRate'

const TIER_ORDER: Record<string, number> = { 'S+': 0, S: 1, A: 2, B: 3, C: 4, D: 5 }

function ChampionIcon({ championId, ddVersion, size = 44 }: { championId: string; ddVersion: string; size?: number }) {
  if (ddVersion) {
    return (
      <img
        src={champIconUrl(ddVersion, championId)}
        alt={championId}
        className="champ-icon champ-icon-img"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div className="champ-icon" style={{ width: size, height: size }}>
      <span style={{ fontSize: size * 0.35, fontWeight: 900 }}>{championId.slice(0, 2).toUpperCase()}</span>
    </div>
  )
}

function WinRateBar({ rate }: { rate: number }) {
  return (
    <div className="winrate-bar-wrap">
      <div className="winrate-bar-bg">
        <div
          className="winrate-bar-fill"
          style={{
            width: `${Math.min(rate, 100)}%`,
            background: rate >= 53 ? 'var(--tier-s)' : rate >= 50 ? 'var(--accent-gold)' : 'var(--text-muted)',
          }}
        />
      </div>
    </div>
  )
}

export default function ChampionTierList({
  mode,
  position,
  playerTier = 'CHALLENGER',
  playerTierLabel = '챌린저',
  playerTierColor = '#f4c874',
  aramTierFilter,
}: ChampionTierListProps) {
  const [viewMode,      setViewMode]      = useState<'table' | 'grid'>('table')
  const [hoveredRow,    setHoveredRow]    = useState<string | null>(null)
  const [allChampions,  setAllChampions]  = useState<TierEntry[]>([])
  const [loading,       setLoading]       = useState(true)
  const [fetchStatus,   setFetchStatus]   = useState<string>('')
  const [lastUpdated,   setLastUpdated]   = useState<string>('')
  const [sortKey,       setSortKey]       = useState<SortKey>('tier')
  const [ddVersion,     setDdVersion]     = useState('')
  const prevTier = useRef<string>('')

  useEffect(() => {
    getDDVersion().then(setDdVersion).catch(() => {})
  }, [])

  useEffect(() => {
    // 칼바람: 포지션 없이 단순 fetch
    if (mode === 'aram') {
      setLoading(true)
      setFetchStatus('칼바람 데이터 수집 중... (100명 샘플, 최초 1회만 수행 후 30일 캐시)')
      const ctrl = new AbortController()
      fetch('/api/tier-list?mode=aram', { signal: ctrl.signal })
        .then(async r => {
          const updated = r.headers.get('X-Last-Updated')
          if (updated) {
            const d = new Date(updated)
            setLastUpdated(`${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()} 기준`)
          }
          const data = await r.json()
          setAllChampions(Array.isArray(data) ? data : [])
        })
        .catch(e => { if (e.name !== 'AbortError') setAllChampions([]) })
        .finally(() => { setLoading(false); setFetchStatus('') })
      return () => ctrl.abort()
    }

    // 일반게임: 티어 필터 없이 단순 fetch
    if (mode === 'normal') {
      setLoading(true)
      setFetchStatus('일반게임 데이터 수집 중... (100명 샘플, 최초 1회만 수행 후 30일 캐시)')
      const ctrl = new AbortController()
      fetch('/api/tier-list?mode=normal', { signal: ctrl.signal })
        .then(async r => {
          const updated = r.headers.get('X-Last-Updated')
          if (updated) {
            const d = new Date(updated)
            setLastUpdated(`${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()} 기준`)
          }
          const data = await r.json()
          setAllChampions(Array.isArray(data) ? data : [])
        })
        .catch(e => { if (e.name !== 'AbortError') setAllChampions([]) })
        .finally(() => { setLoading(false); setFetchStatus('') })
      return () => ctrl.abort()
    }

    if (prevTier.current === playerTier) return
    prevTier.current = playerTier

    setLoading(true)
    setFetchStatus('챔피언 데이터 수집 중... (티어당 100명 샘플, 최초 1회만 수행 후 30일 캐시)')

    const ctrl = new AbortController()

    fetch(`/api/tier-list?mode=ranked&tier=${playerTier}`, { signal: ctrl.signal })
      .then(async r => {
        const updated = r.headers.get('X-Last-Updated')
        if (updated) {
          const d = new Date(updated)
          setLastUpdated(`${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()} 기준`)
        }
        const data = await r.json()
        if (Array.isArray(data)) setAllChampions(data)
        else setAllChampions([])
      })
      .catch(e => { if (e.name !== 'AbortError') setAllChampions([]) })
      .finally(() => { setLoading(false); setFetchStatus('') })

    return () => ctrl.abort()
  }, [mode, playerTier])

  // 정렬
  const sorted = [...allChampions].sort((a, b) => {
    if (sortKey === 'tier')     return (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9)
    if (sortKey === 'winRate')  return b.winRate  - a.winRate
    if (sortKey === 'pickRate') return b.pickRate - a.pickRate
    return 0
  })

  // 포지션 필터 (ARAM은 포지션 없음) + ARAM 챔피언 티어 필터
  let champions: TierEntry[] = (position && mode !== 'aram')
    ? sorted.filter(c => c.position === position)
    : sorted
  if (mode === 'aram' && aramTierFilter) {
    champions = champions.filter(c => c.tier === aramTierFilter)
  }

  const maxDmg = Math.max(...champions.map(c => c.avgDamage), 1)

  if (loading) {
    return (
      <div className="tier-list-section">
        <div className="tier-list-inner">
          <div className="tier-list-loading">
            <div className="loading-spinner" />
            <p>{fetchStatus || '챔피언 데이터 불러오는 중...'}</p>
            {fetchStatus && (
              <p className="loading-hint">
                {mode === 'aram'
                  ? 'Riot API에서 칼바람나락 데이터를 수집합니다. (queue=450)'
                  : mode === 'normal'
                  ? 'Riot API에서 일반게임 데이터를 수집합니다. (queue=430)'
                  : 'Riot API에서 전 티어 실전 데이터를 수집합니다.'
                }<br />
                실전 데이터를 수집하고 있습니다. 잠시 기다려주세요.
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (champions.length === 0) {
    return (
      <div className="tier-list-section">
        <div className="tier-list-inner">
          <div className="tier-list-loading">
            <p style={{ color: 'var(--text-muted)' }}>표시할 데이터가 없습니다.</p>
          </div>
        </div>
      </div>
    )
  }

  const titleSuffix = mode === 'aram' ? 'ARAM' : mode === 'ranked' ? `솔로랭크` : '일반'

  const header = (
    <div className="tier-list-header">
      <div className="tier-list-title-group">
        <h2 className="tier-list-title">
          {titleSuffix} 챔피언 티어리스트
          {mode === 'ranked' && (
            <span className="player-tier-badge" style={{ color: playerTierColor, borderColor: playerTierColor + '55', background: playerTierColor + '18' }}>
              {playerTierLabel}
            </span>
          )}
        </h2>
        {lastUpdated && <span className="last-updated-badge">{lastUpdated}</span>}
      </div>
      <div className="tier-list-controls">
        <div className="sort-tabs">
          {(['tier', 'winRate', 'pickRate'] as SortKey[]).map(k => (
            <button
              key={k}
              className={'sort-tab ' + (sortKey === k ? 'active' : '')}
              onClick={() => setSortKey(k)}
            >
              {k === 'tier' ? '티어순' : k === 'winRate' ? '승률순' : '픽률순'}
            </button>
          ))}
        </div>
        <div className="view-toggle">
          <button className={'view-btn ' + (viewMode === 'table' ? 'active' : '')} onClick={() => setViewMode('table')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
          <button className={'view-btn ' + (viewMode === 'grid' ? 'active' : '')} onClick={() => setViewMode('grid')}>
            <svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
        </div>
      </div>
    </div>
  )

  if (viewMode === 'grid') {
    return (
      <div className="tier-list-section">
        <div className="tier-list-inner">
          {header}
          <div className="champ-grid">
            {champions.map(champ => (
              <div key={champ.championId + champ.position} className="champ-card">
                <div className="champ-card-tier" style={{ color: tierColors[champ.tier] ?? '#aaa' }}>{champ.tier}</div>
                <ChampionIcon championId={champ.championId} ddVersion={ddVersion} size={56} />
                <div className="champ-card-name">{champ.korName}</div>
                <div className="champ-card-winrate" style={{ color: champ.winRate >= 53 ? 'var(--tier-s)' : 'var(--text-primary)' }}>
                  {champ.winRate.toFixed(1)}%
                </div>
                <div className="champ-card-pick">픽률 {champ.pickRate.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="tier-list-section">
      <div className="tier-list-inner">
        {header}
        <div className="tier-table-wrap">
          <table className="tier-table">
            <thead>
              <tr>
                <th className="col-rank">#</th>
                <th className="col-champ">챔피언</th>
                <th className="col-tier">티어</th>
                <th className="col-winrate">승률</th>
                <th className="col-pickrate">픽률</th>
                <th className="col-banrate">밴률</th>
                <th className="col-kda">KDA</th>
                <th className="col-dmg">딜량</th>
              </tr>
            </thead>
            <tbody>
              {champions.map((champ, idx) => {
                const rowKey = champ.championId + champ.position
                return (
                  <tr
                    key={rowKey}
                    className={`tier-row ${hoveredRow === rowKey ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredRow(rowKey)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="col-rank">
                      <span className={`rank-num ${idx < 3 ? 'top3' : ''}`}>{idx + 1}</span>
                    </td>
                    <td className="col-champ">
                      <div className="champ-cell">
                        <ChampionIcon championId={champ.championId} ddVersion={ddVersion} />
                        <div className="champ-info">
                          <span className="champ-kor-name">{champ.korName}</span>
                          <span className="champ-eng-name">{champ.championId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="col-tier">
                      <span className="tier-badge" style={{ color: tierColors[champ.tier] ?? '#aaa', borderColor: (tierColors[champ.tier] ?? '#aaa') + '44', background: (tierColors[champ.tier] ?? '#aaa') + '15' }}>
                        {champ.tier}
                      </span>
                    </td>
                    <td className="col-winrate">
                      <div className="winrate-cell">
                        <span className="winrate-num" style={{ color: champ.winRate >= 53 ? 'var(--tier-s)' : champ.winRate >= 50 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {champ.winRate.toFixed(1)}%
                        </span>
                        <WinRateBar rate={champ.winRate} />
                      </div>
                    </td>
                    <td className="col-pickrate">
                      <span className="stat-val">{champ.pickRate.toFixed(1)}%</span>
                    </td>
                    <td className="col-banrate">
                      <span className="stat-val" style={{ color: 'var(--text-muted)' }}>-</span>
                    </td>
                    <td className="col-kda">
                      <div className="kda-cell">
                        <span className="kda-num">{champ.kda.toFixed(1)}</span>
                        <span className="kda-detail">{champ.avgKills.toFixed(1)} / {champ.avgDeaths.toFixed(1)} / {champ.avgAssists.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="col-dmg">
                      <div className="dmg-cell">
                        <span className="dmg-num">{(champ.avgDamage / 1000).toFixed(1)}k</span>
                        <div className="dmg-bar-bg">
                          <div className="dmg-bar-fill" style={{ width: `${(champ.avgDamage / maxDmg) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
