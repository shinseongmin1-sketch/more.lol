import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession, isAdmin } from '../utils/auth'
import { getReports, deleteReport } from '../utils/reportStore'
import type { Report } from '../utils/reportStore'
import './AdminInquiriesPage.css'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

export default function AdminReportsPage() {
  const navigate  = useNavigate()
  const user      = getSession()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin(user)) { navigate('/'); return }
    getReports().then(r => { setReports(r); setLoading(false) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id: string) => {
    const ok = await deleteReport(id)
    if (ok) {
      setReports(prev => prev.filter(r => r.id !== id))
      if (expanded === id) setExpanded(null)
    }
    setConfirmId(null)
  }

  if (!isAdmin(user)) return null

  return (
    <div className="aiq-page">
      <div className="aiq-header">
        <button className="aiq-back" onClick={() => navigate(-1)}>← 돌아가기</button>
        <h1 className="aiq-title">신고내역</h1>
        <span className="aiq-count">{reports.length}건</span>
      </div>

      {loading ? (
        <div className="aiq-empty">불러오는 중...</div>
      ) : reports.length === 0 ? (
        <div className="aiq-empty">접수된 신고가 없습니다.</div>
      ) : (
        <div className="aiq-list">
          {reports.map(r => (
            <div key={r.id} className={`aiq-item ${expanded === r.id ? 'open' : ''}`}>
              <div className="aiq-item-header" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                <div className="aiq-item-left">
                  <span className="aiq-type-badge" style={{ background: 'rgba(239,68,68,0.12)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.25)' }}>
                    {r.reason}
                  </span>
                  <span className="aiq-name">{r.reporterNickname}</span>
                  <span className="aiq-email" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    신고 게시글: {r.postTitle}
                  </span>
                </div>
                <div className="aiq-item-right">
                  <span className="aiq-date">{formatDate(r.createdAt)}</span>
                  <span className="aiq-chevron">{expanded === r.id ? '▲' : '▼'}</span>
                </div>
              </div>
              {expanded === r.id && (
                <div className="aiq-item-body">
                  <div className="aiq-field">
                    <span className="aiq-field-label">신고자</span>
                    <span className="aiq-field-val">{r.reporterNickname} ({r.reporterId})</span>
                  </div>
                  <div className="aiq-field">
                    <span className="aiq-field-label">신고 게시글</span>
                    <span
                      className="aiq-field-val"
                      style={{ color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => navigate(`/post/${r.postId}`)}
                    >
                      {r.postTitle}
                    </span>
                  </div>
                  <div className="aiq-field">
                    <span className="aiq-field-label">신고 사유</span>
                    <span className="aiq-field-val">{r.reason}</span>
                  </div>
                  {r.detail && (
                    <div className="aiq-field">
                      <span className="aiq-field-label">상세 내용</span>
                      <span className="aiq-field-val" style={{ whiteSpace: 'pre-wrap' }}>{r.detail}</span>
                    </div>
                  )}
                  <div className="aiq-item-footer">
                    {confirmId === r.id ? (
                      <>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>신고를 삭제할까요?</span>
                        <button className="aiq-delete-yes" onClick={() => handleDelete(r.id)}>삭제</button>
                        <button className="aiq-delete-no" onClick={() => setConfirmId(null)}>취소</button>
                      </>
                    ) : (
                      <button className="aiq-delete" onClick={() => setConfirmId(r.id)}>신고 삭제</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
