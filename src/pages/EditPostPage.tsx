import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSession } from '../utils/auth'
import { getPostById, updatePost } from '../utils/postsStore'
import './WritePostPage.css'

const CATEGORIES = ['자유게시판', '공략', '질문', '유머']
const CAT_DESC: Record<string, string> = {
  '자유게시판': '자유롭게 이야기해요',
  '공략': '챔피언 공략·빌드 공유',
  '질문': '궁금한 점을 물어보세요',
  '유머': '웃긴 경험담·짤 공유',
}
const CAT_ICON: Record<string, string> = {
  '자유게시판': '💬', '공략': '⚔️', '질문': '❓', '유머': '😂',
}

const MAX_TITLE   = 100
const MAX_CONTENT = 5000

export default function EditPostPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user     = getSession()

  const [category, setCategory] = useState('')
  const [title, setTitle]       = useState('')
  const [content, setContent]   = useState('')
  const [error, setError]       = useState('')
  const [ready, setReady]       = useState(false)

  useEffect(() => {
    if (!id) { navigate('/community'); return }
    const post = getPostById(id)
    if (!post) { navigate('/community'); return }
    if (!user || user.id !== post.authorId) { navigate(`/post/${id}`); return }
    setCategory(post.category)
    setTitle(post.title)
    setContent(post.content)
  }, [id, user, navigate])

  useEffect(() => {
    setReady(!!(category && title.trim() && content.trim()))
  }, [category, title, content])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!category)       { setError('카테고리를 선택해주세요.'); return }
    if (!title.trim())   { setError('제목을 입력해주세요.'); return }
    if (!content.trim()) { setError('내용을 입력해주세요.'); return }
    updatePost(id!, { category, title: title.trim(), content: content.trim() })
    navigate(`/post/${id}`)
  }

  return (
    <div className="write-page">
      {/* 상단 바 */}
      <div className="write-topbar">
        <button className="write-back-btn" onClick={() => navigate(`/post/${id}`)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          게시글
        </button>
        <div className="write-topbar-title">게시글 수정</div>
        {user && (
          <div className="write-topbar-author">
            <div className="write-author-avatar">{user.nickname.slice(0, 1).toUpperCase()}</div>
            <span>{user.nickname}</span>
          </div>
        )}
      </div>

      <form className="write-form" onSubmit={handleSubmit} noValidate>
        <div className="write-body">

          {/* 카테고리 */}
          <div className="write-section">
            <div className="write-label">카테고리 <span className="write-required">*</span></div>
            <div className="write-cat-grid">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`write-cat-card ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  <span className="write-cat-icon">{CAT_ICON[cat]}</span>
                  <span className="write-cat-name">{cat}</span>
                  <span className="write-cat-desc">{CAT_DESC[cat]}</span>
                  {category === cat && (
                    <span className="write-cat-check">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div className="write-section">
            <div className="write-label">
              제목 <span className="write-required">*</span>
              <span className="write-counter">{title.length} / {MAX_TITLE}</span>
            </div>
            <input
              className="write-title-input"
              type="text"
              placeholder="제목을 입력해주세요"
              value={title}
              maxLength={MAX_TITLE}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* 내용 */}
          <div className="write-section write-section-grow">
            <div className="write-label">
              내용 <span className="write-required">*</span>
              <span className={`write-counter ${content.length > MAX_CONTENT * 0.9 ? 'warn' : ''}`}>
                {content.length} / {MAX_CONTENT}
              </span>
            </div>
            <textarea
              className="write-content-input"
              placeholder="내용을 입력해주세요."
              value={content}
              maxLength={MAX_CONTENT}
              onChange={e => setContent(e.target.value)}
            />
          </div>

          {error && (
            <div className="write-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* 하단 */}
        <div className="write-footer">
          <div className="write-footer-left" />
          <div className="write-footer-actions">
            <button type="button" className="write-cancel-btn" onClick={() => navigate(`/post/${id}`)}>
              취소
            </button>
            <button type="submit" className={`write-submit-btn ${ready ? 'ready' : ''}`}>
              수정 완료
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
