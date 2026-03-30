import { useState } from 'react'
import { mockChampions, tierColors, type Champion } from '../data/mockChampions'
import './ChampionTierList.css'

interface ChampionTierListProps {
  mode: 'aram' | 'ranked' | 'normal'
}

function ChampionIcon({ name, color, size = 44 }: { name: string; color: string; size?: number }) {
  return (
    <div
      className="champ-icon"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${color}33, ${color}88)`, borderColor: `${color}44` }}
    >
      <span style={{ color, fontSize: size * 0.35, fontWeight: 900 }}>
        {name.slice(0, 2).toUpperCase()}
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
          style={{ width: `${rate}%`, background: rate >= 53 ? 'var(--tier-s)' : rate >= 50 ? 'var(--accent-gold)' : 'var(--text-muted)' }}
        />
      </div>
    </div>
  )
}

export default function ChampionTierList({ mode }: ChampionTierListProps) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  const champions = mockChampions

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
              <button className={`view-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>
                <svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              </button>
              <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </button>
            </div>
          </div>
          <div className="champ-grid">
            {champions.map(champ => (
              <div key={champ.id} className="champ-card">
                <div className="champ-card-tier" style={{ color: tierColors[champ.tier] }}>{champ.tier}</div>
                <ChampionIcon name={champ.name} color={champ.iconColor} size={56} />
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
            <button className={`view-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
            <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
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
              {champions.map((champ, idx) => (
                <tr
                  key={champ.id}
                  className={`tier-row ${hoveredRow === champ.id ? 'hovered' : ''}`}
                  onMouseEnter={() => setHoveredRow(champ.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="col-rank">
                    <span className={`rank-num ${idx < 3 ? 'top3' : ''}`}>{idx + 1}</span>
                  </td>
                  <td className="col-champ">
                    <div className="champ-cell">
                      <ChampionIcon name={champ.name} color={champ.iconColor} />
                      <div className="champ-info">
                        <span className="champ-kor-name">{champ.korName}</span>
                        <span className="champ-eng-name">{champ.name}</span>
                      </div>
                      {champ.position && (
                        <span className="position-tag">{champ.position}</span>
                      )}
                    </div>
                  </td>
                  <td className="col-tier">
                    <span className="tier-badge" style={{ color: tierColors[champ.tier], borderColor: tierColors[champ.tier] + '44', background: tierColors[champ.tier] + '15' }}>
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
                    <span className="stat-val" style={{ color: champ.banRate > 15 ? 'var(--tier-s)' : 'inherit' }}>
                      {champ.banRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="col-kda">
                    <div className="kda-cell">
                      <span className="kda-num">{champ.kda.toFixed(1)}</span>
                      <span className="kda-detail">{champ.avgKills.toFixed(1)} / {champ.avgDeaths.toFixed(1)} / {champ.avgAssists.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="col-dmg">
                    <div className="dmg-cell">
                      <span className="dmg-num">{(champ.dmgDealt / 1000).toFixed(1)}k</span>
                      <div className="dmg-bar-bg">
                        <div className="dmg-bar-fill" style={{ width: `${(champ.dmgDealt / 35000) * 100}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="col-games">
                    <span className="stat-val">{champ.games.toLocaleString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
