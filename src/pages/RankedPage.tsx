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

const playerTiers = [
  { label: '챌린저',    key: 'CHALLENGER',  color: '#f4c874' },
  { label: '그랜드마스터', key: 'GRANDMASTER', color: '#e84057' },
  { label: '마스터',    key: 'MASTER',      color: '#9b59b6' },
  { label: '다이아',    key: 'DIAMOND',     color: '#57c7e3' },
  { label: '에메랄드',  key: 'EMERALD',     color: '#2ecc71' },
  { label: '플래티넘',  key: 'PLATINUM',    color: '#1abc9c' },
  { label: '골드',      key: 'GOLD',        color: '#f1c40f' },
  { label: '실버',      key: 'SILVER',      color: '#95a5a6' },
  { label: '브론즈',    key: 'BRONZE',      color: '#cd7f32' },
  { label: '아이언',    key: 'IRON',        color: '#7f8c8d' },
]

export default function RankedPage() {
  const [activePos,  setActivePos]  = useState('전체')
  const [activeTier, setActiveTier] = useState('CHALLENGER')

  const currentTierInfo = playerTiers.find(t => t.key === activeTier)!

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
            <span className="patch-badge">솔로랭크</span>
            <span className="update-info"><span className="update-dot" />30일 자동 업데이트</span>
          </div>
        </div>
      </div>

      <div className="subpage-body">
        {/* 티어 선택 */}
        <div className="subpage-filter-bar tier-filter-bar">
          <div className="filter-group">
            <span className="filter-label">티어</span>
            <div className="player-tier-chips">
              {playerTiers.map(t => (
                <button
                  key={t.key}
                  className={'player-tier-chip ' + (activeTier === t.key ? 'active' : '')}
                  style={activeTier === t.key ? { '--tier-clr': t.color } as React.CSSProperties : {}}
                  onClick={() => setActiveTier(t.key)}
                >
                  <img
                    src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/ranked-mini-crests/${t.key.toLowerCase()}.png`}
                    alt={t.label}
                    className="player-tier-icon"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 포지션 + 정렬 */}
        <div className="subpage-filter-bar">
          <div className="filter-group">
            <span className="filter-label">포지션</span>
            <div className="position-chips">
              {positions.map(p => (
                <button
                  key={p.label}
                  className={'pos-chip ' + (activePos === p.label ? 'active' : '')}
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
          mode="ranked"
          position={positions.find(p => p.label === activePos)?.riotPos}
          playerTier={activeTier}
          playerTierLabel={currentTierInfo.label}
          playerTierColor={currentTierInfo.color}
        />
      </div>
    </div>
  )
}
