import { useState } from 'react'
import ChampionTierList from '../components/ChampionTierList'
import './SubPage.css'

const positions = ['전체', '탑', '정글', '미드', '원딜', '서포터']

export default function RankedPage() {
  const [activePos, setActivePos] = useState('전체')

  return (
    <div className="subpage">
      <div className="subpage-header">
        <div className="subpage-header-inner">
          <div>
            <h1 className="subpage-title">솔로랭크 티어리스트</h1>
            <p className="subpage-desc">5v5 솔로랭크 챔피언 포지션별 승률 · 픽률 분석</p>
          </div>
          <div className="subpage-meta">
            <span className="patch-badge">14.24 패치</span>
            <span className="update-info">
              <span className="update-dot" />
              실시간 업데이트
            </span>
          </div>
        </div>
      </div>

      <div className="subpage-body">
        <div className="subpage-filter-bar">
          <div className="filter-group">
            <span className="filter-label">포지션</span>
            <div className="filter-chips">
              {positions.map(p => (
                <button
                  key={p}
                  className={`filter-chip ${activePos === p ? 'active' : ''}`}
                  onClick={() => setActivePos(p)}
                >{p}</button>
              ))}
            </div>
          </div>
          <select className="sort-select">
            <option>티어순</option>
            <option>승률순</option>
            <option>픽률순</option>
          </select>
        </div>
        <ChampionTierList mode="ranked" />
      </div>
    </div>
  )
}
