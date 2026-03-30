import { useState } from 'react'
import './SubPage.css'
import './PrivacyPage.css'

const toc = [
  '수집하는 개인정보 항목', '개인정보의 수집 목적', '개인정보의 보유 및 이용기간',
  '개인정보의 제3자 제공', '개인정보 처리의 위탁', '정보주체의 권리·의무',
  '개인정보의 파기', '개인정보 보호책임자',
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
            <p className="subpage-desc">more.lol은 개인정보보호법을 준수하며 이용자의 개인정보를 소중히 여깁니다.</p>
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
            <div className="privacy-effective"><span>시행일</span><strong>2026년 3월 1일</strong><span style={{ marginLeft: 12, color: 'var(--text-muted)' }}>개인정보보호법 기반</span></div>

            <div id="ps0" className="privacy-section">
              <div className="privacy-section-title"><span className="privacy-num">1</span>수집하는 개인정보 항목</div>
              <p>회사는 서비스 제공을 위해 다음과 같이 개인정보를 수집합니다.</p>
              <div className="privacy-table-wrap">
                <table className="privacy-table">
                  <thead><tr><th>수집 방법</th><th>수집 항목</th><th>목적</th></tr></thead>
                  <tbody>
                    <tr><td>회원 가입 시</td><td>이메일, 닉네임, 비밀번호(암호화)</td><td>회원 식별, 서비스 제공</td></tr>
                    <tr><td>서비스 이용 시</td><td>IP 주소, 브라우저 유형, 접속 시간, 이용 기록</td><td>보안, 통계 분석</td></tr>
                    <tr><td>Riot API 연동</td><td>소환사명, 소환사 ID</td><td>전적 검색 기능 제공</td></tr>
                    <tr><td>고객 문의 시</td><td>이름, 이메일, 문의 내용</td><td>고객 지원</td></tr>
                  </tbody>
                </table>
              </div>
              <p>회사는 만 14세 미만 아동의 개인정보를 수집하지 않습니다.</p>
            </div>

            <div id="ps1" className="privacy-section">
              <div className="privacy-section-title"><span className="privacy-num">2</span>개인정보의 수집 목적</div>
              <ul className="privacy-ul">
                <li>서비스 제공, 유지, 개선 및 신규 서비스 개발</li>
                <li>회원 관리 (회원 식별, 불량 회원 제재, 부정 이용 방지)</li>
                <li>고객 문의 처리 및 민원 대응</li>
                <li>서비스 이용 통계 분석 및 서비스 품질 향상</li>
                <li>서비스 관련 공지사항 및 이벤트 안내 (선택 동의 시)</li>
              </ul>
            </div>

            <div id="ps2" className="privacy-section">
              <div className="privacy-section-title"><span className="privacy-num">3</span>개인정보의 보유 및 이용기간</div>
              <p>회사는 개인정보 수집 목적이 달성된 후에는 해당 정보를 즉시 파기합니다. 단, 관계 법령의 규정에 의하여 보존이 필요한 경우 다음과 같이 보관합니다.</p>
              <div className="privacy-table-wrap">
                <table className="privacy-table">
                  <thead><tr><th>보존 항목</th><th>보존 기간</th><th>법적 근거</th></tr></thead>
                  <tbody>
                    <tr><td>계약 또는 청약철회에 관한 기록</td><td>5년</td><td>전자상거래법</td></tr>
                    <tr><td>소비자 불만 및 분쟁처리 기록</td><td>3년</td><td>전자상거래법</td></tr>
                    <tr><td>접속에 관한 기록</td><td>3개월</td><td>통신비밀보호법</td></tr>
                    <tr><td>회원 탈퇴 후 부정이용 방지</td><td>30일</td><td>회사 방침</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div id="ps3" className="privacy-section">
              <div className="privacy-section-title"><span className="privacy-num">4</span>개인정보의 제3자 제공</div>
              <p>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.</p>
              <ul className="privacy-ul">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              </ul>
              <div className="privacy-highlight">회사는 이용자의 사전 동의 없이 절대로 개인정보를 제3자에게 판매하거나 공유하지 않습니다.</div>
            </div>

            <div id="ps4" className="privacy-section">
              <div className="privacy-section-title"><span className="privacy-num">5</span>개인정보 처리의 위탁</div>
              <div className="privacy-table-wrap">
                <table className="privacy-table">
                  <thead><tr><th>수탁 업체</th><th>위탁 업무</th><th>보유 기간</th></tr></thead>
                  <tbody>
                    <tr><td>Amazon Web Services (AWS)</td><td>클라우드 서버 운영 및 데이터 저장</td><td>서비스 이용 기간</td></tr>
                    <tr><td>Google Analytics</td><td>서비스 이용 통계 분석 (익명 처리)</td><td>26개월</td></tr>
                    <tr><td>Riot Games API</td><td>소환사 전적 데이터 조회</td><td>조회 시점</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div id="ps5" className="privacy-section">
              <div className="privacy-section-title"><span className="privacy-num">6</span>정보주체의 권리·의무</div>
              <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
              <ul className="privacy-ul">
                <li>개인정보 열람 요청</li>
                <li>오류 등이 있을 경우 정정 요청</li>
                <li>삭제 요청 (단, 법령에 의해 수집된 경우 제외)</li>
                <li>처리 정지 요청</li>
              </ul>
              <p>위 권리 행사는 support@more.lol 을 통해 요청하실 수 있으며, 최대 10 영업일 이내에 조치를 취하겠습니다.</p>
            </div>

            <div id="ps6" className="privacy-section">
              <div className="privacy-section-title"><span className="privacy-num">7</span>개인정보의 파기</div>
              <p>회사는 개인정보 보유기간 경과 또는 처리 목적 달성 등 개인정보가 불필요하게 되었을 때 지체 없이 파기합니다.</p>
              <ul className="privacy-ul">
                <li>전자적 파일 형태: 복구 불가능한 방법으로 영구 삭제</li>
                <li>종이 문서: 분쇄기로 분쇄하거나 소각</li>
              </ul>
            </div>

            <div id="ps7" className="privacy-section">
              <div className="privacy-section-title"><span className="privacy-num">8</span>개인정보 보호책임자</div>
              <div className="privacy-contact-box">
                <strong>개인정보 보호책임자</strong><br />
                성명: more.lol 운영팀<br />
                이메일: privacy@more.lol<br />
                처리 기간: 접수 후 10 영업일 이내
              </div>
              <p style={{ marginTop: 14 }}>개인정보 침해 신고 기관: 개인정보침해신고센터(118), 대검찰청 사이버수사과(1301), 경찰청 사이버수사국(182)</p>
              <div className="privacy-highlight">이 개인정보처리방침은 2026년 3월 1일부터 적용됩니다.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
