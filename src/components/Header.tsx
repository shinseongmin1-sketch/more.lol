import { useState } from 'react'
import './Header.css'

interface HeaderProps {
  onLogoClick: () => void
  onSearch: (name: string) => void
  showSearchInHeader: boolean
}

export default function Header({ onLogoClick, onSearch, showSearchInHeader }: HeaderProps) {
  const [inputValue, setInputValue] = useState('')

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
          <div className="logo" onClick={onLogoClick}>
            <span className="logo-text">more</span>
            <span className="logo-dot">.lol</span>
          </div>
          <nav className="header-nav">
            <a href="#" className="nav-link active">ARAM</a>
            <a href="#" className="nav-link">랭크</a>
            <a href="#" className="nav-link">일반</a>
            <a href="#" className="nav-link">챔피언 분석</a>
          </nav>
        </div>

        <div className="header-right">
          {showSearchInHeader && (
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
            <button className="btn-ghost">한국어</button>
            <button className="btn-primary-sm">로그인</button>
          </div>
        </div>
      </div>
    </header>
  )
}
