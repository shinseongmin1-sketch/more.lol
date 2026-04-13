import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession } from '../utils/auth'
import { getPostsByUser, deletePost, formatDate, getCommentCountByUser } from '../utils/postsStore'
import { calcCount, getLevelData, LEVELS } from '../utils/levelSystem'
import type { Post } from '../utils/postsStore'
import './MyProfilePage.css'
import './SubPage.css'

const catColors: Record<string, string> = {
  '공룡':    '#4a90e2',
  '자유게시판': '#69db7c',
  '유머':    '#ffd43b',
  '질문':    '#ffa94d',
  '공지':    '#ff6b6b',
}

const TABS = ['전체', '공룡', '자유게시판', '질문', '유머']

export default function MyProfilePage() {
  const navigate = useNavigate()
  const user     = getSession()

  const [posts, setPosts]               = useState<Post[]>([])
  const [commentCount, setCommentCount] = useState(0)
  const [loading, setLoading]           = useState(true)
  const [activeTab, setActiveTab]       = useState('전체')
  const [confirmId, setConfirmId]       = useState<string | null>(null)
  const [showAllLevels, setShowAllLevels] = useState(false)

  useEffect(() => {
    if (!user) return
    Promise.all([
      getPostsByUser(user.id),
      getCommentCountByUser(user.id),
    ]).then(([p, c]) => {
      setPosts(p)
      setCommentCount(c)
      setLoading(false)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (postId: string) => {
    const ok = await deletePost(postId)
    if (ok) setPosts(prev => prev.filter(p => p.id !== postId))
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

  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0)
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0)
  const joinDate   = new Date(user.createdAt)
  const joinStr    = `${joinDate.getFullYear()}.${String(joinDate.getMonth()+1).padStart(2,'0')}.${String(joinDate.getDate()).padStart(2,'0')}`

  const total   = calcCount(posts.length, commentCount, totalLikes)
  const lvData  = getLevelData(total)
  const { info: lv, next, progress, countInLevel, countForNext } = lvData

  const filtered = activeTab === '전체' ? posts : posts.filter(p => p.category === activeTab)

  return (
    <div className="subpage profile-page">
      <div className="subpage-header profile-header">
        <div className="subpage-header-inner">

          <div className="profile-hero">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar-lg">{user.nickname.slice(0,1).toUpperCase()}</div>
              <div className="profile-level-badge" style={{background: lv.bg, border: `1.5px solid ${lv.border}`, color: lv.color}}>
                Lv.{lv.level}
              </div>
            </div>
            <div className="profile-info">
              <div className="profile-name-row">
                <span className="profile-nickname">{user.nickname}</span>
                <span className="profile-rank-tag" style={{background: lv.bg, border: `1px solid ${lv.border}`, color: lv.color}}>
                  {lv.icon} {lv.name}
                </span>
              </div>
              <div className="profile-id">@{user.id}</div>
              <div className="profile-join">가입일 {joinStr}</div>
              <div className="profile-level-progress">
                <div className="profile-xp-bar-track">
                  <div className="profile-xp-bar-fill" style={{width: `${progress}%`, background: lv.color}} />
                </div>
                <span className="profile-level-progress-txt" style={{color: lv.color}}>
                  {next
                    ? `${countInLevel}/${countForNext}횟수 → ${next.icon}${next.name}`
                    : '최고 레벨 🎉'}
                </span>
              </div>
            </div>
          </div>

          <button className="profile-levels-toggle" onClick={() => setShowAllLevels(v => !v)}>
            {showAllLevels ? '레벨 목록 닫기 ▲' : '전체 레벨 보기 ▼'}
          </button>

          {showAllLevels && (
            <div className="profile-levels-grid">
              {LEVELS.map(l => {
                const reached   = total >= l.minCount
                const isCurrent = lv.level === l.level
                return (
                  <div
                    key={l.level}
                    className={`profile-level-card ${reached ? 'reached' : ''} ${isCurrent ? 'current' : ''}`}
                    style={reached ? {borderColor: l.border, background: l.bg} : {}}
                  >
                    {isCurrent && <div className="plc-current-dot" />}
                    <div className="plc-medal" style={{filter: reached ? 'none' : 'grayscale(1)', opacity: reached ? 1 : 0.3}}>
                      {l.icon}
                    </div>
                    <div className="plc-level" style={reached ? {color: l.color} : {}}>{l.level}</div>
                    <div className="plc-name"  style={reached ? {color: l.color, fontWeight: 700} : {}}>{l.name}</div>
                    <div className="plc-xp">{l.minCount}횟수~</div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="profile-stats-row">
            <div className="profile-stat">
              <span className="profile-stat-val">{posts.length}</span>
              <span className="profile-stat-label">작성 글</span>
            </div>
            <div className="profile-stat-divider" />
            <div className="profile-stat">
              <span className="profile-stat-val">{commentCount}</span>
              <span className="profile-stat-label">작성 댓글</span>
            </div>
            <div className="profile-stat-divider" />
            <div className="profile-stat">
              <span className="profile-stat-val">{totalLikes.toLocaleString()}</span>
              <span className="profile-stat-label">받은 좋아요</span>
            </div>
            <div className="profile-stat-divider" />
            <div className="profile-stat">
              <span className="profile-stat-val">{totalViews.toLocaleString()}</span>
              <span className="profile-stat-label">전체 조회수</span>
            </div>
          </div>
        </div>
      </div>

      <div className="subpage-body">
        <div className="profile-section-title">내 게시글</div>
        <div className="community-tabs" style={{ marginBottom: 0 }}>
          {TABS.map(tab => (
            <button
              key={tab}
              className={`community-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}{tab === '전체'
                ? ` (${posts.length})`
                : ` (${posts.filter(p => p.category === tab).length})`}
            </button>
          ))}
        </div>
        <div className="post-list profile-post-list">
          {loading ? (
            <div className="profile-empty">
              <div className="profile-empty-icon">⏳</div>
              <div className="profile-empty-title">불러오는 중...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="profile-empty">
              <div className="profile-empty-icon">📝</div>
              <div className="profile-empty-title">아직 작성한 게시글이 없습니다</div>
              <div className="profile-empty-desc">커뮤니티에서 첫 글을 작성해보세요!</div>
              <button className="profile-empty-btn" onClick={() => navigate('/community')}>커뮤니티 가기</button>
            </div>
          ) : (
            filtered.map((post: Post) => (
              <div
                key={post.id}
                className="post-row profile-post-row"
                onClick={() => navigate(`/post/${post.id}`)}
              >
                <span className="post-cat" style={{color: catColors[post.category]||'var(--text-muted)', background:(catColors[post.category]||'#888')+'15'}}>
                  {post.category}
                </span>
                <div className="post-title-wrap"><span className="post-title">{post.title}</span></div>
                <span className="post-views">조회 {post.views.toLocaleString()}</span>
                <span className="post-likes">❤ {post.likes}</span>
                <span className="post-time">{formatDate(post.createdAt)}</span>
                <div className="profile-post-actions" onClick={e => e.stopPropagation()}>
                  <button className="profile-edit-btn" onClick={() => navigate(`/edit/${post.id}`)}>
                    수정
                  </button>
                  {confirmId === post.id ? (
                    <>
                      <button className="profile-delete-yes" onClick={() => handleDelete(post.id)}>삭제</button>
                      <button className="profile-delete-no"  onClick={() => setConfirmId(null)}>취소</button>
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
