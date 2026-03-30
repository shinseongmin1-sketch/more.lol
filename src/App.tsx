import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AramPage from './pages/AramPage'
import RankedPage from './pages/RankedPage'
import NormalPage from './pages/NormalPage'
import ChampionPage from './pages/ChampionPage'
import CommunityPage from './pages/CommunityPage'
import SummonerPage from './pages/SummonerPage'
import './App.css'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/aram" element={<AramPage />} />
        <Route path="/ranked" element={<RankedPage />} />
        <Route path="/normal" element={<NormalPage />} />
        <Route path="/champion" element={<ChampionPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/summoner/:name" element={<SummonerPage />} />
      </Routes>
    </Layout>
  )
}

export default App
