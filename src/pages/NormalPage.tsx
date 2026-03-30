import { useState } from 'react'
import ChampionTierList from '../components/ChampionTierList'
import './SubPage.css'
import './NormalPage.css'

const modeFilters = ['전체', '탑', '정글', '미드', '원딜', '서포터']

export default function NormalPage() {
  const [activeMode, setActiveMode] = useState('전체')
  return (
    <div className="subpage normal-page">
      <div className="subpage-header">
        <span className="normal-leaf normal-leaf-1">🌿</span>
        <span className="normal-leaf normal-leaf-2">🍃</span>
        <div className="subpage-header-inner">
          <div>
            <h1 className="subpage-title">일반게임 티어리스트</h1>
            <p className="subpage-desc">5v5 일반게임 챔피언 승률 · 픽률 분석 — 부담 없이 즐겨요</p>
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
            <span className="filter-label">라인</span>
            <div className="filter-chips">
              {modeFilters.map(m => (
                <button key={m} className={"filter-chip " + (activeMode === m ? 'active' : '')} onClick={() => setActiveMode(m)}>{m}</button>
              ))}
            </div>
          </div>
          <select className="sort-select"><option>티어순</option><option>승률순</option><option>픽률순</option></select>
        </div>
        <ChampionTierList mode="normal" />
      </div>
    </div>
  )
}
