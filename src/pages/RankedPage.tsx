import { useState } from 'react'
import ChampionTierList from '../components/ChampionTierList'
import './SubPage.css'
import './RankedPage.css'

const positions = [
  { label: '전체',   icon: null,    riotPos: undefined },
  { label: '탑',     icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-top.png',     riotPos: 'TOP' },
  { label: '정글',   icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-jungle.png',  riotPos: 'JUNGLE' },
  { label: '미드',   icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-middle.png',  riotPos: 'MIDDLE' },
  { label: '원딜',   icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-bottom.png',  riotPos: 'BOTTOM' },
  { label: '서포터', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-utility.png', riotPos: 'UTILITY' },
]

export default function RankedPage() {
  const [activePos, setActivePos] = useState('전체')
  return (
    <div className="subpage ranked-page">
      <div className="subpage-header">
        <span className="ranked-crown ranked-crown-1">👑</span>
        <span className="ranked-crown ranked-crown-2">🏆</span>
        <div className="subpage-header-inner">
          <div>
            <h1 className="subpage-title">솔로랭크 티어리스트</h1>
            <p className="subpage-desc">5v5 솔로랭크 챔피언 포지션별 승률 · 픽률 분석</p>
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
            <span className="filter-label">포지션</span>
            <div className="position-chips">
              {positions.map(p => (
                <button key={p.label} className={"pos-chip " + (activePos === p.label ? 'active' : '')} onClick={() => setActivePos(p.label)}>
                  {p.icon && <img src={p.icon} alt={p.label} className="pos-chip-icon" />}{p.label}
                </button>
              ))}
            </div>
          </div>
          <select className="sort-select"><option>티어순</option><option>승률순</option><option>픽률순</option></select>
        </div>
        <ChampionTierList mode="ranked" position={positions.find(p => p.label === activePos)?.riotPos} />
      </div>
    </div>
  )
}
