import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPosts, formatDate } from '../utils/postsStore'
import type { Post } from '../utils/postsStore'
import './CommunityPage.css'
import './SubPage.css'

const categories = ['전체', '자유게시판', '공략', '질문', '유머']
const catColors: Record<string, string> = {
  '공략':    '#4a90e2',
  '자유게시판': '#69db7c',
  '유머':    '#ffd43b',
  '질문':    '#ffa94d',
}

export default function CommunityPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('전체')
  const [allPosts, setAllPosts]   = useState<Post[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    getPosts().then(posts => {
      setAllPosts(posts)
      setLoading(false)
    })
  }, [])

  const pinned   = allPosts.filter(p => p.authorId === 'admin')
  const normal   = allPosts.filter(p => p.authorId !== 'admin')
  const pinnedFiltered = pinned.filter(p => activeTab === '전체' || p.category === activeTab)
  const normalFiltered = normal.filter(p => activeTab === '전체' || p.category === activeTab)
  const sortedFiltered = [...pinnedFiltered, ...normalFiltered]
  // 인기글 기준: 좋아요×10 + 조회수×0.1 점수, 최근 7일 이내 게시글 우선
  // 최소 조건: 좋아요 1개 이상, 공지글 제외
  const now = Date.now()
  const hotPosts = allPosts
    .filter(p => p.authorId !== 'admin' && p.likes >= 1)
    .map(p => {
      const ageDays = (now - new Date(p.createdAt).getTime()) / 86400000
      const timeBonus = Math.max(0, (7 - ageDays) / 7) * 15  // 7일 이내 최대 +15점
      const score = p.likes * 10 + p.views * 0.1 + timeBonus
      return { ...p, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

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
              {loading ? (
                <div className="community-empty">
                  <div className="community-empty-icon">⏳</div>
                  <div className="community-empty-title">불러오는 중...</div>
                </div>
              ) : sortedFiltered.length === 0 ? (
                <div className="community-empty">
                  <div className="community-empty-icon">📭</div>
                  <div className="community-empty-title">아직 게시글이 없습니다</div>
                  <div className="community-empty-desc">첫 번째 글을 작성해보세요!</div>
                  <button className="community-empty-btn" onClick={() => navigate('/write')}>
                    글쓰기
                  </button>
                </div>
              ) : (
                sortedFiltered.map((post: Post) => (
                  <div
                    key={post.id}
                    className={`post-row${post.authorId === 'admin' ? ' post-row-notice' : ''}`}
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    <span
                      className="post-cat"
                      style={{
                        color:      post.authorId === 'admin' ? '#1d4ed8' : (catColors[post.category] || 'var(--text-muted)'),
                        background: post.authorId === 'admin' ? 'rgba(59,130,246,0.12)' : ((catColors[post.category] || '#888') + '15'),
                      }}
                    >
                      {post.authorId === 'admin' ? '📌 공지' : post.category}
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
                  <div
                    key={post.id}
                    className="sidebar-post"
                    onClick={() => navigate(`/post/${post.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="sidebar-post-top">
                      <span className="sidebar-post-cat" style={{ color: catColors[post.category] || 'var(--text-muted)' }}>
                        [{post.category}]
                      </span>
                      <span className="sidebar-post-likes">❤ {post.likes}</span>
                    </div>
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
