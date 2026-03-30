import { useNavigate } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()

  const handleSearch = (name: string) => {
    navigate(`/summoner/${encodeURIComponent(name)}`)
  }

  return (
    <div className="app">
      <Header onSearch={handleSearch} />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
