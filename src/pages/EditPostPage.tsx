import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSession } from '../utils/auth'
import { getPostById, updatePost } from '../utils/postsStore'
import './WritePostPage.css'

const CATEGORIES = ['자유게시판', '공략', '질문', '유머']
const CAT_DESC: Record<string, string> = {
  '자유게시판': '자유롭게 이야기해요',
  '공략':      '챔피언 공략·빌드 공유',
  '질문':      '궁금한 점을 물어보세요',
  '유머':      '웃긴 경험담·짤 공유',
}
const CAT_ICON: Record<string, string> = {
  '자유게시판': '💬', '공략': '⚔️', '질문': '❓', '유머': '😂',
}

const MAX_TITLE   = 100
const MAX_CONTENT = 5000
const MAX_IMAGES  = 5

function resizeImage(file: File): Promise<string> {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const MAX = 1000
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX }
        else                { width  = Math.round(width  * MAX / height); height = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.src = url
  })
}

export default function EditPostPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user     = getSession()

  const [category,   setCategory]   = useState('')
  const [title,      setTitle]      = useState('')
  const [content,    setContent]    = useState('')
  const [images,     setImages]     = useState<string[]>([])
  const [error,      setError]      = useState('')
  const [ready,      setReady]      = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) { navigate('/community'); return }
    getPostById(id).then(post => {
      if (!post) { navigate('/community'); return }
      if (!user || user.id !== post.authorId) { navigate(`/post/${id}`); return }
      setCategory(post.category)
      setTitle(post.title)
      setContent(post.content)
      setImages(post.images ?? [])
    })
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setReady(!!(category && title.trim() && content.trim()))
  }, [category, title, content])

  const handleImageAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const remaining = MAX_IMAGES - images.length
    const resized   = await Promise.all(files.slice(0, remaining).map(resizeImage))
    setImages(prev => [...prev, ...resized])
    e.target.value = ''
  }

  const removeImage = (idx: number) => setImages(prev => prev.filter((_, i) => i !== idx))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!category)       { setError('카테고리를 선택해주세요.'); return }
    if (!title.trim())   { setError('제목을 입력해주세요.'); return }
    if (!content.trim()) { setError('내용을 입력해주세요.'); return }
    setSubmitting(true)
    const ok = await updatePost(id!, { category, title: title.trim(), content: content.trim(), images })
    if (!ok) {
      setError('수정에 실패했습니다. 잠시 후 다시 시도해주세요.')
      setSubmitting(false)
      return
    }
    navigate(`/post/${id}`)
  }

  return (
    <div className="write-page">
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
            <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageAdd} />
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

        <div className="write-footer">
          <div className="write-footer-left" />
          <div className="write-footer-actions">
            <button type="button" className="write-cancel-btn" onClick={() => navigate(`/post/${id}`)} disabled={submitting}>
              취소
            </button>
            <button type="submit" className={`write-submit-btn ${ready ? 'ready' : ''}`} disabled={submitting}>
              {submitting ? '저장 중...' : '수정 완료'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
