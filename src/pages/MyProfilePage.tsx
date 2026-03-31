import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession } from '../utils/auth'
import { getPostsByUser, deletePost, formatDate } from '../utils/postsStore'
import type { Post } from '../utils/postsStore'
import './MyProfilePage.css'
import './SubPage.css'

const catColors: Record<string, string> = {
  '공략': '#4a90e2',
  '자유게시판': '#69db7c',
  '유머': '#ffd43b',
  '질문': '#ffa94d',
  '공지': '#ff6b6b',
}

const TABS = ['전체', '공략', '자유게시판', '질문', '유머']

export default function MyProfilePage() {
  const navigate = useNavigate()
  const user = getSession()
  const [activeTab, setActiveTab] = useState('전체')
  const [posts, setPosts] = useState(() => user ? getPostsByUser(user.id) : [])
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const handleDelete = (postId: string) => {
    deletePost(postId)
    setPosts(prev => prev.filter(p => p.id !== postId))
    setConfirmId(null)
  }

  if (!user) {
    return (
      <div className="profile-unauth">
        <div className="profile-unauth-icon">🔒</div>
        <p className="profile-unauth-msg">로그인이 필요한 페이지입니다.</p>
        <button className="profile-unauth-btn" onClick={() => navigate('/')}>홈으로 돌아가기</button>
      </div>
    )
  }

  const allPosts = posts
  const filtered = activeTab === '전체' ? allPosts : allPosts.filter(p => p.category === activeTab)

  const totalLikes = allPosts.reduce((sum, p) => sum + p.likes, 0)
  const totalViews = allPosts.reduce((sum, p) => sum + p.views, 0)

  const joinDate = new Date(user.createdAt)
  const joinStr = `${joinDate.getFullYear()}.${String(joinDate.getMonth() + 1).padStart(2, '0')}.${String(joinDate.getDate()).padStart(2, '0')}`

  return (
    <div className="subpage profile-page">
      {/* 헤더 */}
      <div className="subpage-header profile-header">
        <div className="subpage-header-inner">
          <div className="profile-hero">
            <div className="profile-info">
              <div className="profile-nickname">{user.nickname}</div>
              <div className="profile-id">@{user.id}</div>
              <div className="profile-join">가입일 {joinStr}</div>
            </div>
          </div>
          <div className="profile-stats-row">
            <div className="profile-stat">
              <span className="profile-stat-val">{allPosts.length}</span>
              <span className="profile-stat-label">작성 글</span>
            </div>
            <div className="profile-stat-divider" />
            <div className="profile-stat">
              <span className="profile-stat-val">{totalLikes.toLocaleString()}</span>
              <span className="profile-stat-label">받은 좋아요</span>
            </div>
            <div className="profile-stat-divider" />
            <div className="profile-stat">
              <span className="profile-stat-val">{totalViews.toLocaleString()}</span>
              <span className="profile-stat-label">총 조회수</span>
            </div>
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="subpage-body">
        <div className="profile-section-title">내 게시글</div>

        {/* 카테고리 탭 */}
        <div className="community-tabs" style={{ marginBottom: 0 }}>
          {TABS.map(tab => (
            <button
              key={tab}
              className={`community-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {tab === '전체'
                ? ` (${allPosts.length})`
                : ` (${allPosts.filter(p => p.category === tab).length})`}
            </button>
          ))}
        </div>

        {/* 게시글 목록 */}
        <div className="post-list profile-post-list">
          {filtered.length === 0 ? (
            <div className="profile-empty">
              <div className="profile-empty-icon">📝</div>
              <div className="profile-empty-title">아직 작성한 게시글이 없습니다</div>
              <div className="profile-empty-desc">커뮤니티에서 첫 글을 작성해보세요!</div>
              <button
                className="profile-empty-btn"
                onClick={() => navigate('/community')}
              >
                커뮤니티 가기
              </button>
            </div>
          ) : (
            filtered.map((post: Post) => (
              <div key={post.id} className="post-row profile-post-row" onClick={() => navigate(`/post/${post.id}`)}>
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
                <span className="post-views">조회 {post.views.toLocaleString()}</span>
                <span className="post-likes">❤ {post.likes}</span>
                <span className="post-time">{formatDate(post.createdAt)}</span>
                <div className="profile-post-actions" onClick={e => e.stopPropagation()}>
                  <button className="profile-edit-btn" onClick={() => navigate(`/edit/${post.id}`)}>수정</button>
                  {confirmId === post.id ? (
                    <>
                      <button className="profile-delete-yes" onClick={() => handleDelete(post.id)}>삭제</button>
                      <button className="profile-delete-no" onClick={() => setConfirmId(null)}>취소</button>
                    </>
                  ) : (
                    <button className="profile-delete-btn" onClick={() => setConfirmId(post.id)}>삭제</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
