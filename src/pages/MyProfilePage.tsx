import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession } from '../utils/auth'
import { getPostsByUser, deletePost, formatDate, getCommentCountByUser } from '../utils/postsStore'
import { calcXp, getLevelData, LEVELS } from '../utils/levelSystem'
import type { Post } from '../utils/postsStore'
import './MyProfilePage.css'
import './SubPage.css'

const catColors: Record<string, string> = {
  '\uacf5\ub7b5':    '#4a90e2',
  '\uc790\uc720\uac8c\uc2dc\ud310': '#69db7c',
  '\uc720\uba38':    '#ffd43b',
  '\uc9c8\ubb38':    '#ffa94d',
  '\uacf5\uc9c0':    '#ff6b6b',
}

const TABS = ['\uc804\uccb4', '\uacf5\ub7b5', '\uc790\uc720\uac8c\uc2dc\ud310', '\uc9c8\ubb38', '\uc720\uba38']

export default function MyProfilePage() {
  const navigate = useNavigate()
  const user     = getSession()

  const [posts, setPosts]               = useState<Post[]>([])
  const [commentCount, setCommentCount] = useState(0)
  const [loading, setLoading]           = useState(true)
  const [activeTab, setActiveTab]       = useState('\uc804\uccb4')
  const [confirmId, setConfirmId]       = useState<string | null>(null)
  const [showAllLevels, setShowAllLevels] = useState(false)

  useEffect(() => {
    if (!user) return
    Promise.all([
      getPostsByUser(user.id),
      getCommentCountByUser(user.id),
    ]).then(([p, c]) => {
      setPosts(p)
      setCommentCount(c)
      setLoading(false)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (postId: string) => {
    const ok = await deletePost(postId)
    if (ok) setPosts(prev => prev.filter(p => p.id !== postId))
    setConfirmId(null)
  }

  if (!user) {
    return (
      <div className="profile-unauth">
        <div className="profile-unauth-icon">\ud83d\udd12</div>
        <p className="profile-unauth-msg">\ub85c\uadf8\uc778\uc774 \ud544\uc694\ud55c \ud398\uc774\uc9c0\uc785\ub2c8\ub2e4.</p>
        <button className="profile-unauth-btn" onClick={() => navigate('/')}>\ud648\uc73c\ub85c \ub3cc\uc544\uac00\uae30</button>
      </div>
    )
  }

  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0)
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0)
  const joinDate   = new Date(user.createdAt)
  const joinStr    = `${joinDate.getFullYear()}.${String(joinDate.getMonth()+1).padStart(2,'0')}.${String(joinDate.getDate()).padStart(2,'0')}`

  const xp        = calcXp(posts.length, commentCount, totalLikes)
  const lvData    = getLevelData(xp)
  const { info: lv, next, progress, xpInLevel, xpForNext } = lvData

  const filtered = activeTab === '\uc804\uccb4' ? posts : posts.filter(p => p.category === activeTab)

  return (
    <div className="subpage profile-page">
      <div className="subpage-header profile-header">
        <div className="subpage-header-inner">

          {/* \uc720\uc800 \uc815\ubcf4 */}
          <div className="profile-hero">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar-lg">{user.nickname.slice(0,1).toUpperCase()}</div>
              <div className="profile-level-badge" style={{background: lv.bg, border: `1.5px solid ${lv.border}`, color: lv.color}}>
                Lv.{lv.level}
              </div>
            </div>
            <div className="profile-info">
              <div className="profile-name-row">
                <span className="profile-nickname">{user.nickname}</span>
                <span className="profile-rank-tag" style={{background: lv.bg, border: `1px solid ${lv.border}`, color: lv.color}}>
                  {lv.icon} {lv.name}
                </span>
              </div>
              <div className="profile-id">@{user.id}</div>
              <div className="profile-join">\uac00\uc785\uc77c {joinStr}</div>
            </div>
          </div>

          {/* XP \ubc14 */}
          <div className="profile-xp-card">
            <div className="profile-xp-top">
              <span className="profile-xp-title">\uacbd\ud5d8\uce58 (XP)</span>
              <span className="profile-xp-val" style={{color: lv.color}}>{xp.toLocaleString()} XP</span>
            </div>
            <div className="profile-xp-bar-wrap">
              <div className="profile-xp-bar-track">
                <div className="profile-xp-bar-fill" style={{width: `${progress}%`, background: lv.color}} />
              </div>
              <span className="profile-xp-pct">{progress}%</span>
            </div>
            <div className="profile-xp-sub">
              {next
                ? <>{xpInLevel.toLocaleString()} / {xpForNext.toLocaleString()} XP &nbsp;·&nbsp; \ub2e4\uc74c \ub808\ubca8: {next.icon} {next.name}</>
                : <>\ucd5c\uace0 \ub808\ubca8 \ub2ec\uc131! \ud83c\udf89</>}
            </div>
            <div className="profile-xp-breakdown">
              <span>\ud83d\udcdd \uae00 {posts.length}\uac1c &times; 10 = {posts.length*10} XP</span>
              <span>\ud83d\udcac \ub313\uae00 {commentCount}\uac1c &times; 3 = {commentCount*3} XP</span>
              <span>\u2764\ufe0f \uc88b\uc544\uc694 {totalLikes}\uac1c &times; 1 = {totalLikes} XP</span>
            </div>
          </div>

          {/* \ub808\ubca8 \ub85c\ub4dc\ub9f5 \ud1a0\uae00 */}
          <button className="profile-levels-toggle" onClick={() => setShowAllLevels(v => !v)}>
            {showAllLevels ? '\ub808\ubca8 \ubaa9\ub85d \ub2eb\uae30 \u25b2' : '\uc804\uccb4 \ub808\ubca8 \ubcf4\uae30 \u25bc'}
          </button>

          {showAllLevels && (
            <div className="profile-levels-grid">
              {LEVELS.map(l => {
                const reached  = xp >= l.minXp
                const isCurrent = lv.level === l.level
                return (
                  <div
                    key={l.level}
                    className={`profile-level-card ${reached ? 'reached' : ''} ${isCurrent ? 'current' : ''}`}
                    style={reached ? {borderColor: l.border, background: l.bg} : {}}
                  >
                    {isCurrent && <div className="plc-current-dot" />}
                    <div className="plc-medal" style={{filter: reached ? 'none' : 'grayscale(1)', opacity: reached ? 1 : 0.3}}>
                      {l.icon}
                    </div>
                    <div className="plc-level" style={reached ? {color: l.color} : {}}>{l.level}</div>
                    <div className="plc-name"  style={reached ? {color: l.color, fontWeight: 700} : {}}>{l.name}</div>
                    <div className="plc-xp">{l.minXp >= 1000 ? `${(l.minXp/1000).toFixed(1)}k` : l.minXp} XP</div>
                  </div>
                )
              })}
            </div>
          )}

          {/* \ud1b5\uacc4 */}
          <div className="profile-stats-row">
            <div className="profile-stat">
              <span className="profile-stat-val">{posts.length}</span>
              <span className="profile-stat-label">\uc791\uc131 \uae00</span>
            </div>
            <div className="profile-stat-divider" />
            <div className="profile-stat">
              <span className="profile-stat-val">{commentCount}</span>
              <span className="profile-stat-label">\uc791\uc131 \ub313\uae00</span>
            </div>
            <div className="profile-stat-divider" />
            <div className="profile-stat">
              <span className="profile-stat-val">{totalLikes.toLocaleString()}</span>
              <span className="profile-stat-label">\ubc1b\uc740 \uc88b\uc544\uc694</span>
            </div>
            <div className="profile-stat-divider" />
            <div className="profile-stat">
              <span className="profile-stat-val">{totalViews.toLocaleString()}</span>
              <span className="profile-stat-label">\uc804\uccb4 \uc870\ud68c\uc218</span>
            </div>
          </div>
        </div>
      </div>

      <div className="subpage-body">
        <div className="profile-section-title">\ub0b4 \uac8c\uc2dc\uae00</div>
        <div className="community-tabs" style={{ marginBottom: 0 }}>
          {TABS.map(tab => (
            <button
              key={tab}
              className={`community-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}{tab === '\uc804\uccb4'
                ? ` (${posts.length})`
                : ` (${posts.filter(p => p.category === tab).length})`}
            </button>
          ))}
        </div>
        <div className="post-list profile-post-list">
          {loading ? (
            <div className="profile-empty">
              <div className="profile-empty-icon">\u23f3</div>
              <div className="profile-empty-title">\ubd88\ub7ec\uc624\ub294 \uc911...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="profile-empty">
              <div className="profile-empty-icon">\ud83d\udcdd</div>
              <div className="profile-empty-title">\uc544\uc9c1 \uc791\uc131\ud55c \uac8c\uc2dc\uae00\uc774 \uc5c6\uc2b5\ub2c8\ub2e4</div>
              <div className="profile-empty-desc">\ucee4\ubba4\ub2c8\ud2f0\uc5d0\uc11c \uccab \uae00\uc744 \uc791\uc131\ud574\ubcf4\uc138\uc694!</div>
              <button className="profile-empty-btn" onClick={() => navigate('/community')}>\ucee4\ubba4\ub2c8\ud2f0 \uac00\uae30</button>
            </div>
          ) : (
            filtered.map((post: Post) => (
              <div
                key={post.id}
                className="post-row profile-post-row"
                onClick={() => navigate(`/post/${post.id}`)}
              >
                <span className="post-cat" style={{color: catColors[post.category]||'var(--text-muted)', background:(catColors[post.category]||'#888')+'15'}}>
                  {post.category}
                </span>
                <div className="post-title-wrap"><span className="post-title">{post.title}</span></div>
                <span className="post-views">\uc870\ud68c {post.views.toLocaleString()}</span>
                <span className="post-likes">\u2764 {post.likes}</span>
                <span className="post-time">{formatDate(post.createdAt)}</span>
                <div className="profile-post-actions" onClick={e => e.stopPropagation()}>
                  <button className="profile-edit-btn" onClick={() => navigate(`/edit/${post.id}`)}>
                    \uc218\uc815
                  </button>
                  {confirmId === post.id ? (
                    <>
                      <button className="profile-delete-yes" onClick={() => handleDelete(post.id)}>\uc0ad\uc81c</button>
                      <button className="profile-delete-no"  onClick={() => setConfirmId(null)}>\ucchwi\uc18c</button>
                    </>
                  ) : (
                    <button className="profile-delete-btn" onClick={() => setConfirmId(post.id)}>\uc0ad\uc81c</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
