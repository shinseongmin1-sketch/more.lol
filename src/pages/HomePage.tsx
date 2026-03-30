import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './HomePage.css'

const recentSearches = ['Hide on bush', 'Faker', 'T1 Gumayusi', 'Keria', 'Oner']

const quickLinks = [
  { path: '/aram', label: 'ARAM 티어리스트', desc: '무작위 총력전 챔피언 분석', icon: '⚔️' },
  { path: '/ranked', label: '솔로랭크 통계', desc: '랭크 게임 챔피언 티어', icon: '🏆' },
  { path: '/champion', label: '챔피언 분석', desc: '챔피언별 심층 데이터', icon: '📊' },
  { path: '/community', label: '커뮤니티', desc: '공략, 팁, 자유게시판', icon: '💬' },
]

export default function HomePage() {
  const [inputValue, setInputValue] = useState('')
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (name: string) => {
    if (name.trim()) navigate(`/summoner/${encodeURIComponent(name.trim())}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(inputValue)
  }

  return (
    <div className="home">
      {/* 상단 광고 배너 */}
      <div className="ad-banner top-ad">
        <span className="ad-label">Advertisement</span>
      </div>

      {/* 히어로 섹션 */}
      <div className="home-hero">
        <div className="home-hero-bg" />
        <div className="home-hero-content">
          <h1 className="home-title">
            <span>more</span><span className="home-title-dot">.lol</span>
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
                검색
              </button>
            </div>

            {focused && (
              <div className="home-dropdown">
                <div className="dropdown-section-title">최근 검색</div>
                {recentSearches.map(name => (
                  <div key={name} className="dropdown-item" onMouseDown={() => handleSearch(name)}>
                    <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                    {name}
                    <span className="dropdown-server">KR</span>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* 본문 레이아웃 (좌우 광고 + 중앙 콘텐츠) */}
      <div className="home-body">
        <div className="home-ad-left ad-side">
          <span className="ad-label">AD</span>
        </div>

        <div className="home-center">
          {/* 빠른 이동 카드 */}
          <div className="quick-links">
            {quickLinks.map(item => (
              <div key={item.path} className="quick-card" onClick={() => navigate(item.path)}>
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

          {/* 중간 광고 */}
          <div className="ad-banner mid-ad">
            <span className="ad-label">Advertisement</span>
          </div>

          {/* 핫 챔피언 */}
          <div className="home-section">
            <div className="home-section-header">
              <h2 className="home-section-title">오늘의 인기 챔피언</h2>
              <span className="home-section-sub">ARAM 기준 · 14.24 패치</span>
            </div>
            <div className="hot-champs">
              {[
                { name: '요네', en: 'Yone', tier: 'S+', wr: '56.8%', color: '#4a90e2' },
                { name: '진', en: 'Jinx', tier: 'S+', wr: '55.4%', color: '#ff6b9d' },
                { name: '럭스', en: 'Lux', tier: 'S', wr: '54.1%', color: '#ffd43b' },
                { name: '직스', en: 'Ziggs', tier: 'S', wr: '53.7%', color: '#ff8c42' },
                { name: '세라핀', en: 'Seraphine', tier: 'S', wr: '53.2%', color: '#ff69b4' },
              ].map((champ, i) => (
                <div key={champ.en} className="hot-champ-card">
                  <div className="hot-rank">#{i + 1}</div>
                  <div className="hot-icon" style={{ background: champ.color + '22', border: `2px solid ${champ.color}44` }}>
                    <span style={{ color: champ.color, fontSize: 14, fontWeight: 900 }}>{champ.name.slice(0, 2)}</span>
                  </div>
                  <div className="hot-info">
                    <div className="hot-name">{champ.name}</div>
                    <div className="hot-en">{champ.en}</div>
                  </div>
                  <div className="hot-right">
                    <div className="hot-tier" style={{ color: champ.tier === 'S+' ? '#ff6b6b' : '#ffa94d' }}>{champ.tier}</div>
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
