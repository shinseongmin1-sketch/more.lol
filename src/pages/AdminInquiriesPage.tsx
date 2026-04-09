import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession, isAdmin } from '../utils/auth'
import { getInquiries, deleteInquiry } from '../utils/inquiryStore'
import type { Inquiry } from '../utils/inquiryStore'
import './AdminInquiriesPage.css'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function AdminInquiriesPage() {
  const navigate = useNavigate()
  const user = getSession()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin(user)) { navigate('/'); return }
    setInquiries(getInquiries())
  }, [])

  const handleDelete = (id: string) => {
    deleteInquiry(id)
    setInquiries(getInquiries())
    if (expanded === id) setExpanded(null)
  }

  if (!isAdmin(user)) return null

  return (
    <div className="aiq-page">
      <div className="aiq-header">
        <button className="aiq-back" onClick={() => navigate(-1)}>← 돌아가기</button>
        <h1 className="aiq-title">문의내역</h1>
        <span className="aiq-count">{inquiries.length}건</span>
      </div>

      {inquiries.length === 0 ? (
        <div className="aiq-empty">접수된 문의가 없습니다.</div>
      ) : (
        <div className="aiq-list">
          {inquiries.map(inq => (
            <div key={inq.id} className={`aiq-item ${expanded === inq.id ? 'open' : ''}`}>
              <div className="aiq-item-header" onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}>
                <div className="aiq-item-left">
                  <span className="aiq-type-badge">{inq.type}</span>
                  <span className="aiq-name">{inq.name}</span>
                  <span className="aiq-email">{inq.email}</span>
                </div>
                <div className="aiq-item-right">
                  <span className="aiq-date">{formatDate(inq.createdAt)}</span>
                  <svg className={`aiq-caret ${expanded === inq.id ? 'open' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 4l4 4 4-4" />
                  </svg>
                </div>
              </div>
              {expanded === inq.id && (
                <div className="aiq-item-body">
                  <p className="aiq-content">{inq.content}</p>
                  <div className="aiq-item-footer">
                    <button className="aiq-delete-btn" onClick={() => handleDelete(inq.id)}>삭제</button>
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
