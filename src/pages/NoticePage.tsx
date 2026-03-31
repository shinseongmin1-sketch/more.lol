import { useState } from 'react'
import { getSession } from '../utils/auth'
import { getNotices, addNotice, deleteNotice, incrementNoticeViews, isAdmin } from '../utils/noticeStore'
import type { Notice } from '../utils/noticeStore'
import './SubPage.css'
import './NoticePage.css'

const TAG_OPTIONS = [
  { value: 'general', label: '일반' },
  { value: 'update',  label: '업데이트' },
  { value: 'event',   label: '이벤트' },
  { value: 'check',   label: '점검' },
] as const

export default function NoticePage() {
  const user    = getSession()
  const admin   = isAdmin(user?.id)

  const [notices, setNotices]           = useState<Notice[]>(getNotices)
  const [selected, setSelected]         = useState<Notice | null>(null)
  const [showWrite, setShowWrite]       = useState(false)
  const [confirmDel, setConfirmDel]     = useState<string | null>(null)

  // 작성 폼 state
  const [wTag,     setWTag]     = useState<'general'|'update'|'event'|'check'>('general')
  const [wTitle,   setWTitle]   = useState('')
  const [wContent, setWContent] = useState('')
  const [wPinned,  setWPinned]  = useState(false)
  const [wError,   setWError]   = useState('')

  const refresh = () => setNotices(getNotices())

  const handleWrite = (e: React.FormEvent) => {
    e.preventDefault()
    setWError('')
    if (!wTitle.trim())   { setWError('제목을 입력해주세요.'); return }
    if (!wContent.trim()) { setWError('내용을 입력해주세요.'); return }
    addNotice({ tag: wTag, title: wTitle.trim(), content: wContent.trim(), pinned: wPinned })
    refresh()
    setShowWrite(false)
    setWTag('general'); setWTitle(''); setWContent(''); setWPinned(false)
  }

  const handleDelete = (id: string) => {
    deleteNotice(id)
    refresh()
    setConfirmDel(null)
    if (selected?.id === id) setSelected(null)
  }

  const pinnedList = notices.filter(n => n.pinned)
  const normalList = notices.filter(n => !n.pinned)
  const ordered    = [...pinnedList, ...normalList]

  return (
    <div className="subpage notice-page">
      <div className="subpage-header">
        <div className="subpage-header-inner">
          <div>
            <h1 className="subpage-title">공지사항</h1>
            <p className="subpage-desc">more.lol 서비스 업데이트, 점검, 이벤트 공지</p>
          </div>
          <div className="subpage-meta" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="patch-badge">공식 채널</span>
            <span className="update-info"><span className="update-dot" />최신 공지</span>
            {admin && (
              <button className="notice-write-btn" onClick={() => setShowWrite(true)}>
                + 공지 작성
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="subpage-body">
        {/* 목록 */}
        {selected === null ? (
          <div className="notice-list">
            {ordered.map(n => (
              <div
                key={n.id}
                className={`notice-item${n.pinned ? ' pinned' : ''}`}
                onClick={() => { incrementNoticeViews(n.id); refresh(); setSelected({ ...n, views: n.views + 1 }) }}
              >
                {n.pinned
                  ? <span className="notice-tag pin">📌 고정</span>
                  : <span className={`notice-tag ${n.tag}`}>{n.tagLabel}</span>}
                <div className="notice-content">
                  <div className="notice-title">
                    {n.title}
                    {n.isNew && <span className="notice-new">NEW</span>}
                  </div>
                  <div className="notice-meta">
                    <span>{n.date}</span>
                    <span>조회 {n.views.toLocaleString()}</span>
                  </div>
                </div>
                {admin && (
                  <div className="notice-admin-actions" onClick={e => e.stopPropagation()}>
                    {confirmDel === n.id ? (
                      <>
                        <button className="notice-del-yes" onClick={() => handleDelete(n.id)}>삭제</button>
                        <button className="notice-del-no"  onClick={() => setConfirmDel(null)}>취소</button>
                      </>
                    ) : (
                      <button className="notice-del-btn" onClick={() => setConfirmDel(n.id)}>삭제</button>
                    )}
                  </div>
                )}
                <span className="notice-arrow">›</span>
              </div>
            ))}
          </div>
        ) : (
          /* 상세 보기 */
          <div className="notice-detail">
            <button className="notice-back-btn" onClick={() => setSelected(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              목록으로
            </button>
            <div className="notice-detail-card">
              <div className="notice-detail-header">
                <span className={`notice-tag ${selected.pinned ? 'pin' : selected.tag}`}>
                  {selected.pinned ? '📌 고정' : selected.tagLabel}
                </span>
                <div className="notice-detail-title">{selected.title}</div>
                <div className="notice-detail-meta">
                  <span>관리자</span>
                  <span>·</span>
                  <span>{selected.date}</span>
                  <span>·</span>
                  <span>조회 {selected.views.toLocaleString()}</span>
                </div>
              </div>
              <div className="notice-detail-divider" />
              <div className="notice-detail-content">{selected.content}</div>
            </div>
            <button className="notice-back-btn bottom" onClick={() => setSelected(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              목록으로
            </button>
          </div>
        )}
      </div>

      {/* 공지 작성 모달 */}
      {showWrite && (
        <div className="notice-modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setShowWrite(false) }}>
          <div className="notice-modal">
            <div className="notice-modal-header">
              <span className="notice-modal-title">공지사항 작성</span>
              <button className="notice-modal-close" onClick={() => setShowWrite(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <form className="notice-modal-form" onSubmit={handleWrite} noValidate>
              {/* 태그 */}
              <div className="notice-modal-field">
                <label className="notice-modal-label">분류</label>
                <div className="notice-tag-chips">
                  {TAG_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`notice-tag-chip ${wTag === opt.value ? 'active' : ''}`}
                      onClick={() => setWTag(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* 제목 */}
              <div className="notice-modal-field">
                <label className="notice-modal-label">제목</label>
                <input
                  className="notice-modal-input"
                  type="text"
                  placeholder="공지 제목을 입력하세요"
                  value={wTitle}
                  maxLength={100}
                  onChange={e => setWTitle(e.target.value)}
                  autoFocus
                />
              </div>
              {/* 내용 */}
              <div className="notice-modal-field">
                <label className="notice-modal-label">내용</label>
                <textarea
                  className="notice-modal-textarea"
                  placeholder="공지 내용을 입력하세요"
                  value={wContent}
                  onChange={e => setWContent(e.target.value)}
                  rows={8}
                />
              </div>
              {/* 고정 */}
              <label className="notice-pin-toggle">
                <input
                  type="checkbox"
                  checked={wPinned}
                  onChange={e => setWPinned(e.target.checked)}
                />
                <span className="notice-pin-box" />
                <span className="notice-pin-label">📌 상단 고정</span>
              </label>
              {wError && (
                <div className="notice-modal-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                  </svg>
                  {wError}
                </div>
              )}
              <div className="notice-modal-footer">
                <button type="button" className="notice-modal-cancel" onClick={() => setShowWrite(false)}>취소</button>
                <button type="submit" className="notice-modal-submit">공지 등록</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
