import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'

declare global {
  interface Window { gtag?: (...args: unknown[]) => void }
}
import HomePage from './pages/HomePage'
import AramPage from './pages/AramPage'
import RankedPage from './pages/RankedPage'
import NormalPage from './pages/NormalPage'
import ChampionPage from './pages/ChampionPage'
import ChampionDetailPage from './pages/ChampionDetailPage'
import CommunityPage from './pages/CommunityPage'
import SummonerPage from './pages/SummonerPage'
import NoticePage from './pages/NoticePage'
import FaqPage from './pages/FaqPage'
import ContactPage from './pages/ContactPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import MyProfilePage from './pages/MyProfilePage'
import WritePostPage from './pages/WritePostPage'
import PostDetailPage from './pages/PostDetailPage'
import EditPostPage from './pages/EditPostPage'
import ProfileSettingsPage from './pages/ProfileSettingsPage'
import RankingPage from './pages/RankingPage'
import MostChampsPage from './pages/MostChampsPage'
import AdminInquiriesPage from './pages/AdminInquiriesPage'
import AdminReportsPage from './pages/AdminReportsPage'
import './App.css'

function App() {
  const location = useLocation()

  useEffect(() => {
    window.gtag?.('event', 'page_view', {
      page_path: location.pathname + location.search,
    })
  }, [location])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/aram" element={<AramPage />} />
        <Route path="/ranked" element={<RankedPage />} />
        <Route path="/normal" element={<NormalPage />} />
        <Route path="/champion" element={<ChampionPage />} />
        <Route path="/champion/:champId" element={<ChampionDetailPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/summoner/:name" element={<SummonerPage />} />
        <Route path="/summoner/:name/champions" element={<MostChampsPage />} />
        <Route path="/notice" element={<NoticePage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/profile" element={<MyProfilePage />} />
        <Route path="/write" element={<WritePostPage />} />
        <Route path="/post/:id" element={<PostDetailPage />} />
        <Route path="/edit/:id" element={<EditPostPage />} />
        <Route path="/settings" element={<ProfileSettingsPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/admin/inquiries" element={<AdminInquiriesPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
      </Routes>
    </Layout>
  )
}

export default App
