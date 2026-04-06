import { useState } from 'react'
import ChampionTierList from '../components/ChampionTierList'
import './SubPage.css'
import './AramPage.css'

const CHAMP_TIERS = ['전체', 'S+', 'S', 'A', 'B', 'C', 'D'] as const
type ChampTierFilter = typeof CHAMP_TIERS[number]

export default function AramPage() {
  const [activeTier, setActiveTier] = useState<ChampTierFilter>('전체')

  return (
    <div className="subpage aram-page">
      <div className="subpage-header">
        <span className="aram-bolt aram-bolt-1">⚡</span>
        <span className="aram-bolt aram-bolt-2">⚡</span>
        <div className="subpage-header-inner">
          <div>
            <h1 className="subpage-title">ARAM 티어리스트</h1>
            <p className="subpage-desc">무작위 총력전 챔피언 승률 · 픽률 · 티어 분석</p>
          </div>
          <div className="subpage-meta">
            <span className="patch-badge">칼바람나락</span>
            <span className="update-info"><span className="update-dot" />30일 자동 업데이트</span>
          </div>
        </div>
      </div>

      <div className="subpage-body">
        <div className="subpage-filter-bar">
          <div className="filter-group">
            <span className="filter-label">챔피언 티어</span>
            <div className="aram-tier-chips">
              {CHAMP_TIERS.map(t => (
                <button
                  key={t}
                  className={'aram-tier-chip ' + (activeTier === t ? 'active' : '')}
                  onClick={() => setActiveTier(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ChampionTierList
          mode="aram"
          aramTierFilter={activeTier === '전체' ? undefined : activeTier}
        />
      </div>
    </div>
  )
}
