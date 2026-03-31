import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPosts, formatDate } from '../utils/postsStore'
import type { Post } from '../utils/postsStore'
import './CommunityPage.css'
import './SubPage.css'

const categories = ['전체', '자유게시판', '공략', '질문', '유머']
const catColors: Record<string, string> = {
  '공략': '#4a90e2',
  '자유게시판': '#69db7c',
  '유머': '#ffd43b',
  '질문': '#ffa94d',
}

export default function CommunityPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('전체')

  const allPosts = getPosts()
  const filtered = activeTab === '전체' ? allPosts : allPosts.filter(p => p.category === activeTab)
  const hotPosts = allPosts.filter(p => p.likes >= 5).slice(0, 5)

  return (
    <div className="subpage community-page">
      <div className="subpage-header">
        <div className="subpage-header-inner">
          <div>
            <h1 className="subpage-title">커뮤니티</h1>
            <p className="subpage-desc">공략, 팁, 자유게시판 · 소환사들과 소통하세요</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="write-btn" onClick={() => navigate('/write')}>✏️ 글쓰기</button>
          </div>
        </div>
      </div>
      <div className="subpage-body">
        <div className="community-layout">
          <div className="community-main">
            <div className="community-tabs">
              {categories.map(c => (
                <button
                  key={c}
                  className={`community-tab ${activeTab === c ? 'active' : ''}`}
                  onClick={() => setActiveTab(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="post-list">
              {filtered.length === 0 ? (
                <div className="community-empty">
                  <div className="community-empty-icon">📭</div>
                  <div className="community-empty-title">아직 게시글이 없습니다</div>
                  <div className="community-empty-desc">첫 번째 글을 작성해보세요!</div>
                  <button className="community-empty-btn" onClick={() => navigate('/write')}>
                    글쓰기
                  </button>
                </div>
              ) : (
                filtered.map((post: Post) => (
                  <div key={post.id} className="post-row" onClick={() => navigate(`/post/${post.id}`)}>
                    <span
                      className="post-cat"
                      style={{
                        color: catColors[post.category] || 'var(--text-muted)',
                        background: (catColors[post.category] || '#888') + '15',
                      }}
                    >
                      {post.category}
                    </span>
                    <div className="post-title-wrap">
                      <span className="post-title">{post.title}</span>
                    </div>
                    <span className="post-author">{post.authorNickname}</span>
                    <span className="post-views">조회 {post.views.toLocaleString()}</span>
                    <span className="post-likes">❤ {post.likes}</span>
                    <span className="post-time">{formatDate(post.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="community-sidebar">
            <div className="sidebar-card">
              <div className="sidebar-title">🔥 인기글</div>
              {hotPosts.length === 0 ? (
                <div className="sidebar-empty">아직 인기글이 없습니다</div>
              ) : (
                hotPosts.map(post => (
                  <div key={post.id} className="sidebar-post">
                    <span className="sidebar-post-cat" style={{ color: catColors[post.category] || 'var(--text-muted)' }}>
                      [{post.category}]
                    </span>
                    <span className="sidebar-post-title">{post.title}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
