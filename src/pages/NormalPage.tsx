import { useState } from 'react'
import ChampionTierList from '../components/ChampionTierList'
import './SubPage.css'
import './NormalPage.css'

const positions = [
  { label: '전체',   icon: null,    riotPos: undefined },
  { label: '탑',     icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-top.png',     riotPos: 'TOP' },
  { label: '정글',   icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-jungle.png',  riotPos: 'JUNGLE' },
  { label: '미드',   icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-middle.png',  riotPos: 'MIDDLE' },
  { label: '원딜',   icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-bottom.png',  riotPos: 'BOTTOM' },
  { label: '서포터', icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-utility.png', riotPos: 'UTILITY' },
]

export default function NormalPage() {
  const [activePos, setActivePos] = useState('전체')

  return (
    <div className="subpage normal-page">
      <div className="subpage-header">
        <span className="normal-leaf normal-leaf-1">🌿</span>
        <span className="normal-leaf normal-leaf-2">🍃</span>
        <div className="subpage-header-inner">
          <div>
            <h1 className="subpage-title">일반게임 티어리스트</h1>
            <p className="subpage-desc">5v5 일반게임 챔피언 포지션별 승률 · 픽률 분석</p>
          </div>
          <div className="subpage-meta">
            <span className="patch-badge">일반게임</span>
            <span className="update-info"><span className="update-dot" />30일 자동 업데이트</span>
          </div>
        </div>
      </div>

      <div className="subpage-body">
        <div className="subpage-filter-bar">
          <div className="filter-group">
            <span className="filter-label">포지션</span>
            <div className="position-chips">
              {positions.map(p => (
                <button
                  key={p.label}
                  className={'pos-chip normal-pos-chip ' + (activePos === p.label ? 'active' : '')}
                  onClick={() => setActivePos(p.label)}
                >
                  {p.icon && <img src={p.icon} alt={p.label} className="pos-chip-icon" />}
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ChampionTierList
          mode="normal"
          position={positions.find(p => p.label === activePos)?.riotPos}
        />
      </div>
    </div>
  )
}
