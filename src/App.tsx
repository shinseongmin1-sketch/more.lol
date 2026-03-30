import { useState } from 'react'
import Header from './components/Header'
import HeroSearch from './components/HeroSearch'
import NavTabs from './components/NavTabs'
import ChampionTierList from './components/ChampionTierList'
import Footer from './components/Footer'
import SummonerPage from './components/SummonerPage'
import './App.css'

export type PageType = 'home' | 'summoner'

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home')
  const [searchedSummoner, setSearchedSummoner] = useState('')
  const [activeMode, setActiveMode] = useState<'aram' | 'ranked' | 'normal'>('aram')

  const handleSearch = (name: string) => {
    setSearchedSummoner(name)
    setCurrentPage('summoner')
  }

  const handleLogoClick = () => {
    setCurrentPage('home')
    setSearchedSummoner('')
  }

  return (
    <div className="app">
      <Header onLogoClick={handleLogoClick} onSearch={handleSearch} showSearchInHeader={currentPage === 'summoner'} />
      {currentPage === 'home' && (
        <>
          <HeroSearch onSearch={handleSearch} />
          <NavTabs activeMode={activeMode} onModeChange={setActiveMode} />
          <ChampionTierList mode={activeMode} />
        </>
      )}
      {currentPage === 'summoner' && (
        <SummonerPage summonerName={searchedSummoner} />
      )}
      <Footer />
    </div>
  )
}

export default App
