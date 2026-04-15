import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession, isAdmin } from '../utils/auth'
import './AdminInquiriesPage.css'
import './AdminUsersPage.css'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

function h() {
  return {
    'Content-Type': 'application/json',
    apikey:        SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  }
}

interface UserRow { id: string; nickname: string; created_at: string }
interface UserInfo {
  id: string; nickname: string; createdAt: string
  postCount: number; commentCount: number
}
interface ReportStat {
  postReports: number
  commentReports: number
  loading: boolean
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function joinDaysAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days === 0) return '오늘 가입'
  return `${days}일 전 가입`
}

const AVATAR_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f97316','#10b981','#0ea5e9','#f59e0b','#14b8a6',
]
function avatarColor(id: string) {
  let n = 0; for (const c of id) n += c.charCodeAt(0)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

async function getAllUsers(): Promise<UserInfo[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return []
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/community_users?select=id,nickname,created_at&order=created_at.desc`,
    { headers: h() }
  ).catch(() => null)
  if (!res?.ok) return []
  const users: UserRow[] = await res.json()
  const counts = await Promise.all(users.map(async u => {
    const [pr, cr] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/community_posts?author_id=eq.${encodeURIComponent(u.id)}&category=neq.__신고__&select=id`, { headers: h() }).catch(() => null),
      fetch(`${SUPABASE_URL}/rest/v1/community_comments?author_id=eq.${encodeURIComponent(u.id)}&select=id`, { headers: h() }).catch(() => null),
    ])
    return {
      postCount:    pr?.ok ? (await pr.json()).length : 0,
      commentCount: cr?.ok ? (await cr.json()).length : 0,
    }
  }))
  return users.map((u, i) => ({ id: u.id, nickname: u.nickname, createdAt: u.created_at, ...counts[i] }))
}

async function fetchReportStat(userId: string): Promise<Omit<ReportStat, 'loading'>> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { postReports: 0, commentReports: 0 }
  const [postRes, commentRes, reportRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/community_posts?author_id=eq.${encodeURIComponent(userId)}&category=neq.__신고__&select=id`, { headers: h() }).catch(() => null),
    fetch(`${SUPABASE_URL}/rest/v1/community_comments?author_id=eq.${encodeURIComponent(userId)}&select=id`, { headers: h() }).catch(() => null),
    fetch(`${SUPABASE_URL}/rest/v1/community_posts?category=eq.__신고__&select=content`, { headers: h() }).catch(() => null),
  ])
  const postIds    = new Set<string>((postRes?.ok    ? await postRes.json()    : []).map((p: any) => p.id as string))
  const commentIds = new Set<string>((commentRes?.ok ? await commentRes.json() : []).map((c: any) => c.id as string))
  const allReports: { content: string }[] = reportRes?.ok ? await reportRes.json() : []
  let postReports = 0, commentReports = 0
  for (const r of allReports) {
    try {
      const d = JSON.parse(r.content)
      if (d.commentId && commentIds.has(d.commentId)) commentReports++
      else if (d.postId && postIds.has(d.postId)) postReports++
    } catch {}
  }
  return { postReports, commentReports }
}

export default function AdminUsersPage() {
  const navigate = useNavigate()
  const user     = getSession()
  const [users, setUsers]             = useState<UserInfo[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [expanded, setExpanded]       = useState<string | null>(null)
  const [reportStats, setReportStats] = useState<Record<string, ReportStat>>({})

  useEffect(() => {
    if (!isAdmin(user)) { navigate('/'); return }
    getAllUsers().then(u => { setUsers(u); setLoading(false) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!expanded) return
    if (reportStats[expanded]) return
    setReportStats(prev => ({ ...prev, [expanded]: { postReports: 0, commentReports: 0, loading: true } }))
    fetchReportStat(expanded).then(stat => {
      setReportStats(prev => ({ ...prev, [expanded]: { ...stat, loading: false } }))
    })
  }, [expanded]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isAdmin(user)) return null
  const filtered = users.filter(u =>
    u.id.toLowerCase().includes(search.toLowerCase()) ||
    u.nickname.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="aiq-page">
      <div className="aiq-header">
        <button className="aiq-back" onClick={() => navigate(-1)}>← 돌아가기</button>
        <h1 className="aiq-title">유저관리</h1>
        <span className="aiq-count">총 {users.length}명</span>
      </div>

      <div className="aum-search-wrap">
        <svg className="aum-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          className="aum-search"
          placeholder="아이디 또는 닉네임 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="aiq-empty">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="aiq-empty">해당하는 유저가 없습니다.</div>
      ) : (
        <div className="aiq-list">
          {filtered.map((u, idx) => {
            const rs = reportStats[u.id]
            const totalReports = rs ? rs.postReports + rs.commentReports : 0
            return (
              <div key={u.id} className={`aiq-item ${expanded === u.id ? 'open' : ''}`}>

                {/* 목록 행 */}
                <div className="aiq-item-header" onClick={() => setExpanded(expanded === u.id ? null : u.id)}>
                  <div className="aiq-item-left">
                    <div className="aum-avatar" style={{ background: avatarColor(u.id) }}>
                      {u.nickname.slice(0,1).toUpperCase()}
                    </div>
                    <div className="aum-user-info">
                      <span className="aum-nickname">{u.nickname}</span>
                      <span className="aum-id">@{u.id}</span>
                    </div>
                    <div className="aum-stats">
                      <span className="aum-stat-badge post">✏️ {u.postCount}</span>
                      <span className="aum-stat-badge comment">💬 {u.commentCount}</span>
                    </div>
                  </div>
                  <div className="aiq-item-right">
                    <span className="aiq-date">{formatDate(u.createdAt)}</span>
                    <span className="aiq-chevron">{expanded === u.id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* 상세 카드 */}
                {expanded === u.id && (
                  <div className="aum-detail">
                    {/* 프로필 헤더 */}
                    <div className="aum-detail-hero">
                      <div className="aum-detail-avatar" style={{ background: avatarColor(u.id) }}>
                        {u.nickname.slice(0,1).toUpperCase()}
                      </div>
                      <div className="aum-detail-hero-info">
                        <div className="aum-detail-name">{u.nickname}</div>
                        <div className="aum-detail-uid">@{u.id}</div>
                        <div className="aum-detail-join">{joinDaysAgo(u.createdAt)} · {formatDate(u.createdAt)}</div>
                      </div>
                      <div className="aum-detail-rank">#{idx + 1}</div>
                    </div>

                    {/* 통계 카드 3개 */}
                    <div className="aum-stat-cards">
                      <div className="aum-stat-card">
                        <div className="aum-stat-card-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>✏️</div>
                        <div className="aum-stat-card-val">{u.postCount}</div>
                        <div className="aum-stat-card-label">게시글</div>
                      </div>
                      <div className="aum-stat-card">
                        <div className="aum-stat-card-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399' }}>💬</div>
                        <div className="aum-stat-card-val">{u.commentCount}</div>
                        <div className="aum-stat-card-label">댓글</div>
                      </div>
                      <div className="aum-stat-card">
                        <div className="aum-stat-card-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24' }}>⚡</div>
                        <div className="aum-stat-card-val">{u.postCount + u.commentCount}</div>
                        <div className="aum-stat-card-label">총 활동</div>
                      </div>
                    </div>

                    {/* 신고 현황 */}
                    <div className={`aum-report-box ${!rs?.loading && totalReports > 0 ? 'has-reports' : ''}`}>
                      <div className="aum-report-box-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        신고 누적 현황
                      </div>
                      {!rs || rs.loading ? (
                        <div className="aum-report-loading">조회 중...</div>
                      ) : totalReports === 0 ? (
                        <div className="aum-report-clean">신고 없음</div>
                      ) : (
                        <div className="aum-report-stats">
                          <div className="aum-report-total">{totalReports}건</div>
                          <div className="aum-report-breakdown">
                            <span className="aum-report-chip post">게시글 신고 {rs.postReports}건</span>
                            <span className="aum-report-chip comment">댓글 신고 {rs.commentReports}건</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 게시글 보기 버튼 */}
                    <div className="aum-detail-footer">
                      <button
                        className="aum-view-btn"
                        onClick={() => navigate(`/community?author=${encodeURIComponent(u.id)}`)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        게시글 보기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
