import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSession } from '../utils/auth'
import {
  getPostById, incrementViews, toggleLike, isLikedByUser,
  getComments, addComment, deletePost, formatDate,
} from '../utils/postsStore'
import type { Post, Comment } from '../utils/postsStore'
import './PostDetailPage.css'
import './SubPage.css'

const catColors: Record<string, string> = {
  '공략': '#4a90e2', '자유게시판': '#69db7c',
  '유머': '#ffd43b', '질문': '#ffa94d',
}

export default function PostDetailPage() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const user       = getSession()

  const [post, setPost]         = useState<Post | null>(null)
  const [liked, setLiked]       = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const viewedRef = useRef(false)
  const isAuthor = user && post ? user.id === post.authorId : false

  useEffect(() => {
    if (!id) { setNotFound(true); return }
    const found = getPostById(id)
    if (!found) { setNotFound(true); return }

    // 조회수 1회만 증가
    if (!viewedRef.current) {
      incrementViews(id)
      viewedRef.current = true
    }

    const updated = getPostById(id)!
    setPost(updated)
    setLikeCount(updated.likes)
    setLiked(user ? isLikedByUser(id, user.id) : false)
    setComments(getComments(id))
  }, [id, user])

  const handleDelete = () => {
    if (!id) return
    deletePost(id)
    navigate('/community')
  }

  const handleLike = () => {
    if (!user || !id) return
    const next = toggleLike(id, user.id)
    setLiked(prev => !prev)
    setLikeCount(next)
  }

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !id || !commentText.trim()) return
    const newComment = addComment({
      postId: id,
      authorId: user.id,
      authorNickname: user.nickname,
      content: commentText.trim(),
    })
    setComments(prev => [...prev, newComment])
    setCommentText('')
  }

  if (notFound) {
    return (
      <div className="post-notfound">
        <div className="post-notfound-icon">🔍</div>
        <p className="post-notfound-msg">게시글을 찾을 수 없습니다.</p>
        <button className="post-notfound-btn" onClick={() => navigate('/community')}>커뮤니티로 돌아가기</button>
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="post-detail-page">
      {/* 상단 바 */}
      <div className="post-topbar">
        <button className="post-back-btn" onClick={() => navigate('/community')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          커뮤니티
        </button>
        {isAuthor && (
          <div className="post-author-actions">
            <button className="post-edit-btn" onClick={() => navigate(`/edit/${id}`)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              수정
            </button>
            {confirmDelete ? (
              <div className="post-delete-confirm">
                <span>정말 삭제할까요?</span>
                <button className="post-delete-yes" onClick={handleDelete}>삭제</button>
                <button className="post-delete-no" onClick={() => setConfirmDelete(false)}>취소</button>
              </div>
            ) : (
              <button className="post-delete-btn" onClick={() => setConfirmDelete(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
                삭제
              </button>
            )}
          </div>
        )}
      </div>

      <div className="post-detail-body">

        {/* 게시글 카드 */}
        <article className="post-card">
          {/* 카테고리 + 메타 */}
          <div className="post-card-meta">
            <span
              className="post-detail-cat"
              style={{
                color: catColors[post.category] || 'var(--text-muted)',
                background: (catColors[post.category] || '#888') + '18',
              }}
            >
              {post.category}
            </span>
            <span className="post-card-time">{formatDate(post.createdAt)}</span>
          </div>

          {/* 제목 */}
          <h1 className="post-card-title">{post.title}</h1>

          {/* 작성자 */}
          <div className="post-card-author">
            <div className="post-author-avatar">
              {post.authorNickname.slice(0, 1).toUpperCase()}
            </div>
            <div className="post-author-info">
              <span className="post-author-nick">{post.authorNickname}</span>
              <span className="post-author-sub">조회 {post.views.toLocaleString()}</span>
            </div>
          </div>

          <div className="post-card-divider" />

          {/* 본문 */}
          <div className="post-card-content">{post.content}</div>

          <div className="post-card-divider" />

          {/* 공감 버튼 */}
          <div className="post-reactions">
            <button
              className={`reaction-btn ${liked ? 'active' : ''} ${!user ? 'disabled' : ''}`}
              onClick={handleLike}
              title={user ? undefined : '로그인 후 공감할 수 있습니다'}
            >
              <span className="reaction-icon">{liked ? '❤️' : '🤍'}</span>
              <span className="reaction-label">공감</span>
              <span className="reaction-count">{likeCount}</span>
            </button>
          </div>
        </article>

        {/* 댓글 */}
        <section className="comment-section">
          <div className="comment-section-title">
            댓글 <span className="comment-count-badge">{comments.length}</span>
          </div>

          {/* 댓글 입력 */}
          {user ? (
            <form className="comment-form" onSubmit={handleComment}>
              <div className="comment-form-avatar">
                {user.nickname.slice(0, 1).toUpperCase()}
              </div>
              <div className="comment-form-right">
                <textarea
                  className="comment-input"
                  placeholder="댓글을 입력해주세요."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  rows={3}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleComment(e as unknown as React.FormEvent)
                  }}
                />
                <div className="comment-form-footer">
                  <span className="comment-form-hint">Ctrl+Enter로 등록</span>
                  <button
                    type="submit"
                    className={`comment-submit-btn ${commentText.trim() ? 'ready' : ''}`}
                    disabled={!commentText.trim()}
                  >
                    등록
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="comment-login-prompt">
              <span>댓글을 작성하려면 로그인이 필요합니다.</span>
            </div>
          )}

          {/* 댓글 목록 */}
          <div className="comment-list">
            {comments.length === 0 ? (
              <div className="comment-empty">첫 번째 댓글을 남겨보세요!</div>
            ) : (
              comments.map(c => (
                <div key={c.id} className="comment-item">
                  <div className="comment-avatar">
                    {c.authorNickname.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="comment-body">
                    <div className="comment-header">
                      <span className="comment-nick">{c.authorNickname}</span>
                      <span className="comment-time">{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="comment-content">{c.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
