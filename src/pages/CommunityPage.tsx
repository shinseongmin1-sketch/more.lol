import { useState } from 'react'
import './CommunityPage.css'
import './SubPage.css'

const categories = ['전체', '자유게시판', '공략', '질문', '유머', '공지']
const mockPosts = [
  { id: 1, cat: '공략', title: '요네 ARAM 공략 - 승률 60% 유지하는 법', author: '고수소환사', views: 4821, likes: 231, time: '30분 전', hot: true },
  { id: 2, cat: '자유게시판', title: '14.24 패치 이후 럭스 너무 강한거 아닌가요?', author: '럭스장인', views: 2344, likes: 87, time: '1시간 전', hot: true },
  { id: 3, cat: '유머', title: '팀원 전부 원딜 뽑힌 ARAM 결과.jpg', author: '비운의소환사', views: 8921, likes: 512, time: '2시간 전', hot: false },
  { id: 4, cat: '질문', title: '진 아이템 순서 질문입니다 크라켄 vs 구인수', author: '진입문자', views: 892, likes: 24, time: '3시간 전', hot: false },
  { id: 5, cat: '공략', title: '세라핀 서포터 룬 세팅 완전 정복', author: '세라핀마스터', views: 3211, likes: 143, time: '4시간 전', hot: false },
  { id: 6, cat: '자유게시판', title: '오늘 ARAM 5판 다 이겼다 인증', author: '운좋은사람', views: 1823, likes: 95, time: '5시간 전', hot: false },
  { id: 7, cat: '질문', title: '브론즈에서 골드까지 올리는 챔피언 추천해주세요', author: '탈출희망', views: 2103, likes: 67, time: '6시간 전', hot: false },
  { id: 8, cat: '공지', title: '[공지] more.lol 서비스 오픈 안내', author: '관리자', views: 12400, likes: 892, time: '1일 전', hot: false },
]
const catColors: Record<string, string> = { '공략': '#4a90e2', '자유게시판': '#69db7c', '유머': '#ffd43b', '질문': '#ffa94d', '공지': '#ff6b6b' }

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('전체')
  const filtered = activeTab === '전체' ? mockPosts : mockPosts.filter(p => p.cat === activeTab)
  return (
    <div className="subpage community-page">
      <div className="subpage-header">
        <div className="subpage-header-inner">
          <div>
            <h1 className="subpage-title">커뮤니티</h1>
            <p className="subpage-desc">공략, 팁, 자유게시판 · 소환사들과 소통하세요</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="patch-badge">커뮤니티</span>
            <button className="write-btn">✏️ 글쓰기</button>
          </div>
        </div>
      </div>
      <div className="subpage-body">
        <div className="community-layout">
          <div className="community-main">
            <div className="community-tabs">
              {categories.map(c => (
                <button key={c} className={`community-tab ${activeTab === c ? 'active' : ''}`} onClick={() => setActiveTab(c)}>{c}</button>
              ))}
            </div>
            <div className="post-list">
              {filtered.map(post => (
                <div key={post.id} className="post-row">
                  <span className="post-cat" style={{ color: catColors[post.cat] || 'var(--text-muted)', background: (catColors[post.cat] || '#888') + '15' }}>{post.cat}</span>
                  <div className="post-title-wrap">
                    <span className="post-title">{post.title}</span>
                    {post.hot && <span className="hot-badge">HOT</span>}
                  </div>
                  <span className="post-author">{post.author}</span>
                  <span className="post-views">조회 {post.views.toLocaleString()}</span>
                  <span className="post-likes">❤ {post.likes}</span>
                  <span className="post-time">{post.time}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="community-sidebar">
            <div className="sidebar-card">
              <div className="sidebar-title">🔥 인기글</div>
              {mockPosts.filter(p => p.hot || p.likes > 100).slice(0, 5).map(post => (
                <div key={post.id} className="sidebar-post">
                  <span className="sidebar-post-cat" style={{ color: catColors[post.cat] || 'var(--text-muted)' }}>[{post.cat}]</span>
                  <span className="sidebar-post-title">{post.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
