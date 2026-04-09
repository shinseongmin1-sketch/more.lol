import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession } from '../utils/auth'
import { addPost } from '../utils/postsStore'
import './WritePostPage.css'

const CATEGORIES = ['자유게시판', '공략', '질문', '유머']
const CAT_DESC: Record<string, string> = {
  '자유게시판': '자유롭게 이야기해요',
  '공략': '챔피언 공략·빌드 공유',
  '질문': '궁금한 점을 물어보세요',
  '유머': '웃긴 경험담·짤 공유',
}
const CAT_ICON: Record<string, string> = {
  '자유게시판': '💬',
  '공략': '⚔️',
  '질문': '❓',
  '유머': '😂',
}

const MAX_TITLE   = 100
const MAX_CONTENT = 5000
const MAX_IMAGES  = 5

export default function WritePostPage() {
  const navigate = useNavigate()
  const user = getSession()

  const [category, setCategory] = useState('')
  const [title, setTitle]       = useState('')
  const [content, setContent]   = useState('')
  const [images, setImages]     = useState<string[]>([])
  const [error, setError]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const remaining = MAX_IMAGES - images.length
    const toProcess = files.slice(0, remaining)
    toProcess.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        setImages(prev => [...prev, ev.target!.result as string])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  if (!user) {
    return (
      <div className="write-unauth">
        <div className="write-unauth-icon">🔒</div>
        <p className="write-unauth-msg">로그인 후 글을 작성할 수 있습니다.</p>
        <button className="write-unauth-btn" onClick={() => navigate('/community')}>돌아가기</button>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!category)       { setError('카테고리를 선택해주세요.'); return }
    if (!title.trim())   { setError('제목을 입력해주세요.'); return }
    if (!content.trim()) { setError('내용을 입력해주세요.'); return }

    setSubmitting(true)
    addPost({
      title: title.trim(),
      content: content.trim(),
      category,
      authorId: user.id,
      authorNickname: user.nickname,
      images,
    })
    navigate('/community', { state: { posted: true } })
  }

  const ready = category && title.trim() && content.trim()

  return (
    <div className="write-page">
      {/* 상단 바 */}
      <div className="write-topbar">
        <button className="write-back-btn" onClick={() => navigate('/community')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          커뮤니티
        </button>
        <div className="write-topbar-title">새 글 작성</div>
        <div className="write-topbar-author">
          <div className="write-author-avatar">{user.nickname.slice(0, 1).toUpperCase()}</div>
          <span>{user.nickname}</span>
        </div>
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

          {/* 이미지 첨부 */}
          <div className="write-section">
            <div className="write-label">
              사진 첨부
              <span className="write-counter">{images.length} / {MAX_IMAGES}</span>
            </div>
            <div className="write-img-area">
              {images.map((src, idx) => (
                <div key={idx} className="write-img-thumb">
                  <img src={src} alt={`첨부 ${idx + 1}`} />
                  <button type="button" className="write-img-remove" onClick={() => removeImage(idx)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <button type="button" className="write-img-add" onClick={() => fileInputRef.current?.click()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                    <path d="M12 8v8M8 12h8"/>
                  </svg>
                  <span>사진 추가</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleImageAdd}
            />
          </div>

          {/* 에러 */}
          {error && (
            <div className="write-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* 하단 액션 바 */}
        <div className="write-footer">
          <div className="write-footer-left" />
          <div className="write-footer-actions">
            <button
              type="button"
              className="write-cancel-btn"
              onClick={() => navigate('/community')}
            >
              취소
            </button>
            <button
              type="submit"
              className={`write-submit-btn ${ready ? 'ready' : ''}`}
              disabled={submitting}
            >
              {submitting ? '등록 중...' : '게시하기'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
