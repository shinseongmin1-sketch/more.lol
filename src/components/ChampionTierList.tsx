import { useState, useEffect } from 'react'
import { tierColors } from '../data/mockChampions'
import { getDDVersion, champIconUrl } from '../utils/riotApi'
import './ChampionTierList.css'

interface ChampionTierListProps {
  mode: 'aram' | 'ranked' | 'normal'
  position?: string  // 'TOP' | 'JUNGLE' | 'MIDDLE' | 'BOTTOM' | 'UTILITY' | undefined(전체)
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
    <div
      className="champ-icon"
      style={{ width: size, height: size, background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
    >
      <span style={{ color: 'var(--text-muted)', fontSize: size * 0.35, fontWeight: 900 }}>
        {championId.slice(0, 2).toUpperCase()}
      </span>
    </div>
  )
}

function WinRateBar({ rate }: { rate: number }) {
  return (
    <div className="winrate-bar-wrap">
      <div className="winrate-bar-bg">
        <div
          className="winrate-bar-fill"
          style={{ width: `${Math.min(rate, 100)}%`, background: rate >= 53 ? 'var(--tier-s)' : rate >= 50 ? 'var(--accent-gold)' : 'var(--text-muted)' }}
        />
      </div>
    </div>
  )
}

export default function ChampionTierList({ mode, position }: ChampionTierListProps) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [allChampions, setAllChampions] = useState<TierEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [ddVersion, setDdVersion] = useState('')

  useEffect(() => {
    getDDVersion().then(setDdVersion).catch(() => {})
    fetch(`/api/tier-list?mode=${mode}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAllChampions(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const champions: TierEntry[] = (position && mode !== 'aram')
    ? allChampions.filter(c => c.position === position)
    : allChampions

  const maxDmg = Math.max(...champions.map(c => c.avgDamage), 1)

  if (loading) {
    return (
      <div className="tier-list-section">
        <div className="tier-list-inner">
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            챔피언 데이터 불러오는 중...
          </div>
        </div>
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="tier-list-section">
        <div className="tier-list-inner">
          <div className="tier-list-header">
            <h2 className="tier-list-title">
              {mode === 'aram' ? 'ARAM' : mode === 'ranked' ? '솔로랭크' : '일반'} 챔피언 티어리스트
              <span className="champ-count">{champions.length}명</span>
            </h2>
            <div className="view-toggle">
              <button className="view-btn" onClick={() => setViewMode('table')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </button>
              <button className="view-btn active" onClick={() => setViewMode('grid')}>
                <svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              </button>
            </div>
          </div>
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
        <div className="tier-list-header">
          <h2 className="tier-list-title">
            {mode === 'aram' ? 'ARAM' : mode === 'ranked' ? '솔로랭크' : '일반'} 챔피언 티어리스트
            <span className="champ-count">{champions.length}명</span>
          </h2>
          <div className="view-toggle">
            <button className="view-btn active" onClick={() => setViewMode('table')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
            <button className="view-btn" onClick={() => setViewMode('grid')}>
              <svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </button>
          </div>
        </div>

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
                <th className="col-games">게임 수</th>
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
                    <td className="col-games">
                      <span className="stat-val">{champ.games.toLocaleString()}</span>
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
