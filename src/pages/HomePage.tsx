import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  incrementSummonerSearch,
  getTodaySummonerCount,
  getAnalyzedChampionCount,
  onStatsChange,
} from '../utils/searchStats'
import { getRecentSearches, addRecentSearch, removeRecentSearch } from '../utils/recentSearchStore'
import { getDDVersion, champIconUrl, getChampMap } from '../utils/riotApi'
import './HomePage.css'

const quickLinks = [
  { path: '/ranked',    label: '솔로랭크 통계',   desc: '랭크 게임 챔피언 티어',      color: '#f59e0b' },
  { path: '/normal',    label: '일반게임 통계',   desc: '일반게임 챔피언 승률 분석',  color: '#10b981' },
  { path: '/aram',      label: '칼바람나락 통계', desc: '칼바람나락 챔피언 분석',     color: '#0ea5e9' },
  { path: '/champion',  label: '챔피언 분석',     desc: '챔피언별 심층 데이터',       color: '#6366f1' },
  { path: '/ranking',   label: '랭킹',           desc: '소환사 랭킹 순위',           color: '#e879f9' },
  { path: '/community', label: '커뮤니티',        desc: '공략, 팁, 자유게시판',       color: '#f97316' },
]

interface HotChamp {
  position: string
  label: string
  championId: string
  count: number
}

const POSITION_ICONS: Record<string, string> = {
  TOP:     'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-top.png',
  JUNGLE:  'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-jungle.png',
  MIDDLE:  'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-middle.png',
  BOTTOM:  'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-bottom.png',
  UTILITY: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-utility.png',
}

const fallbackChamps: HotChamp[] = [
  { position: 'TOP',     label: '탑',   championId: 'Darius',   count: 0 },
  { position: 'JUNGLE',  label: '정글', championId: 'Vi',       count: 0 },
  { position: 'MIDDLE',  label: '미드', championId: 'Syndra',   count: 0 },
  { position: 'BOTTOM',  label: '원딜', championId: 'Jinx',     count: 0 },
  { position: 'UTILITY', label: '서폿', championId: 'Thresh',   count: 0 },
]

export default function HomePage() {
  const [inputValue, setInputValue] = useState('')
  const [focused, setFocused]       = useState(false)
  const [, setTodayCount] = useState(getTodaySummonerCount)
  const [, setChampCount] = useState(getAnalyzedChampionCount)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [ddVersion, setDdVersion] = useState('')
  const [hotChamps, setHotChamps] = useState<HotChamp[]>(fallbackChamps)
  const [champNameMap, setChampNameMap] = useState<Record<string, string>>({})
  const navigate = useNavigate()

  useEffect(() => {
    setRecentSearches(getRecentSearches())

    getDDVersion().then(setDdVersion).catch(() => {})

    // 챔피언 한글 이름 맵 (영문ID → 한글명)
    getChampMap().then(map => {
      const rev: Record<string, string> = {}
      Object.values(map).forEach(c => { rev[c.id] = c.name })
      setChampNameMap(rev)
    }).catch(() => {})

    // 포지션별 인기 챔피언
    fetch('/api/popular-champs')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setHotChamps(data) })
      .catch(() => {})

    return onStatsChange(() => {
      setTodayCount(getTodaySummonerCount())
      setChampCount(getAnalyzedChampionCount())
    })
  }, [])

  const handleSearch = (name: string) => {
    if (name.trim()) {
      incrementSummonerSearch()
      addRecentSearch(name.trim())
      setRecentSearches(getRecentSearches())
      navigate(`/summoner/${encodeURIComponent(name.trim())}`)
    }
  }

  const handleRemoveRecent = (e: React.MouseEvent, name: string) => {
    e.stopPropagation()
    removeRecentSearch(name)
    setRecentSearches(getRecentSearches())
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(inputValue)
  }

  return (
    <div className="home">
      {/* 상단 광고 */}
      <div className="ad-banner top-ad">
        <span className="ad-label">Advertisement</span>
      </div>

      {/* 히어로 */}
      <div className="home-hero">
        <div className="home-hero-bg" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <div className="home-hero-content">
          <h1 className="home-title">
            <span className="home-title-main">more</span>
            <span className="home-title-dot">lol</span>
          </h1>
          <p className="home-subtitle">더 깊은 전적 분석 · 더 정확한 티어 정보</p>

          <form className="home-search-form" onSubmit={handleSubmit}>
            <div className={`home-search-box ${focused ? 'focused' : ''}`}>
              <select className="home-server-select">
                <option>KR</option>
                <option>NA</option>
                <option>EUW</option>
                <option>EUNE</option>
                <option>JP</option>
              </select>
              <div className="home-search-divider" />
              <input
                type="text"
                className="home-search-input"
                placeholder="소환사명 또는 소환사명#태그 입력"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
              />
              <button type="submit" className="home-search-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>
            </div>

            {focused && recentSearches.length > 0 && (
              <div className="home-dropdown">
                <div className="dropdown-section-title">최근 검색</div>
                {recentSearches.map(name => (
                  <div key={name} className="dropdown-item" onMouseDown={() => handleSearch(name)}>
                    <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                    </svg>
                    <span style={{ flex: 1 }}>{name}</span>
                    <span className="dropdown-server">KR</span>
                    <button
                      className="dropdown-remove-btn"
                      onMouseDown={e => handleRemoveRecent(e, name)}
                      aria-label="삭제"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </form>

        </div>
      </div>

      {/* 본문 */}
      <div className="home-body">
        <div className="home-ad-left ad-side">
          <span className="ad-label">AD</span>
        </div>

        <div className="home-center">
          {/* 중간 광고 */}
          <div className="ad-banner mid-ad">
            <span className="ad-label">Advertisement</span>
          </div>

          {/* 빠른 이동 */}
          <div className="quick-links">
            {quickLinks.map(item => (
              <div key={item.path} className="quick-card" onClick={() => navigate(item.path)} style={{ '--card-color': item.color } as React.CSSProperties}>
                <div className="quick-label">{item.label}</div>
                <div className="quick-desc">{item.desc}</div>
              </div>
            ))}
          </div>

          {/* 핫 챔피언 */}
          <div className="home-section">
            <div className="home-section-header">
              <h2 className="home-section-title">
                <span className="section-title-dot" />
                포지션별 인기 챔피언
              </h2>
              <span className="home-section-sub">챌린저 실시간 기준</span>
            </div>
            <div className="hot-champs">
              {hotChamps.map((champ) => (
                <div key={champ.position} className="hot-champ-card" onClick={() => navigate('/champion')}>
                  <span className="hot-rank hot-position">{champ.label}</span>
                  {ddVersion ? (
                    <img
                      src={champIconUrl(ddVersion, champ.championId)}
                      alt={champ.championId}
                      className="hot-icon hot-icon-img"
                    />
                  ) : (
                    <div className="hot-icon" />
                  )}
                  <div className="hot-info">
                    <div className="hot-name">{champNameMap[champ.championId] ?? champ.championId}</div>
                    <div className="hot-en">{champ.championId}</div>
                  </div>
                  <div className="hot-right">
                    <div className="hot-wr" style={{ color: 'var(--text-muted)' }}>{champ.count}게임</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="home-ad-right ad-side">
          <span className="ad-label">AD</span>
        </div>
      </div>

      {/* 하단 광고 */}
      <div className="ad-banner bottom-ad">
        <span className="ad-label">Advertisement</span>
      </div>
    </div>
  )
}
