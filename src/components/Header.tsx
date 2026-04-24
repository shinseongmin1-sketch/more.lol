import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import type { User } from '../utils/auth'
import { isAdmin } from '../utils/auth'
import { getAvatar } from '../utils/avatarStore'
import { searchCelebrities } from '../data/celebrities'
import { mockChampions } from '../data/mockChampions'
import './Header.css'

import type { Theme } from '../utils/theme'

interface HeaderProps {
  onSearch: (name: string) => void
  user: User | null
  onLoginClick: () => void
  onLogout: () => void
  theme: Theme
  onToggleTheme: () => void
}

const champSubItems = [
  { path: '/ranked',   label: '솔로랭크' },
  { path: '/normal',   label: '일반게임' },
  { path: '/aram',     label: '칼바람나락' },
]

const rankSubItems = [
  { path: '/ranking',      label: '티어랭킹' },
  { path: '/ranking/pro',  label: '프로랭킹' },
]

const tendencySubItems = [
  { path: '/tendency', label: '포지션 성향 테스트' },
]

export default function Header({ onSearch, user, onLoginClick, onLogout, theme, onToggleTheme }: HeaderProps) {
  const [inputValue, setInputValue] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [champMenuOpen, setChampMenuOpen] = useState(false)
  const [rankMenuOpen, setRankMenuOpen] = useState(false)
  const [tendencyMenuOpen, setTendencyMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => user ? getAvatar(user.id) : null)
  const champCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rankCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tendencyCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const dropdownRef = useRef<HTMLDivElement>(null)
  const champMenuRef = useRef<HTMLDivElement>(null)
  const rankMenuRef = useRef<HTMLDivElement>(null)
  const tendencyMenuRef = useRef<HTMLDivElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const suggestedCelebs = searchFocused && inputValue.trim()
    ? searchCelebrities(inputValue)
    : []
  const suggestedChamps = searchFocused && inputValue.trim()
    ? mockChampions.filter(c =>
        c.name.toLowerCase().startsWith(inputValue.toLowerCase()) ||
        c.korName.startsWith(inputValue)
      ).slice(0, 4)
    : []
  const showSearchDropdown = searchFocused && inputValue.trim().length > 0 && (suggestedCelebs.length > 0 || suggestedChamps.length > 0)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
      if (champMenuRef.current && !champMenuRef.current.contains(e.target as Node)) {
        setChampMenuOpen(false)
      }
      if (rankMenuRef.current && !rankMenuRef.current.contains(e.target as Node)) {
        setRankMenuOpen(false)
      }
      if (tendencyMenuRef.current && !tendencyMenuRef.current.contains(e.target as Node)) {
        setTendencyMenuOpen(false)
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // 아바타 동기화: user 변경 또는 라우트 전환(프로필 설정 저장 후 복귀) 시
  useEffect(() => {
    setAvatarUrl(user ? getAvatar(user.id) : null)
  }, [user, location.pathname])

  useEffect(() => {
    // 다른 탭에서의 변경 감지
    const onStorage = (e: StorageEvent) => {
      if (user && e.key === `avatar_${user.id}`) {
        setAvatarUrl(e.newValue)
      }
    }
    // 같은 탭에서 돌아올 때(프로필 설정 → 헤더) 갱신
    const onFocus = () => {
      if (user) setAvatarUrl(getAvatar(user.id))
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('focus', onFocus)
    }
  }, [user])

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
                className={`nav-link nav-link-glow ${location.pathname.startsWith('/champion') || ['/ranked','/normal','/aram'].includes(location.pathname) ? 'active' : ''} ${champMenuOpen ? 'glow-open' : ''}`}
              >
                챔피언 분석
                <svg className={`nav-caret ${champMenuOpen ? 'open' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 4l4 4 4-4" />
                </svg>
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

            {/* 랭킹 (하위메뉴) */}
            <div
              className="nav-item-wrap"
              ref={rankMenuRef}
              onMouseEnter={() => {
                if (rankCloseTimer.current) clearTimeout(rankCloseTimer.current)
                setRankMenuOpen(true)
              }}
              onMouseLeave={() => {
                rankCloseTimer.current = setTimeout(() => setRankMenuOpen(false), 150)
              }}
            >
              <Link
                to="/ranking"
                className={`nav-link nav-link-glow ${location.pathname.startsWith('/ranking') ? 'active' : ''} ${rankMenuOpen ? 'glow-open' : ''}`}
              >
                랭킹
                <svg className={`nav-caret ${rankMenuOpen ? 'open' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 4l4 4 4-4" />
                </svg>
              </Link>
              {rankMenuOpen && (
                <div
                  className="nav-submenu"
                  onMouseEnter={() => {
                    if (rankCloseTimer.current) clearTimeout(rankCloseTimer.current)
                  }}
                  onMouseLeave={() => {
                    rankCloseTimer.current = setTimeout(() => setRankMenuOpen(false), 150)
                  }}
                >
                  {rankSubItems.map(sub => (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      className={`nav-submenu-item ${location.pathname === sub.path ? 'active' : ''}`}
                      onClick={() => setRankMenuOpen(false)}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 커뮤니티 */}
            <Link
              to="/community"
              className={`nav-link ${location.pathname === '/community' ? 'active' : ''}`}
            >
              커뮤니티
            </Link>

            {/* 성향 테스트 (하위메뉴) */}
            <div
              className="nav-item-wrap"
              ref={tendencyMenuRef}
              onMouseEnter={() => {
                if (tendencyCloseTimer.current) clearTimeout(tendencyCloseTimer.current)
                setTendencyMenuOpen(true)
              }}
              onMouseLeave={() => {
                tendencyCloseTimer.current = setTimeout(() => setTendencyMenuOpen(false), 150)
              }}
            >
              <Link
                to="/tendency"
                className={`nav-link nav-link-glow nav-link-tendency ${location.pathname.startsWith('/tendency') ? 'active' : ''} ${tendencyMenuOpen ? 'glow-open' : ''}`}
              >
                성향 테스트
                <svg className={`nav-caret ${tendencyMenuOpen ? 'open' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 4l4 4 4-4" />
                </svg>
              </Link>
              {tendencyMenuOpen && (
                <div
                  className="nav-submenu"
                  onMouseEnter={() => {
                    if (tendencyCloseTimer.current) clearTimeout(tendencyCloseTimer.current)
                  }}
                  onMouseLeave={() => {
                    tendencyCloseTimer.current = setTimeout(() => setTendencyMenuOpen(false), 150)
                  }}
                >
                  {tendencySubItems.map(sub => (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      className={`nav-submenu-item ${location.pathname === sub.path ? 'active' : ''}`}
                      onClick={() => setTendencyMenuOpen(false)}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="header-right">
          {!isHome && (
            <div className="header-search-container" ref={searchContainerRef}>
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
                    onFocus={() => setSearchFocused(true)}
                    className="header-search-input"
                  />
                  <select className="server-select-sm">
                    <option>KR</option>
                    <option>NA</option>
                    <option>EUW</option>
                  </select>
                </div>
              </form>
              {showSearchDropdown && (
                <div className="header-search-dropdown">
                  {suggestedChamps.length > 0 && (
                    <>
                      <div className="hsd-section-title">챔피언</div>
                      {suggestedChamps.map(champ => (
                        <div
                          key={champ.id}
                          className="hsd-item"
                          onMouseDown={() => { setSearchFocused(false); setInputValue(''); navigate(`/champion/${champ.name}`) }}
                        >
                          <span className="hsd-badge hsd-badge-champ">챔피언</span>
                          <span className="hsd-name">{champ.korName}</span>
                          <span className="hsd-sub">{champ.name}</span>
                        </div>
                      ))}
                    </>
                  )}
                  {suggestedCelebs.filter(c => c.type === 'pro').length > 0 && (
                    <>
                      <div className="hsd-section-title">프로게이머</div>
                      {suggestedCelebs.filter(c => c.type === 'pro').slice(0, 4).map(celeb => (
                        <div
                          key={celeb.account}
                          className="hsd-item"
                          onMouseDown={() => { setSearchFocused(false); setInputValue(''); onSearch(celeb.account) }}
                        >
                          <span className="hsd-badge hsd-badge-pro">PRO</span>
                          <span className="hsd-name">{celeb.displayName}</span>
                          {celeb.team && <span className="hsd-sub">{celeb.team}</span>}
                        </div>
                      ))}
                    </>
                  )}
                  {suggestedCelebs.filter(c => c.type === 'streamer').length > 0 && (
                    <>
                      <div className="hsd-section-title">스트리머</div>
                      {suggestedCelebs.filter(c => c.type === 'streamer').slice(0, 4).map(celeb => (
                        <div
                          key={celeb.account}
                          className="hsd-item"
                          onMouseDown={() => { setSearchFocused(false); setInputValue(''); onSearch(celeb.account) }}
                        >
                          <span className="hsd-badge hsd-badge-streamer">스트리머</span>
                          <span className="hsd-name">{celeb.displayName}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            className={`theme-toggle-btn ${theme === 'dark' ? 'dark' : 'light'}`}
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            title={theme === 'dark' ? '라이트 모드' : '다크 모드'}
          >
            <span className="theme-toggle-track">
              <span className="theme-toggle-thumb">
                {theme === 'dark' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                )}
              </span>
            </span>
          </button>
          <button
            className={`hamburger-btn ${mobileMenuOpen ? "open" : ""}`}
            onClick={() => setMobileMenuOpen(v => !v)}
            aria-label="메뉴"
          >
            <span /><span /><span />
          </button>
          <div className="header-actions">
            {user ? (
              <div className="user-menu" ref={dropdownRef}>
                <button
                  className="user-avatar-btn"
                  onClick={() => setDropdownOpen(v => !v)}
                >
                  <div className="user-avatar">
                    {avatarUrl
                      ? <img src={avatarUrl} alt="" className="user-avatar-img" />
                      : <span className="user-avatar-initial">{user.nickname.slice(0, 1).toUpperCase()}</span>
                    }
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
                    {isAdmin(user) && (
                      <button className="user-dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/admin/inquiries') }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v12H4z"/><path d="M8 20h8M12 16v4"/></svg>
                        문의내역
                      </button>
                    )}
                    {isAdmin(user) && (
                      <button className="user-dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/admin/reports') }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        신고내역
                      </button>
                    )}
                    {isAdmin(user) && (
                      <button className="user-dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/admin/users') }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        유저관리
                      </button>
                    )}
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
      {/* 모바일 오버레이 */}
      {mobileMenuOpen && (
        <div className="mobile-nav-overlay open" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* 모바일 드로어 */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? "open" : ""}`}>
        <button className="mobile-nav-close" onClick={() => setMobileMenuOpen(false)}>✕</button>
        <nav className="mobile-nav-links">
          <Link to="/" className={`mobile-nav-link ${location.pathname === "/" ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>홈</Link>
          <div className="mobile-nav-section-label">챔피언 분석</div>
          <Link to="/champion" className={`mobile-nav-sub-link ${location.pathname === "/champion" ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>챔피언</Link>
          <Link to="/ranked" className={`mobile-nav-sub-link ${location.pathname === "/ranked" ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>솔로랭크</Link>
          <Link to="/normal" className={`mobile-nav-sub-link ${location.pathname === "/normal" ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>일반게임</Link>
          <Link to="/aram" className={`mobile-nav-sub-link ${location.pathname === "/aram" ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>칼바람나락</Link>
          <div className="mobile-nav-divider" />
          <div className="mobile-nav-section-label">랭킹</div>
          <Link to="/ranking" className={`mobile-nav-sub-link ${location.pathname === "/ranking" ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>티어랭킹</Link>
          <Link to="/ranking/pro" className={`mobile-nav-sub-link ${location.pathname === "/ranking/pro" ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>프로랭킹</Link>
          <div className="mobile-nav-divider" />
          <Link to="/community" className={`mobile-nav-link ${location.pathname.startsWith("/community") ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>커뮤니티</Link>
          <div className="mobile-nav-divider" />
          <div className="mobile-nav-section-label">성향 테스트</div>
          <Link to="/tendency" className={`mobile-nav-sub-link ${location.pathname === "/tendency" ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>포지션 성향 테스트</Link>
        </nav>
        <div className="mobile-nav-auth">
          {user ? (
            <>
              <div style={{fontSize:"13px",fontWeight:700,color:"var(--text-primary)",padding:"4px 0"}}>
                {user.nickname}
              </div>
              <button className="btn-ghost" style={{width:"100%",padding:"9px",borderRadius:"10px",fontSize:"13px"}} onClick={() => { setMobileMenuOpen(false); navigate("/profile") }}>내 게시글</button>
              <button className="btn-ghost" style={{width:"100%",padding:"9px",borderRadius:"10px",fontSize:"13px"}} onClick={() => { setMobileMenuOpen(false); navigate("/settings") }}>프로필 설정</button>
              <button className="btn-primary-sm" style={{width:"100%",padding:"9px",borderRadius:"10px",fontSize:"13px",textAlign:"center"}} onClick={() => { setMobileMenuOpen(false); onLogout() }}>로그아웃</button>
            </>
          ) : (
            <button className="btn-primary-sm" style={{width:"100%",padding:"10px",borderRadius:"10px",fontSize:"13px"}} onClick={() => { setMobileMenuOpen(false); onLoginClick() }}>로그인</button>
          )}
        </div>
      </div>
    </header>
  )
}
