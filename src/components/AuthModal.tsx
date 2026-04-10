import { useState, useEffect, useRef } from 'react'
import { signup, login } from '../utils/auth'
import type { User } from '../utils/auth'
import { checkNickname } from '../utils/nicknameFilter'
import './AuthModal.css'

interface Props {
  onClose: () => void
  onAuth:  (user: User) => void
}

type Tab = 'login' | 'signup'

export default function AuthModal({ onClose, onAuth }: Props) {
  const [tab, setTab] = useState<Tab>('login')

  const [loginId,    setLoginId]    = useState('')
  const [loginPw,    setLoginPw]    = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [signId,        setSignId]        = useState('')
  const [signPw,        setSignPw]        = useState('')
  const [signPwConfirm, setSignPwConfirm] = useState('')
  const [signNick,      setSignNick]      = useState('')
  const [signError,     setSignError]     = useState('')
  const [signLoading,   setSignLoading]   = useState(false)

  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    if (!loginId.trim() || !loginPw) { setLoginError('아이디와 비밀번호를 입력해주세요.'); return }
    setLoginLoading(true)
    const result = await login(loginId.trim(), loginPw)
    setLoginLoading(false)
    if (!result.ok) { setLoginError(result.error!); return }
    onAuth(result.user!)
    onClose()
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignError('')
    if (!signId.trim())           { setSignError('아이디를 입력해주세요.'); return }
    if (signId.length < 4)        { setSignError('아이디는 4자 이상이어야 합니다.'); return }
    if (!signNick.trim())         { setSignError('닉네임을 입력해주세요.'); return }
    if (signNick.length < 2)      { setSignError('닉네임은 2자 이상이어야 합니다.'); return }
    const nickCheck = checkNickname(signNick.trim(), signId.trim())
    if (!nickCheck.ok)            { setSignError(nickCheck.reason!); return }
    if (signPw.length < 6)        { setSignError('비밀번호는 6자 이상이어야 합니다.'); return }
    if (signPw !== signPwConfirm) { setSignError('비밀번호가 일치하지 않습니다.'); return }
    setSignLoading(true)
    const result = await signup(signId.trim(), signPw, signNick.trim())
    setSignLoading(false)
    if (!result.ok) { setSignError(result.error!); return }
    onAuth(result.user!)
    onClose()
  }

  return (
    <div
      className="auth-overlay"
      ref={overlayRef}
      onMouseDown={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="auth-modal">
        <button className="auth-close" onClick={onClose} aria-label="닫기">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="auth-logo">
          <span className="auth-logo-text">more</span>
          <span className="auth-logo-dot">.lol</span>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setLoginError('') }}
          >로그인</button>
          <button
            className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setSignError('') }}
          >회원가입</button>
        </div>

        {tab === 'login' && (
          <form className="auth-form" onSubmit={handleLogin} noValidate>
            <div className="auth-field">
              <label className="auth-label">아이디</label>
              <input
                className="auth-input"
                type="text"
                placeholder="아이디 입력"
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>
            <div className="auth-field">
              <label className="auth-label">비밀번호</label>
              <input
                className="auth-input"
                type="password"
                placeholder="비밀번호 입력"
                value={loginPw}
                onChange={e => setLoginPw(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {loginError && <p className="auth-error">{loginError}</p>}
            <button className="auth-submit" type="submit" disabled={loginLoading}>
              {loginLoading ? '로그인 중...' : '로그인'}
            </button>
            <p className="auth-switch">
              계정이 없으신가요?{' '}
              <button type="button" className="auth-link" onClick={() => { setTab('signup'); setLoginError('') }}>
                회원가입
              </button>
            </p>
          </form>
        )}

        {tab === 'signup' && (
          <form className="auth-form" onSubmit={handleSignup} noValidate>
            <div className="auth-field">
              <label className="auth-label">아이디 <span className="auth-hint">4자 이상</span></label>
              <input
                className="auth-input"
                type="text"
                placeholder="영문, 숫자 조합"
                value={signId}
                onChange={e => setSignId(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>
            <div className="auth-field">
              <label className="auth-label">닉네임 <span className="auth-hint">커뮤니티 활동명</span></label>
              <input
                className="auth-input"
                type="text"
                placeholder="2자 이상"
                value={signNick}
                onChange={e => setSignNick(e.target.value)}
              />
            </div>
            <div className="auth-field">
              <label className="auth-label">비밀번호 <span className="auth-hint">6자 이상</span></label>
              <input
                className="auth-input"
                type="password"
                placeholder="비밀번호 입력"
                value={signPw}
                onChange={e => setSignPw(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="auth-field">
              <label className="auth-label">비밀번호 확인</label>
              <input
                className="auth-input"
                type="password"
                placeholder="비밀번호 재입력"
                value={signPwConfirm}
                onChange={e => setSignPwConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            {signError && <p className="auth-error">{signError}</p>}
            <button className="auth-submit" type="submit" disabled={signLoading}>
              {signLoading ? '처리 중...' : '회원가입'}
            </button>
            <p className="auth-switch">
              이미 계정이 있으신가요?{' '}
              <button type="button" className="auth-link" onClick={() => { setTab('login'); setSignError('') }}>
                로그인
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
