import { useState } from 'react'
import { mockChampions, tierColors } from '../data/mockChampions'
import './ChampionPage.css'
import './SubPage.css'

export default function ChampionPage() {
  const [search, setSearch] = useState('')
  const filtered = mockChampions.filter(c =>
    c.korName.includes(search) || c.name.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <div className={"subpage champion-page"}>
      <div className={"subpage-header"}>
        <div className={"subpage-header-inner"}>
          <div>
            <h1 className={"subpage-title"}>챔피언 분석</h1>
            <p className={"subpage-desc"}>챔피언별 상세 통계 및 빌드 가이드</p>
          </div>
          <div className={"subpage-meta"}><span className={"patch-badge"}>14.24 패치</span></div>
        </div>
      </div>
      <div className={"subpage-body"}>
        <div className={"champ-search-wrap"}>
          <input type="text" className={"champ-search-input"} placeholder="챔피언 이름 검색..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={"champ-analysis-grid"}>
          {filtered.map(champ => (
            <div key={champ.id} className={"champ-analysis-card"}>
              <div className={"ca-header"}>
                <div className={"ca-icon"} style={{ background: champ.iconColor + '22', border: '2px solid ' + champ.iconColor + '44' }}>
                  <span style={{ color: champ.iconColor, fontWeight: 900, fontSize: 16 }}>{champ.name.slice(0,2).toUpperCase()}</span>
                </div>
                <div className={"ca-info"}>
                  <div className={"ca-name"}>{champ.korName}</div>
                  <div className={"ca-en"}>{champ.name}</div>
                </div>
                <span className={"ca-tier"} style={{ color: tierColors[champ.tier] }}>{champ.tier}</span>
              </div>
              <div className={"ca-stats"}>
                <div className={"ca-stat"}><span className={"ca-stat-label"}>승률</span><span className={"ca-stat-val"}>{champ.winRate.toFixed(1)}%</span></div>
                <div className={"ca-stat"}><span className={"ca-stat-label"}>픽률</span><span className={"ca-stat-val"}>{champ.pickRate.toFixed(1)}%</span></div>
                <div className={"ca-stat"}><span className={"ca-stat-label"}>KDA</span><span className={"ca-stat-val"}>{champ.kda.toFixed(1)}</span></div>
              </div>
              <div className={"ca-winrate-bar"}>
                <div className={"ca-bar-fill"} style={{ width: champ.winRate + '%', background: '#6366f1' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}