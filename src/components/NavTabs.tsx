import './NavTabs.css'

interface NavTabsProps {
  activeMode: 'aram' | 'ranked' | 'normal'
  onModeChange: (mode: 'aram' | 'ranked' | 'normal') => void
}

const tabs = [
  { key: 'aram', label: 'ARAM', sublabel: '무작위 총력전' },
  { key: 'ranked', label: '솔로랭크', sublabel: '5v5 랭크 게임' },
  { key: 'normal', label: '일반게임', sublabel: '5v5 일반' },
] as const

const tierFilters = ['전체', 'S+', 'S', 'A', 'B', 'C', 'D']
const positionFilters = ['전체', '탑', '정글', '미드', '원딜', '서포터']

export default function NavTabs({ activeMode, onModeChange }: NavTabsProps) {
  return (
    <div className="nav-section">
      <div className="nav-section-inner">
        <div className="mode-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`mode-tab ${activeMode === tab.key ? 'active' : ''}`}
              onClick={() => onModeChange(tab.key)}
            >
              <span className="mode-tab-label">{tab.label}</span>
              <span className="mode-tab-sub">{tab.sublabel}</span>
            </button>
          ))}
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <span className="filter-label">티어</span>
            <div className="filter-chips">
              {tierFilters.map((t, i) => (
                <button key={t} className={`filter-chip tier-chip ${i === 0 ? 'active' : ''}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          {activeMode !== 'aram' && (
            <div className="filter-group">
              <span className="filter-label">포지션</span>
              <div className="filter-chips">
                {positionFilters.map((p, i) => (
                  <button key={p} className={`filter-chip ${i === 0 ? 'active' : ''}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="filter-right">
            <span className="update-badge">
              <span className="update-dot" />
              14.24 패치 반영
            </span>
            <select className="sort-select">
              <option>티어순</option>
              <option>승률순</option>
              <option>픽률순</option>
              <option>밴률순</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
