import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { champIconUrl } from '../utils/riotApi'
import './MostChampsPage.css'

export default function MostChampsPage() {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const { state } = useLocation() as {
    state: {
      allMostChamps: Array<{ name: string; id: string; wins: number; total: number; kills: number; deaths: number; assists: number }>
      ddVersion: string
      mostFilter: string
    } | null
  }

  const [filter, setFilter] = useState(state?.mostFilter ?? '전체')

  if (!state) {
    return (
      <div className="mcp-page">
        <div className="mcp-empty">데이터가 없습니다. 전적 페이지에서 다시 접근해주세요.</div>
      </div>
    )
  }

  const { allMostChamps, ddVersion } = state

  const decoded = decodeURIComponent(name || '')
  const hashIdx = decoded.indexOf('#')
  const gameName = hashIdx >= 0 ? decoded.slice(0, hashIdx) : decoded
  const tagLine  = hashIdx >= 0 ? decoded.slice(hashIdx + 1) : 'KR1'

  return (
    <div className="mcp-page">
      <div className="mcp-header">
        <button className="mcp-back" onClick={() => navigate(-1)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          돌아가기
        </button>
        <div className="mcp-title-wrap">
          <h1 className="mcp-title">모스트 챔피언</h1>
          <span className="mcp-summoner">{gameName}<span className="mcp-tag">#{tagLine}</span></span>
        </div>
        <div className="mcp-filters">
          {(['전체', '솔로랭크', '자유랭크'] as const).map(f => (
            <button key={f} className={`mcp-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      <div className="mcp-body">
        <div className="mcp-table-head">
          <span className="mcp-col-champ">챔피언</span>
          <span className="mcp-col-games">게임</span>
          <span className="mcp-col-wr">승률</span>
          <span className="mcp-col-kda">KDA</span>
          <span className="mcp-col-avg">평점</span>
        </div>
        {allMostChamps.length === 0 ? (
          <div className="mcp-empty">전적 데이터가 없습니다.</div>
        ) : (
          allMostChamps.map(c => {
            const wr = Math.round((c.wins / c.total) * 100)
            const avgK = (c.kills / c.total).toFixed(1)
            const avgD = (c.deaths / c.total).toFixed(1)
            const avgA = (c.assists / c.total).toFixed(1)
            const kda = c.deaths === 0
              ? (c.kills + c.assists).toFixed(2)
              : ((c.kills + c.assists) / c.deaths).toFixed(2)
            const wrColor = wr >= 60 ? '#3b82f6' : wr >= 50 ? '#7c5af6' : '#ef4444'
            return (
              <div key={c.id} className="mcp-row">
                <div className="mcp-col-champ">
                  <img src={champIconUrl(ddVersion, c.id)} alt={c.name} className="mcp-champ-icon" />
                  <span className="mcp-champ-name">{c.name}</span>
                </div>
                <div className="mcp-col-games">{c.total}게임</div>
                <div className="mcp-col-wr">
                  <span style={{ color: wrColor, fontWeight: 700 }}>{wr}%</span>
                  <div className="mcp-bar-wrap">
                    <div className="mcp-bar" style={{ width: `${wr}%`, background: wrColor }} />
                  </div>
                  <span className="mcp-wl">{c.wins}승 {c.total - c.wins}패</span>
                </div>
                <div className="mcp-col-kda">
                  <span className="mcp-kda-nums">
                    {avgK} / <span style={{ color: '#ef4444' }}>{avgD}</span> / {avgA}
                  </span>
                </div>
                <div className="mcp-col-avg">
                  <span className="mcp-kda-val" style={{ color: Number(kda) >= 3 ? '#3b82f6' : 'var(--text-primary)' }}>{kda}</span>
                  <span className="mcp-kda-lbl"> 평점</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
