import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDDVersion, getChampMap, champIconUrl } from '../utils/riotApi'
import { incrementChampionAnalysis } from '../utils/searchStats'
import './ChampionPage.css'
import './SubPage.css'

interface ChampInfo {
  key: string
  id: string    // 영문 ID (예: "Aatrox")
  name: string  // 한글 이름 (예: "아트록스")
}

export default function ChampionPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [ddVersion, setDdVersion] = useState('')
  const [champList, setChampList] = useState<ChampInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDDVersion(), getChampMap()])
      .then(([version, map]) => {
        setDdVersion(version)
        const list: ChampInfo[] = Object.entries(map)
          .map(([key, c]) => ({ key, id: c.id, name: c.name }))
          .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
        setChampList(list)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = champList.filter(c =>
    c.name.includes(search) || c.id.toLowerCase().includes(search.toLowerCase())
  )

  const patchLabel = ddVersion
    ? `${ddVersion.split('.').slice(0, 2).join('.')} 패치`
    : '로딩 중...'

  return (
    <div className="subpage champion-page">
      <div className="subpage-header">
        <div className="subpage-header-inner">
          <div>
            <h1 className="subpage-title">챔피언 분석</h1>
            <p className="subpage-desc">챔피언별 상세 통계 및 빌드 가이드</p>
          </div>
          <div className="subpage-meta">
            <span className="patch-badge">{patchLabel}</span>
          </div>
        </div>
      </div>

      <div className="subpage-body">
        <div className="champ-search-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="champ-search-input"
            placeholder="챔피언 이름 검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {champList.length > 0 && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
              {filtered.length} / {champList.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="champ-loading">챔피언 정보를 불러오는 중...</div>
        ) : (
          <div className="champ-analysis-grid">
            {filtered.map(champ => (
              <div
                key={champ.id}
                className="champ-analysis-card"
                onClick={() => { incrementChampionAnalysis(champ.name); navigate(`/champion/${champ.id}`) }}
              >
                <div className="ca-header">
                  <img
                    src={champIconUrl(ddVersion, champ.id)}
                    alt={champ.name}
                    className="ca-icon ca-icon-img"
                  />
                  <div className="ca-info">
                    <div className="ca-name">{champ.name}</div>
                    <div className="ca-en">{champ.id}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
