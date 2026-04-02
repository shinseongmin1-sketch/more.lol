import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  incrementSummonerSearch,
  getTodaySummonerCount,
  getAnalyzedChampionCount,
  onStatsChange,
} from '../utils/searchStats'
import { getRecentSearches, addRecentSearch, removeRecentSearch } from '../utils/recentSearchStore'
import { getDDVersion, champIconUrl } from '../utils/riotApi'
import './HomePage.css'

const quickLinks = [
  { path: '/ranked',   label: '솔로랭크 통계',   desc: '랭크 게임 챔피언 티어',      icon: '🏆', color: '#f59e0b' },
  { path: '/normal',   label: '일반게임 통계',   desc: '일반게임 챔피언 승률 분석',  icon: '🛡️', color: '#10b981' },
  { path: '/aram',     label: '칼바람나락 통계', desc: '칼바람나락 챔피언 분석',     icon: '⚡', color: '#00d2ff' },
  { path: '/champion', label: '챔피언 분석',     desc: '챔피언별 심층 데이터',       icon: '📊', color: '#6366f1' },
  { path: '/ranking',  label: '랭킹',           desc: '소환사 랭킹 순위',           icon: '🥇', color: '#e879f9' },
  { path: '/community',label: '커뮤니티',        desc: '공략, 팁, 자유게시판',       icon: '💬', color: '#f97316' },
]

const hotChamps = [
  { name: '요네',   id: 'Yone',      tier: 'S+', wr: '56.8%' },
  { name: '진',     id: 'Jinx',      tier: 'S+', wr: '55.4%' },
  { name: '럭스',   id: 'Lux',       tier: 'S',  wr: '54.1%' },
  { name: '직스',   id: 'Ziggs',     tier: 'S',  wr: '53.7%' },
  { name: '세라핀', id: 'Seraphine', tier: 'S',  wr: '53.2%' },
]

const rankStyles = ['gold', 'silver', 'bronze', '', '']

export default function HomePage() {
  const [inputValue, setInputValue] = useState('')
  const [focused, setFocused]       = useState(false)
  const [, setTodayCount] = useState(getTodaySummonerCount)
  const [, setChampCount] = useState(getAnalyzedChampionCount)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [ddVersion, setDdVersion] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    setRecentSearches(getRecentSearches())
    getDDVersion().then(setDdVersion).catch(() => {})
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
                <div className="quick-icon">{item.icon}</div>
                <div className="quick-info">
                  <div className="quick-label">{item.label}</div>
                  <div className="quick-desc">{item.desc}</div>
                </div>
                <svg className="quick-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            ))}
          </div>

          {/* 핫 챔피언 */}
          <div className="home-section">
            <div className="home-section-header">
              <h2 className="home-section-title">
                <span className="section-title-dot" />
                오늘의 인기 챔피언
              </h2>
              <span className="home-section-sub">ARAM 기준 · 14.24 패치</span>
            </div>
            <div className="hot-champs">
              {hotChamps.map((champ, i) => (
                <div key={champ.id} className="hot-champ-card" onClick={() => navigate('/champion')}>
                  <span className={`hot-rank ${rankStyles[i]}`}>#{i + 1}</span>
                  {ddVersion ? (
                    <img
                      src={champIconUrl(ddVersion, champ.id)}
                      alt={champ.name}
                      className="hot-icon hot-icon-img"
                    />
                  ) : (
                    <div className="hot-icon">
                      <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-muted)' }}>{champ.name.slice(0, 2)}</span>
                    </div>
                  )}
                  <div className="hot-info">
                    <div className="hot-name">{champ.name}</div>
                    <div className="hot-en">{champ.id}</div>
                  </div>
                  <div className="hot-right">
                    <div className="hot-tier" style={{ color: champ.tier === 'S+' ? '#ff6b6b' : '#ff9f43' }}>{champ.tier}</div>
                    <div className="hot-wr">{champ.wr}</div>
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
