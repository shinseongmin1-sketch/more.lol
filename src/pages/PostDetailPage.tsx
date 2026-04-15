import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSession, isAdmin } from '../utils/auth'
import {
  getPostById, incrementViews, toggleLike, isLikedByUser,
  toggleDislike, isDislikedByUser,
  getComments, addComment, deletePost, deleteComment, updateComment, formatDate,
} from '../utils/postsStore'
import { addReport, hasReportedLocally } from '../utils/reportStore'
import { getAvatar } from '../utils/avatarStore'
import type { Post, Comment } from '../utils/postsStore'
import './PostDetailPage.css'
import './SubPage.css'

const REPORT_REASONS = [
  '욕설 / 혐오 표현',
  '스팸 / 도배',
  '음란물 / 선정적 내용',
  '개인정보 침해',
  '허위 정보',
  '기타',
]

const catColors: Record<string, string> = {
  '공략': '#4a90e2', '자유게시판': '#69db7c',
  '유머': '#ffd43b', '질문': '#ffa94d',
}

export default function PostDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user     = getSession()

  const [post, setPost]                   = useState<Post | null>(null)
  const [liked, setLiked]                 = useState(false)
  const [likeCount, setLikeCount]         = useState(0)
  const [disliked, setDisliked]           = useState(false)
  const [dislikeCount, setDislikeCount]   = useState(0)
  const [comments, setComments]           = useState<Comment[]>([])
  const [commentText, setCommentText]     = useState('')
  const [notFound, setNotFound]           = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting]           = useState(false)
  const viewedRef = useRef(false)
  const [editingCommentId, setEditingCommentId]         = useState<string | null>(null)
  const [editingCommentText, setEditingCommentText]     = useState('')
  const [confirmDeleteComment, setConfirmDeleteComment] = useState<string | null>(null)
  const [reportOpen, setReportOpen]   = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetail, setReportDetail] = useState('')
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [reportDone, setReportDone]   = useState(false)

  const isAuthor     = user && post ? user.id === post.authorId : false
  const canManage    = isAuthor || isAdmin(user)
  const alreadyReported = user && post ? hasReportedLocally(user.id, post.id) : false

  const handleReport = async () => {
    if (!user || !post || !reportReason) return
    setReportSubmitting(true)
    await addReport({
      postId:           post.id,
      postTitle:        post.title,
      reporterId:       user.id,
      reporterNickname: user.nickname,
      reason:           reportReason,
      detail:           reportDetail.trim(),
    })
    setReportSubmitting(false)
    setReportDone(true)
    setTimeout(() => { setReportOpen(false); setReportDone(false); setReportReason(''); setReportDetail('') }, 1500)
  }

  useEffect(() => {
    if (!id) { setNotFound(true); return }

    const load = async () => {
      const found = await getPostById(id)
      if (!found) { setNotFound(true); return }

      setPost(found)
      setLikeCount(found.likes)
      setDislikeCount(found.dislikes ?? 0)

      if (!viewedRef.current) {
        viewedRef.current = true
        incrementViews(id) // fire-and-forget
      }

      const [likedVal, dislikedVal, postComments] = await Promise.all([
        user ? isLikedByUser(id, user.id)    : Promise.resolve(false),
        user ? isDislikedByUser(id, user.id) : Promise.resolve(false),
        getComments(id),
      ])
      setLiked(likedVal)
      setDisliked(dislikedVal)
      setComments(postComments)
    }

    load()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    if (!id) return
    setDeleting(true)
    await deletePost(id)
    navigate('/community')
  }


  const handleDeleteComment = async (commentId: string) => {
    const ok = await deleteComment(commentId)
    if (ok) {
      setComments(prev => prev.filter(c => c.id !== commentId))
      setConfirmDeleteComment(null)
    }
  }

  const handleEditComment = (c: Comment) => {
    setEditingCommentId(c.id)
    setEditingCommentText(c.content)
    setConfirmDeleteComment(null)
  }

  const handleSaveComment = async (commentId: string) => {
    if (!editingCommentText.trim()) return
    const ok = await updateComment(commentId, editingCommentText.trim())
    if (ok) {
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, content: editingCommentText.trim() } : c))
      setEditingCommentId(null)
    }
  }

  const handleLike = async () => {
    if (!user || !id) return
    const next = await toggleLike(id, user.id)
    setLiked(prev => !prev)
    setLikeCount(next)
  }

  const handleDislike = async () => {
    if (!user || !id) return
    const next = await toggleDislike(id, user.id)
    setDisliked(prev => !prev)
    setDislikeCount(next)
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !id || !commentText.trim()) return
    const newComment = await addComment({
      postId:          id,
      authorId:        user.id,
      authorNickname:  user.nickname,
      content:         commentText.trim(),
    })
    if (newComment) {
      setComments(prev => [...prev, newComment])
      setCommentText('')
    }
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

  if (!post) {
    return (
      <div className="post-notfound">
        <div className="post-notfound-icon">⏳</div>
        <p className="post-notfound-msg">불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="post-detail-page">
      <div className="post-topbar">
        <button className="post-back-btn" onClick={() => navigate('/community')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          커뮤니티
        </button>
        {canManage && (
          <div className="post-author-actions">
            {isAuthor && (
              <button className="post-edit-btn" onClick={() => navigate(`/edit/${id}`)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                수정
              </button>
            )}
            {confirmDelete ? (
              <div className="post-delete-confirm">
                <span>정말 삭제할까요?</span>
                <button className="post-delete-yes" onClick={handleDelete} disabled={deleting}>
                  {deleting ? '삭제 중...' : '삭제'}
                </button>
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
        <article className="post-card">
          <div className="post-card-meta">
            <span
              className="post-detail-cat"
              style={{
                color:      catColors[post.category] || 'var(--text-muted)',
                background: (catColors[post.category] || '#888') + '18',
              }}
            >
              {post.category}
            </span>
            <span className="post-card-time">{formatDate(post.createdAt)}</span>
          </div>

          <h1 className="post-card-title">{post.title}</h1>

          <div className="post-card-author">
            <div className="post-author-avatar">
              {getAvatar(post.authorId)
                ? <img src={getAvatar(post.authorId)!} alt="" className="author-avatar-img" />
                : post.authorNickname.slice(0, 1).toUpperCase()
              }
            </div>
            <div className="post-author-info">
              <span className="post-author-nick">{post.authorNickname}</span>
              <span className="post-author-sub">조회 {post.views.toLocaleString()}</span>
            </div>
          </div>

          <div className="post-card-divider" />
          <div className="post-card-content">{post.content}</div>

          {post.images && post.images.length > 0 && (
            <>
              <div className="post-card-divider" />
              <div className="post-images">
                {post.images.map((src, idx) =>
                  src.startsWith('data:video/') ? (
                    <video
                      key={idx}
                      src={src}
                      className="post-video"
                      controls
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img
                      key={idx}
                      src={src}
                      alt={`첨부 미디어 ${idx + 1}`}
                      className="post-img"
                      onClick={() => window.open(src, '_blank')}
                    />
                  )
                )}
              </div>
            </>
          )}

          <div className="post-card-divider" />

          <div className="post-reactions">
            <button
              className={`reaction-btn like-btn ${liked ? 'active' : ''} ${!user ? 'disabled' : ''}`}
              onClick={handleLike}
              title={user ? undefined : '로그인 후 이용할 수 있습니다'}
            >
              <span className="reaction-icon">👍</span>
              <span className="reaction-label">좋아요</span>
              <span className="reaction-count">{likeCount}</span>
            </button>
            <button
              className={`reaction-btn dislike-btn ${disliked ? 'active' : ''} ${!user ? 'disabled' : ''}`}
              onClick={handleDislike}
              title={user ? undefined : '로그인 후 이용할 수 있습니다'}
            >
              <span className="reaction-icon">👎</span>
              <span className="reaction-label">싫어요</span>
              <span className="reaction-count">{dislikeCount}</span>
            </button>
            {user && !isAuthor && (
              <button
                className={`reaction-btn report-btn ${alreadyReported ? 'disabled' : ''}`}
                onClick={() => !alreadyReported && setReportOpen(true)}
                title={alreadyReported ? '이미 신고한 게시글입니다' : '신고하기'}
              >
                <span className="reaction-icon">🚨</span>
                <span className="reaction-label">{alreadyReported ? '신고완료' : '신고하기'}</span>
              </button>
            )}
          </div>

          {/* 신고 모달 */}
          {reportOpen && (
            <div className="report-modal-overlay" onClick={() => setReportOpen(false)}>
              <div className="report-modal" onClick={e => e.stopPropagation()}>
                <div className="report-modal-title">🚨 신고하기</div>
                <div className="report-modal-desc">신고 사유를 선택해주세요.</div>
                <div className="report-reasons">
                  {REPORT_REASONS.map(r => (
                    <button
                      key={r}
                      className={`report-reason-btn ${reportReason === r ? 'selected' : ''}`}
                      onClick={() => setReportReason(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <textarea
                  className="report-detail-input"
                  placeholder="추가 설명 (선택사항)"
                  value={reportDetail}
                  onChange={e => setReportDetail(e.target.value)}
                  rows={3}
                />
                {reportDone ? (
                  <div className="report-done">✅ 신고가 접수되었습니다.</div>
                ) : (
                  <div className="report-modal-footer">
                    <button className="report-cancel-btn" onClick={() => setReportOpen(false)}>취소</button>
                    <button
                      className="report-submit-btn"
                      onClick={handleReport}
                      disabled={!reportReason || reportSubmitting}
                    >
                      {reportSubmitting ? '접수 중...' : '신고 접수'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </article>

        <section className="comment-section">
          <div className="comment-section-title">
            댓글 <span className="comment-count-badge">{comments.length}</span>
          </div>

          {user ? (
            <form className="comment-form" onSubmit={handleComment}>
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

          <div className="comment-list">
            {comments.length === 0 ? (
              <div className="comment-empty">첫 번째 댓글을 남겨보세요!</div>
            ) : (
              comments.map(c => {
                const isMyComment = !!(user && c.authorId === user.id)
                const isEditing   = editingCommentId === c.id
                const confirmDel  = confirmDeleteComment === c.id
                return (
                  <div key={c.id} className="comment-item">
                    <div className="comment-avatar">
                      {getAvatar(c.authorId)
                        ? <img src={getAvatar(c.authorId)!} alt="" className="author-avatar-img" />
                        : c.authorNickname.slice(0, 1).toUpperCase()
                      }
                    </div>
                    <div className="comment-body">
                      <div className="comment-header">
                        <span className="comment-nick">{c.authorNickname}</span>
                        <span className="comment-time">{formatDate(c.createdAt)}</span>
                        {isMyComment && !isEditing && (
                          <div className="comment-actions">
                            {confirmDel ? (
                              <>
                                <span className="comment-confirm-text">삭제할까요?</span>
                                <button className="comment-action-yes" onClick={() => handleDeleteComment(c.id)}>삭제</button>
                                <button className="comment-action-no" onClick={() => setConfirmDeleteComment(null)}>취소</button>
                              </>
                            ) : (
                              <>
                                <button className="comment-action-btn" onClick={() => handleEditComment(c)}>수정</button>
                                <button className="comment-action-btn delete" onClick={() => setConfirmDeleteComment(c.id)}>삭제</button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      {isEditing ? (
                        <div className="comment-edit-area">
                          <textarea
                            className="comment-input"
                            value={editingCommentText}
                            onChange={e => setEditingCommentText(e.target.value)}
                            rows={3}
                            autoFocus
                          />
                          <div className="comment-edit-footer">
                            <button className="comment-edit-save" onClick={() => handleSaveComment(c.id)} disabled={!editingCommentText.trim()}>저장</button>
                            <button className="comment-edit-cancel" onClick={() => setEditingCommentId(null)}>취소</button>
                          </div>
                        </div>
                      ) : (
                        <p className="comment-content">{c.content}</p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
