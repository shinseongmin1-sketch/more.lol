import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import './Header.css'

interface HeaderProps {
  onSearch: (name: string) => void
}

const navItems = [
  { path: '/aram', label: 'ARAM' },
  { path: '/ranked', label: '랭크' },
  { path: '/normal', label: '일반' },
  { path: '/champion', label: '챔피언 분석' },
  { path: '/community', label: '커뮤니티' },
]

export default function Header({ onSearch }: HeaderProps) {
  const [inputValue, setInputValue] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onSearch(inputValue.trim())
      setInputValue('')
    }
  }

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <Link to="/" className="logo">
            <span className="logo-text">more</span>
            <span className="logo-dot">.lol</span>
          </Link>
          <nav className="header-nav">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="header-right">
          {!isHome && (
            <form className="header-search-form" onSubmit={handleSubmit}>
              <div className="header-search-wrap">
                <svg className="search-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="소환사명 검색"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  className="header-search-input"
                />
                <select className="server-select-sm">
                  <option>KR</option>
                  <option>NA</option>
                  <option>EUW</option>
                </select>
              </div>
            </form>
          )}
          <div className="header-actions">
            <button className="btn-ghost" onClick={() => navigate('/community')}>커뮤니티</button>
            <button className="btn-primary-sm">로그인</button>
          </div>
        </div>
      </div>
    </header>
  )
}
