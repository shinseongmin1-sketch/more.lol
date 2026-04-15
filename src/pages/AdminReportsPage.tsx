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

interface ReportGroup {
  key:             string
  isComment:       boolean
  postId:          string
  postTitle:       string
  commentId?:      string
  commentContent?: string
  reports:         Report[]
  latestAt:        string
}

function groupReports(reports: Report[]): ReportGroup[] {
  const map = new Map<string, ReportGroup>()
  for (const r of reports) {
    const key = r.commentId ?? r.postId
    if (!map.has(key)) {
      map.set(key, {
        key,
        isComment:      !!r.commentId,
        postId:         r.postId,
        postTitle:      r.postTitle,
        commentId:      r.commentId,
        commentContent: r.commentContent,
        reports:        [],
        latestAt:       r.createdAt,
      })
    }
    const g = map.get(key)!
    g.reports.push(r)
    if (r.createdAt > g.latestAt) g.latestAt = r.createdAt
  }
  return Array.from(map.values()).sort((a, b) => b.latestAt.localeCompare(a.latestAt))
}

export default function AdminReportsPage() {
  const navigate = useNavigate()
  const user     = getSession()
  const [reports, setReports]     = useState<Report[]>([])
  const [loading, setLoading]     = useState(true)
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin(user)) { navigate('/'); return }
    getReports().then(r => { setReports(r); setLoading(false) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id: string) => {
    const ok = await deleteReport(id)
    if (ok) setReports(prev => prev.filter(r => r.id !== id))
    setConfirmId(null)
  }

  if (!isAdmin(user)) return null

  const groups = groupReports(reports)

  return (
    <div className="aiq-page">
      <div className="aiq-header">
        <button className="aiq-back" onClick={() => navigate(-1)}>← 돌아가기</button>
        <h1 className="aiq-title">신고내역</h1>
        <span className="aiq-count">{reports.length}건 · {groups.length}개 대상</span>
      </div>

      {loading ? (
        <div className="aiq-empty">불러오는 중...</div>
      ) : groups.length === 0 ? (
        <div className="aiq-empty">접수된 신고가 없습니다.</div>
      ) : (
        <div className="aiq-list">
          {groups.map(g => (
            <div key={g.key} className={`aiq-item ${expanded === g.key ? 'open' : ''}`}>

              {/* 그룹 헤더 */}
              <div className="aiq-item-header" onClick={() => setExpanded(expanded === g.key ? null : g.key)}>
                <div className="aiq-item-left">
                  <span className="aiq-type-badge" style={g.isComment
                    ? { background: 'rgba(168,85,247,0.12)', color: '#9333ea', border: '1px solid rgba(168,85,247,0.25)' }
                    : { background: 'rgba(59,130,246,0.12)',  color: '#2563eb', border: '1px solid rgba(59,130,246,0.25)' }
                  }>
                    {g.isComment ? '댓글 신고' : '게시글 신고'}
                  </span>
                  {g.reports.length > 1 && (
                    <span className="aiq-type-badge" style={{ background: 'rgba(239,68,68,0.12)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.3)', fontWeight: 800 }}>
                      {g.reports.length}명 신고
                    </span>
                  )}
                  <span className="aiq-name">
                    {g.isComment
                      ? `"${(g.commentContent ?? '').slice(0, 28)}${(g.commentContent ?? '').length > 28 ? '…' : ''}"`
                      : g.postTitle
                    }
                  </span>
                  {g.isComment && (
                    <span className="aiq-email" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      게시글: {g.postTitle}
                    </span>
                  )}
                </div>
                <div className="aiq-item-right">
                  <span className="aiq-date">{formatDate(g.latestAt)}</span>
                  <span className="aiq-chevron">{expanded === g.key ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* 펼침 */}
              {expanded === g.key && (
                <div className="aiq-item-body">
                  {/* 대상 정보 */}
                  <div className="aiq-field">
                    <span className="aiq-field-label">{g.isComment ? '속한 게시글' : '신고 게시글'}</span>
                    <span
                      className="aiq-field-val"
                      style={{ color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => navigate(`/post/${g.postId}`)}
                    >
                      {g.postTitle}
                    </span>
                  </div>
                  {g.isComment && (
                    <div className="aiq-field">
                      <span className="aiq-field-label">신고 댓글 내용</span>
                      <span className="aiq-field-val" style={{
                        whiteSpace: 'pre-wrap', display: 'block',
                        background: 'rgba(168,85,247,0.06)', padding: '6px 10px',
                        borderRadius: 7, border: '1px solid rgba(168,85,247,0.15)'
                      }}>
                        {g.commentContent}
                      </span>
                    </div>
                  )}

                  {/* 개별 신고 목록 */}
                  <div style={{ marginTop: 14 }}>
                    <div className="aiq-field-label" style={{ marginBottom: 8 }}>
                      신고 목록 ({g.reports.length}건)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {g.reports.map((r, idx) => (
                        <div key={r.id} style={{
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 10, padding: '12px 14px',
                          display: 'flex', flexDirection: 'column', gap: 6
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', minWidth: 20 }}>#{idx + 1}</span>
                            <span className="aiq-type-badge" style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.25)' }}>
                              {r.reason}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                              {r.reporterNickname}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                              {formatDate(r.createdAt)}
                            </span>
                          </div>
                          {r.detail && (
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', paddingLeft: 26, whiteSpace: 'pre-wrap' }}>
                              {r.detail}
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                            {confirmId === r.id ? (
                              <>
                                <span style={{ fontSize: 13, color: 'var(--text-muted)', marginRight: 8, alignSelf: 'center' }}>삭제할까요?</span>
                                <button className="aiq-delete-yes" onClick={() => handleDelete(r.id)}>삭제</button>
                                <button className="aiq-delete-no" onClick={() => setConfirmId(null)}>취소</button>
                              </>
                            ) : (
                              <button className="aiq-delete" onClick={() => setConfirmId(r.id)}>신고 삭제</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
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
