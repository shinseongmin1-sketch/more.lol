import { useState } from 'react'
import './SubPage.css'
import './PrivacyPage.css'

const toc = [
  '수집하는 개인정보 항목', '수집 및 이용 목적', '14세 미만 이용자',
  '광고 서비스 관련', '보유 및 이용 기간', '제3자 제공',
  '처리 위탁', '이용자의 권리', '개인정보 보호책임자',
]

export default function PrivacyPage() {
  const [active, setActive] = useState(0)
  const scrollTo = (i: number) => {
    setActive(i)
    document.getElementById('ps' + i)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return (
    <div className="subpage privacy-page">
      <div className="subpage-header">
        <div className="subpage-header-inner">
          <div>
            <h1 className="subpage-title">개인정보처리방침</h1>
            <p className="subpage-desc">morelol.kr은 개인정보보호법을 준수하며 이용자의 개인정보를 소중히 여깁니다.</p>
          </div>
          <div className="subpage-meta"><span className="patch-badge">개인정보 보호</span></div>
        </div>
      </div>
      <div className="subpage-body">
        <div className="privacy-layout">
          <div className="privacy-toc">
            <div className="privacy-toc-title">목차</div>
            {toc.map((t, i) => (
              <button key={i} className={'privacy-toc-item' + (active === i ? ' active' : '')} onClick={() => scrollTo(i)}>{i + 1}. {t}</button>
            ))}
          </div>
          <div className="privacy-doc">
            <div className="privacy-effective"><span>시행일</span><strong>2026년 4월 7일</strong><span style={{ marginLeft: 12, color: 'var(--text-muted)' }}>개인정보보호법 기반</span></div>

            <div id="ps0" className="privacy-section">
              <div className="privacy-section-title"><span className="privacy-num">1</span>수집하는 개인정보 항목</div>
              <ul className="privacy-ul">
                <li>전적 검색 서비스는 별도의 개인정보를 수집하지 않습니다.</li>
                <li>커뮤니티 이용을 위한 회원가입 시 아이디, 비밀번호, 닉네임을 수집합니다.</li>
                <li>문의하기 이용 시 이름, 이메일 주소를 수집합니다.</li>
                <li>서비스 이용 과정에서 접속 IP, 접속 일시 등의 로그 정보가 자동으로 수집될 수 있습니다.</li>
              </ul>
            </div>

            <div id="ps1" className="privacy-section">
              <div className="privacy-section-title"><span className="privacy-num">2</span>수집 및 이용 목적</div>
              <ul className="privacy-ul">
                <li>회원 식별 및 커뮤니티 서비스 제공</li>
                <li>서비스 운영 및 부정 이용 방지</li>
                <li>문의 접수 및 답변 처리</li>
              </ul>
            </div>

            <div id="ps2" className="privacy-section">
              <div className="privacy-section-title"><span className="privacy-num">3</span>14세 미만 이용자</div>
              <ul className="privacy-ul">
                <li>본 서비스의 커뮤니티는 14세 미만 아동의 회원가입을 받지 않습니다.</li>
                <li>회원가입 시 14세 이상임에 동의한 것으로 간주합니다.</li>
                <li>14세 미만으로 확인된 경우 해당 계정은 즉시 삭제됩니다.</li>
              </ul>
            </div>

            <div id="ps3" className="privacy-section">
              <div className="privacy-section-title"><span className="privacy-num">4</span>광고 서비스 관련</div>
              <ul className="privacy-ul">
                <li>본 서비스는 Google AdSense 등 제3자 광고 서비스를 운영합니다.</li>
                <li>광고 서비스 제공을 위해 쿠키(Cookie) 및 광고 식별자가 사용될 수 있습니다.</li>
                <li>광고 서비스는 이용자의 서비스 이용 행태를 바탕으로 맞춤형 광고를 제공할 수 있으며, 이는 광고 서비스 제공업체의 개인정보처리방침에 따라 처리됩니다.</li>
                <li>맞춤형 광고를 원하지 않을 경우 Google 광고 설정(https://adssettings.google.com)에서 변경할 수 있습니다.</li>
              </ul>
            </div>

            <div id="ps4" className="privacy-section">
              <div className="privacy-section-title"><span className="privacy-num">5</span>보유 및 이용 기간</div>
              <ul className="privacy-ul">
                <li>회원 정보는 탈퇴 시까지 보유하며, 탈퇴 후 즉시 파기합니다.</li>
                <li>문의하기를 통해 수집된 정보는 문의 처리 완료 후 6개월 뒤 파기합니다.</li>
                <li>단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.</li>
              </ul>
            </div>

            <div id="ps5" className="privacy-section">
              <div className="privacy-section-title"><span className="privacy-num">6</span>제3자 제공</div>
              <p>수집한 개인정보는 이용자의 동의 없이 외부에 제공하지 않습니다.</p>
              <p>단, 수사기관의 적법한 요청이 있는 경우 법령에 따라 제공할 수 있습니다.</p>
            </div>

            <div id="ps6" className="privacy-section">
              <div className="privacy-section-title"><span className="privacy-num">7</span>처리 위탁</div>
              <p>현재 개인정보 처리를 외부에 위탁하지 않습니다.</p>
            </div>

            <div id="ps7" className="privacy-section">
              <div className="privacy-section-title"><span className="privacy-num">8</span>이용자의 권리</div>
              <ul className="privacy-ul">
                <li>이용자는 언제든지 자신의 개인정보 조회, 수정, 삭제 및 처리 정지를 요청할 수 있습니다.</li>
                <li>회원 탈퇴는 설정 메뉴에서 직접 언제든지 가능합니다.</li>
                <li>기타 요청은 아래 개인정보 보호책임자에게 연락 주시면 처리해 드립니다.</li>
              </ul>
            </div>

            <div id="ps8" className="privacy-section">
              <div className="privacy-section-title"><span className="privacy-num">9</span>개인정보 보호책임자</div>
              <div className="privacy-contact-box">
                <strong>개인정보 보호책임자</strong><br />
                담당자: 관리자<br />
                이메일: hapoom0320@naver.com<br />
                처리 기간: 접수 후 10 영업일 이내
              </div>
              <p style={{ marginTop: 14 }}>개인정보 침해 신고 기관: 개인정보침해신고센터(118), 대검찰청 사이버수사과(1301), 경찰청 사이버수사국(182)</p>
              <div className="privacy-highlight">본 서비스는 Riot Games의 공식 서비스가 아닙니다.</div>
              <div className="privacy-highlight">이 개인정보처리방침은 2026년 4월 7일부터 적용됩니다.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
