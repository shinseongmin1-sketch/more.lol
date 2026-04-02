import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import type { User } from '../utils/auth'
import './Header.css'

interface HeaderProps {
  onSearch: (name: string) => void
  user: User | null
  onLoginClick: () => void
  onLogout: () => void
}

const champSubItems = [
  { path: '/ranked',   label: '솔로랭크' },
  { path: '/normal',   label: '일반게임' },
  { path: '/aram',     label: '칼바람나락' },
]

export default function Header({ onSearch, user, onLoginClick, onLogout }: HeaderProps) {
  const [inputValue, setInputValue] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [champMenuOpen, setChampMenuOpen] = useState(false)
  const champCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const dropdownRef = useRef<HTMLDivElement>(null)
  const champMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
      if (champMenuRef.current && !champMenuRef.current.contains(e.target as Node)) {
        setChampMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
            <span className="logo-word">More</span><span className="logo-word logo-accent">lol</span>
          </Link>
          <nav className="header-nav">
            {/* 챔피언 분석 (하위메뉴) */}
            <div
              className="nav-item-wrap"
              ref={champMenuRef}
              onMouseEnter={() => {
                if (champCloseTimer.current) clearTimeout(champCloseTimer.current)
                setChampMenuOpen(true)
              }}
              onMouseLeave={() => {
                champCloseTimer.current = setTimeout(() => setChampMenuOpen(false), 150)
              }}
            >
              <Link
                to="/champion"
                className={`nav-link ${location.pathname.startsWith('/champion') || ['/ranked','/normal','/aram'].includes(location.pathname) ? 'active' : ''}`}
              >
                챔피언 분석
                <span className={`nav-diamond ${champMenuOpen ? 'open' : ''}`} />
              </Link>
              {champMenuOpen && (
                <div
                  className="nav-submenu"
                  onMouseEnter={() => {
                    if (champCloseTimer.current) clearTimeout(champCloseTimer.current)
                  }}
                  onMouseLeave={() => {
                    champCloseTimer.current = setTimeout(() => setChampMenuOpen(false), 150)
                  }}
                >
                  {champSubItems.map(sub => (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      className={`nav-submenu-item ${location.pathname === sub.path ? 'active' : ''}`}
                      onClick={() => setChampMenuOpen(false)}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 랭킹 */}
            <Link
              to="/ranking"
              className={`nav-link ${location.pathname === '/ranking' ? 'active' : ''}`}
            >
              랭킹
            </Link>

            {/* 커뮤니티 */}
            <Link
              to="/community"
              className={`nav-link ${location.pathname === '/community' ? 'active' : ''}`}
            >
              커뮤니티
            </Link>
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
            {user ? (
              <div className="user-menu" ref={dropdownRef}>
                <button
                  className="user-avatar-btn"
                  onClick={() => setDropdownOpen(v => !v)}
                >
                  <div className="user-avatar">
                    {user.nickname.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="user-nickname">{user.nickname}</span>
                  <svg className="user-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-info">
                      <div className="user-dropdown-nick">{user.nickname}</div>
                      <div className="user-dropdown-id">@{user.id}</div>
                    </div>
                    <div className="user-dropdown-divider" />
                    <button className="user-dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/profile') }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                      내 게시글
                    </button>
                    <button className="user-dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/settings') }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
                      프로필 설정
                    </button>
                    <div className="user-dropdown-divider" />
                    <button className="user-dropdown-item logout" onClick={() => { setDropdownOpen(false); onLogout() }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="btn-primary-sm" onClick={onLoginClick}>로그인</button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
