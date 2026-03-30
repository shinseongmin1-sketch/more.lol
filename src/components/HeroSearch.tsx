import { useState } from 'react'
import './HeroSearch.css'

interface HeroSearchProps {
  onSearch: (name: string) => void
}

const recentSearches = ['Hide on bush', 'Faker', 'T1 Gumayusi', 'Keria', 'Oner']

export default function HeroSearch({ onSearch }: HeroSearchProps) {
  const [inputValue, setInputValue] = useState('')
  const [focused, setFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onSearch(inputValue.trim())
    }
  }

  return (
    <div className="hero">
      <div className="hero-bg">
        <div className="hero-gradient" />
        <div className="hero-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              opacity: 0.3 + Math.random() * 0.4,
            }} />
          ))}
        </div>
      </div>
      <div className="hero-content">
        <div className="hero-badge">Beta</div>
        <h1 className="hero-title">
          <span className="hero-title-more">more</span>
          <span className="hero-title-dot">.lol</span>
        </h1>
        <p className="hero-subtitle">더 깊은 전적 분석 · 더 정확한 티어 정보</p>

        <form className="search-form" onSubmit={handleSubmit}>
          <div className={`search-box ${focused ? 'focused' : ''}`}>
            <select className="server-select">
              <option>KR</option>
              <option>NA</option>
              <option>EUW</option>
              <option>EUNE</option>
              <option>JP</option>
            </select>
            <div className="search-divider" />
            <input
              type="text"
              className="search-input"
              placeholder="소환사명 또는 소환사명#태그 입력"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
            />
            <button type="submit" className="search-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              검색
            </button>
          </div>

          {focused && (
            <div className="search-dropdown">
              <div className="dropdown-section-title">최근 검색</div>
              {recentSearches.map(name => (
                <div key={name} className="dropdown-item" onMouseDown={() => { setInputValue(name); onSearch(name) }}>
                  <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
                  </svg>
                  {name}
                  <span className="dropdown-server">KR</span>
                </div>
              ))}
            </div>
          )}
        </form>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-value">12,847</span>
            <span className="hero-stat-label">오늘 검색된 소환사</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-value">163</span>
            <span className="hero-stat-label">분석 중인 챔피언</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-value">실시간</span>
            <span className="hero-stat-label">데이터 업데이트</span>
          </div>
        </div>
      </div>
    </div>
  )
}
