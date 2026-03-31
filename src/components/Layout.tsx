import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import AuthModal from './AuthModal'
import { getSession, logout } from '../utils/auth'
import type { User } from '../utils/auth'
import { incrementSummonerSearch } from '../utils/searchStats'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const [showAuth, setShowAuth] = useState(false)
  const [user, setUser] = useState<User | null>(getSession)

  const handleSearch = (name: string) => {
    incrementSummonerSearch()
    navigate(`/summoner/${encodeURIComponent(name)}`)
  }

  const handleAuth = (u: User) => setUser(u)

  const handleLogout = () => {
    logout()
    setUser(null)
  }

  return (
    <div className="app">
      <Header
        onSearch={handleSearch}
        user={user}
        onLoginClick={() => setShowAuth(true)}
        onLogout={handleLogout}
      />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuth={handleAuth} />}
    </div>
  )
}
