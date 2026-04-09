import { useState, useRef } from 'react'
import { addInquiry } from '../utils/inquiryStore'
import './SubPage.css'
import './ContactPage.css'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const nameRef    = useRef<HTMLInputElement>(null)
  const emailRef   = useRef<HTMLInputElement>(null)
  const typeRef    = useRef<HTMLSelectElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addInquiry({
      name:    nameRef.current?.value.trim() || '',
      email:   emailRef.current?.value.trim() || '',
      type:    typeRef.current?.value || '',
      content: contentRef.current?.value.trim() || '',
    })
    setSubmitted(true)
  }

  return (
    <div className="subpage contact-page">
      <div className="subpage-header">
        <div className="subpage-header-inner">
          <div>
            <h1 className="subpage-title">문의하기</h1>
            <p className="subpage-desc">불편한 점이나 개선 요청을 남겨주세요. 빠르게 검토하겠습니다.</p>
          </div>
          <div className="subpage-meta"><span className="patch-badge">고객지원</span></div>
        </div>
      </div>
      <div className="subpage-body">
        <div className="contact-layout">
          <div className="contact-form-card contact-form-full">
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>문의가 접수되었습니다!</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>영업일 기준 1~2일 내에 이메일로 답변드리겠습니다.</div>
                <button style={{ marginTop: 24, padding: '10px 24px', background: '#14b8a6', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }} onClick={() => setSubmitted(false)}>새 문의 작성</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="contact-form-title">문의 내용 작성</div>
                <div className="form-group">
                  <label className="form-label">이름 <span className="form-required">*</span></label>
                  <input ref={nameRef} type="text" className="form-input" placeholder="홍길동" required />
                </div>
                <div className="form-group">
                  <label className="form-label">이메일 <span className="form-required">*</span></label>
                  <input ref={emailRef} type="email" className="form-input" placeholder="example@email.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label">문의 유형 <span className="form-required">*</span></label>
                  <select ref={typeRef} className="form-select" required>
                    <option value="">선택해 주세요</option>
                    <option>서비스 이용 문의</option>
                    <option>데이터 오류 신고</option>
                    <option>기술적 오류 신고</option>
                    <option>개인정보 관련 문의</option>
                    <option>광고/제휴 문의</option>
                    <option>기타</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">문의 내용 <span className="form-required">*</span></label>
                  <textarea ref={contentRef} className="form-textarea" placeholder="문의 내용을 자세히 작성해 주세요." required />
                </div>
                <button type="submit" className="form-submit">문의 접수하기</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
