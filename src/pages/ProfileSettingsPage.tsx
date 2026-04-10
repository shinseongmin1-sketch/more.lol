import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession, updateNickname, updatePassword, deleteAccount } from '../utils/auth'
import { checkNickname } from '../utils/nicknameFilter'
import './ProfileSettingsPage.css'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export default function ProfileSettingsPage() {
  const navigate = useNavigate()
  const user = getSession()

  const [nickname,   setNickname]   = useState(user?.nickname ?? '')
  const [nickState,  setNickState]  = useState<SaveState>('idle')
  const [nickError,  setNickError]  = useState('')
  const [nickMsg,    setNickMsg]    = useState('')

  const [currentPw, setCurrentPw] = useState('')
  const [newPw,     setNewPw]     = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwState,   setPwState]   = useState<SaveState>('idle')
  const [pwError,   setPwError]   = useState('')
  const [pwMsg,     setPwMsg]     = useState('')

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew,     setShowNew]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [showWithdraw, setShowWithdraw] = useState(false)
  const [agreePost,    setAgreePost]    = useState(false)
  const [agreeData,    setAgreeData]    = useState(false)
  const [agreeNoUndo,  setAgreeNoUndo]  = useState(false)
  const allAgreed = agreePost && agreeData && agreeNoUndo

  const handleWithdraw = async () => {
    if (!allAgreed || !user) return
    await deleteAccount(user.id)
    navigate('/')
  }

  if (!user) {
    return (
      <div className="settings-unauth">
        <p>로그인이 필요합니다.</p>
        <button onClick={() => navigate('/')}>홈으로</button>
      </div>
    )
  }

  const joinDate = new Date(user.createdAt)
  const joinStr  = `${joinDate.getFullYear()}년 ${joinDate.getMonth() + 1}월 ${joinDate.getDate()}일`

  const handleNickSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setNickError(''); setNickMsg('')
    const trimmed = nickname.trim()
    if (!trimmed)           { setNickError('닉네임을 입력해주세요.'); return }
    if (trimmed.length < 2) { setNickError('닉네임은 2자 이상이어야 합니다.'); return }
    if (trimmed === user.nickname) { setNickError('현재 닉네임과 동일합니다.'); return }
    const check = checkNickname(trimmed, user.id)
    if (!check.ok) { setNickError(check.reason!); return }
    setNickState('saving')
    const result = await updateNickname(user.id, trimmed)
    if (!result.ok) { setNickError(result.error!); setNickState('error'); return }
    setNickState('saved')
    setNickMsg('닉네임이 변경됐습니다. 다음 로그인 시 적용됩니다.')
    setTimeout(() => setNickState('idle'), 3000)
  }

  const handlePwSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError(''); setPwMsg('')
    if (!currentPw)         { setPwError('현재 비밀번호를 입력해주세요.'); return }
    if (newPw.length < 6)   { setPwError('새 비밀번호는 6자 이상이어야 합니다.'); return }
    if (newPw !== confirmPw) { setPwError('새 비밀번호가 일치하지 않습니다.'); return }
    if (newPw === currentPw) { setPwError('현재 비밀번호와 동일한 비밀번호는 사용할 수 없습니다.'); return }
    setPwState('saving')
    const result = await updatePassword(user.id, currentPw, newPw)
    if (!result.ok) { setPwError(result.error!); setPwState('error'); return }
    setPwState('saved')
    setPwMsg('비밀번호가 변경됐습니다.')
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
    setTimeout(() => setPwState('idle'), 3000)
  }

  const pwStrength = newPw.length === 0 ? 0
    : newPw.length < 6  ? 1
    : newPw.length < 10 ? 2
    : 3

  return (
    <div className="settings-page">
      <div className="settings-topbar">
        <button className="settings-back-btn" onClick={() => navigate('/profile')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          내 게시글
        </button>
        <span className="settings-topbar-title">프로필 설정</span>
        <div />
      </div>

      <div className="settings-body">

        {/* 계정 정보 */}
        <div className="settings-card settings-info-card">
          <div className="settings-card-header">
            <div className="settings-card-icon" style={{ background: 'linear-gradient(135deg,#7c5af6,#5e3dd8)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </div>
            <div>
              <div className="settings-card-title">계정 정보</div>
              <div className="settings-card-sub">가입 정보를 확인합니다</div>
            </div>
          </div>
          <div className="settings-info-grid">
            <div className="settings-info-row">
              <span className="settings-info-label">아이디</span>
              <span className="settings-info-value">{user.id}</span>
            </div>
            <div className="settings-info-row">
              <span className="settings-info-label">현재 닉네임</span>
              <span className="settings-info-value settings-info-nick">{user.nickname}</span>
            </div>
            <div className="settings-info-row">
              <span className="settings-info-label">가입일</span>
              <span className="settings-info-value">{joinStr}</span>
            </div>
          </div>
        </div>

        {/* 닉네임 변경 */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon" style={{ background: 'linear-gradient(135deg,#06b6d4,#0891b2)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div>
              <div className="settings-card-title">닉네임 변경</div>
              <div className="settings-card-sub">커뮤니티 활동에 사용되는 이름</div>
            </div>
          </div>
          <form className="settings-form" onSubmit={handleNickSave} noValidate>
            <div className="settings-field">
              <label className="settings-label">새 닉네임</label>
              <div className="settings-input-wrap">
                <input
                  className="settings-input"
                  type="text"
                  placeholder="새 닉네임 입력 (2자 이상)"
                  value={nickname}
                  maxLength={20}
                  onChange={e => { setNickname(e.target.value); setNickError(''); setNickMsg('') }}
                />
                <span className="settings-input-counter">{nickname.length}/20</span>
              </div>
            </div>
            {nickError && <div className="settings-error"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>{nickError}</div>}
            {nickMsg   && <div className="settings-success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>{nickMsg}</div>}
            <button
              type="submit"
              className={`settings-save-btn ${nickState === 'saved' ? 'saved' : ''}`}
              disabled={nickState === 'saving'}
            >
              {nickState === 'saving' ? '저장 중...' : nickState === 'saved' ? '✓ 저장됨' : '닉네임 저장'}
            </button>
          </form>
        </div>

        {/* 비밀번호 변경 */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div>
              <div className="settings-card-title">비밀번호 변경</div>
              <div className="settings-card-sub">주기적으로 변경하면 보안에 좋습니다</div>
            </div>
          </div>
          <form className="settings-form" onSubmit={handlePwSave} noValidate>
            <div className="settings-field">
              <label className="settings-label">현재 비밀번호</label>
              <div className="settings-pw-wrap">
                <input
                  className="settings-input"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="현재 비밀번호"
                  value={currentPw}
                  onChange={e => { setCurrentPw(e.target.value); setPwError('') }}
                  autoComplete="current-password"
                />
                <button type="button" className="settings-eye-btn" onClick={() => setShowCurrent(v => !v)}>
                  {showCurrent
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>
            <div className="settings-field">
              <label className="settings-label">새 비밀번호</label>
              <div className="settings-pw-wrap">
                <input
                  className="settings-input"
                  type={showNew ? 'text' : 'password'}
                  placeholder="새 비밀번호 (6자 이상)"
                  value={newPw}
                  onChange={e => { setNewPw(e.target.value); setPwError('') }}
                  autoComplete="new-password"
                />
                <button type="button" className="settings-eye-btn" onClick={() => setShowNew(v => !v)}>
                  {showNew
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {newPw.length > 0 && (
                <div className="pw-strength">
                  <div className="pw-strength-bars">
                    {[1,2,3].map(n => (
                      <div key={n} className={`pw-bar ${pwStrength >= n ? `level-${pwStrength}` : ''}`} />
                    ))}
                  </div>
                  <span className={`pw-strength-label level-${pwStrength}`}>
                    {pwStrength === 1 ? '약함' : pwStrength === 2 ? '보통' : '강함'}
                  </span>
                </div>
              )}
            </div>
            <div className="settings-field">
              <label className="settings-label">새 비밀번호 확인</label>
              <div className="settings-pw-wrap">
                <input
                  className={`settings-input ${confirmPw && newPw !== confirmPw ? 'mismatch' : confirmPw && newPw === confirmPw ? 'match' : ''}`}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="새 비밀번호 재입력"
                  value={confirmPw}
                  onChange={e => { setConfirmPw(e.target.value); setPwError('') }}
                  autoComplete="new-password"
                />
                <button type="button" className="settings-eye-btn" onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {confirmPw && newPw !== confirmPw && <p className="settings-match-hint mismatch">비밀번호가 일치하지 않습니다</p>}
              {confirmPw && newPw === confirmPw  && <p className="settings-match-hint match">비밀번호가 일치합니다</p>}
            </div>
            {pwError && <div className="settings-error"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>{pwError}</div>}
            {pwMsg   && <div className="settings-success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>{pwMsg}</div>}
            <button
              type="submit"
              className={`settings-save-btn ${pwState === 'saved' ? 'saved' : ''}`}
              disabled={pwState === 'saving'}
            >
              {pwState === 'saving' ? '저장 중...' : pwState === 'saved' ? '✓ 저장됨' : '비밀번호 변경'}
            </button>
          </form>
        </div>

        {/* 회원탈퇴 */}
        <div className="settings-card settings-withdraw-card">
          <div className="settings-card-header">
            <div className="settings-card-icon" style={{ background: 'linear-gradient(135deg,#ef4444,#b91c1c)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </div>
            <div>
              <div className="settings-card-title">회원탈퇴</div>
              <div className="settings-card-sub">탈퇴 시 모든 데이터가 영구 삭제됩니다</div>
            </div>
          </div>

          {!showWithdraw ? (
            <button className="withdraw-open-btn" onClick={() => setShowWithdraw(true)}>
              회원탈퇴 진행
            </button>
          ) : (
            <div className="withdraw-panel">
              <div className="withdraw-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                탈퇴 전 아래 내용을 반드시 확인해주세요
              </div>
              <div className="withdraw-agrees">
                <label className="withdraw-agree-item">
                  <input type="checkbox" checked={agreePost} onChange={e => setAgreePost(e.target.checked)} />
                  <span>작성한 <strong>게시글 및 댓글이 모두 삭제</strong>되며 복구할 수 없습니다.</span>
                </label>
                <label className="withdraw-agree-item">
                  <input type="checkbox" checked={agreeData} onChange={e => setAgreeData(e.target.checked)} />
                  <span>아이디, 닉네임 등 <strong>계정 정보가 영구 삭제</strong>되며 동일 아이디로 <strong>탈퇴 후 2개월간 재가입이 제한</strong>됩니다.</span>
                </label>
                <label className="withdraw-agree-item">
                  <input type="checkbox" checked={agreeNoUndo} onChange={e => setAgreeNoUndo(e.target.checked)} />
                  <span>위 내용을 모두 확인했으며, <strong>탈퇴 후 되돌릴 수 없음</strong>에 동의합니다.</span>
                </label>
              </div>
              <div className="withdraw-actions">
                <button className="withdraw-cancel-btn" onClick={() => {
                  setShowWithdraw(false)
                  setAgreePost(false); setAgreeData(false); setAgreeNoUndo(false)
                }}>
                  취소
                </button>
                <button
                  className={`withdraw-confirm-btn ${allAgreed ? 'ready' : ''}`}
                  onClick={handleWithdraw}
                  disabled={!allAgreed}
                >
                  탈퇴하기
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
