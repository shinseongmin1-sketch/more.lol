import { useState } from 'react'
import ChampionTierList from '../components/ChampionTierList'
import './SubPage.css'
import './AramPage.css'

const tierFilters = ['전체', 'S+', 'S', 'A', 'B', 'C', 'D']

export default function AramPage() {
  const [activeTier, setActiveTier] = useState('전체')
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
            <span className="patch-badge">14.24 패치</span>
            <span className="update-info"><span className="update-dot" />실시간 업데이트</span>
          </div>
        </div>
      </div>
      <div className="subpage-body">
        <div className="subpage-filter-bar">
          <div className="filter-group">
            <span className="filter-label">티어 필터</span>
            <div className="filter-chips">
              {tierFilters.map(t => (
                <button key={t} className={"filter-chip " + (activeTier === t ? 'active' : '')} onClick={() => setActiveTier(t)}>{t}</button>
              ))}
            </div>
          </div>
          <select className="sort-select"><option>티어순</option><option>승률순</option><option>픽률순</option><option>밴률순</option></select>
        </div>
        <ChampionTierList mode="aram" />
      </div>
    </div>
  )
}
