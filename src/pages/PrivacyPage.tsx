import { useState } from 'react'
import './SubPage.css'
import './PrivacyPage.css'

const sections = [
  {
    id: 1,
    title: '제1조 수집하는 개인정보 항목',
    body: '서비스는 다음과 같은 개인정보를 수집합니다.',
    table: {
      headers: ['구분', '수집 항목', '수집 방법'],
      rows: [
        ['회원가입', '이메일 주소, 닉네임', '회원가입 양식'],
        ['서비스 이용', '접속 IP, 브라우저 정보, 방문 일시', '자동 수집'],
        ['문의하기', '이름, 이메일, 문의 내용', '문의 양식'],
      ]
    }
  },
  {
    id: 2,
    title: '제2조 개인정보의 수집 및 이용 목적',
    body: '서비스는 수집한 개인정보를 다음 목적을 위해 활용합니다.',
    table: {
      headers: ['목적', '세부 내용'],
      rows: [
        ['서비스 제공', '회원 식별, 전적 조회 기능 제공'],
        ['고객 지원', '문의 답변, 공지사항 전달'],
        ['서비스 개선', '접속 통계 분석, 오류 개선'],
        ['법적 의무 이행', '관계 법령에 따른 의무 준수'],
      ]
    }
  },
  {
    id: 3,
    title: '제3조 개인정보의 보유 및 이용 기간',
    body: '서비스는 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.',
    table: {
      headers: ['보존 항목', '보존 기간', '보존 근거'],
      rows: [
        ['회원 정보', '회원 탈퇴 후 30일', '분쟁 해결'],
        ['접속 로그', '3개월', '통신비밀보호법'],
        ['문의 내용', '처리 완료 후 1년', '고객 서비스'],
        ['결제 기록', '5년', '전자상거래법'],
      ]
    }
  },
  {
    id: 4,
    title: '제4조 개인정보의 제3자 제공',
    body: '서비스는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.
① 이용자가 사전에 동의한 경우
② 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우',
    table: null
  },
  {
    id: 5,
    title: '제5조 개인정보 처리의 위탁',
    body: '서비스는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁하고 있습니다.',
    table: {
      headers: ['수탁업체', '위탁 업무', '보유 기간'],
      rows: [
        ['클라우드 인프라 업체', '서버 운영 및 데이터 보관', '위탁 계약 종료 시'],
        ['이메일 발송 업체', '공지 및 답변 메일 발송', '위탁 계약 종료 시'],
      ]
    }
  },
  {
    id: 6,
    title: '제6조 이용자의 권리 및 행사 방법',
    body: '① 이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있습니다.
② 이용자는 언제든지 개인정보 처리의 정지, 삭제를 요청할 수 있습니다.
③ 이용자가 개인정보의 오류에 대한 정정을 요청한 경우에는 정정이 완료될 때까지 해당 개인정보를 이용하지 않습니다.
④ 이용자의 권리 행사는 서비스에 대해 서면, 전자우편 등을 통하여 하실 수 있으며 서비스는 이에 대해 지체 없이 조치하겠습니다.',
    table: null
  },
  {
    id: 7,
    title: '제7조 개인정보의 파기 절차 및 방법',
    body: '서비스는 개인정보 보유 기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.

[파기 절차] 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 내부 방침 및 관련 법령에 따라 일정 기간 저장된 후 파기됩니다.

[파기 방법] 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.',
    table: null
  },
  {
    id: 8,
    title: '제8조 개인정보 보호책임자',
    body: '서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 이용자의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.',
    table: {
      headers: ['구분', '내용'],
      rows: [
        ['성명', '개인정보 보호책임자'],
        ['이메일', 'privacy@more.lol'],
        ['처리 시간', '평일 10:00 ~ 18:00'],
      ]
    }
  },
]

export default function PrivacyPage() {
  const [active, setActive] = useState(1)
  const current = sections.find(s => s.id === active)
  return (
    <div className="subpage privacy-page">
      <div className="subpage-header">
        <div className="subpage-header-inner">
          <div>
            <h1 className="subpage-title">개인정보처리방침</h1>
            <p className="subpage-desc">more.lol 개인정보처리방침 · 시행일: 2026.03.30</p>
          </div>
          <div className="subpage-meta"><span className="patch-badge">개인정보</span></div>
        </div>
      </div>
      <div className="subpage-body">
        <div className="terms-layout">
          <nav className="terms-toc">
            <div className="toc-title">목차</div>
            {sections.map(s => (
              <button key={s.id} className={`toc-item ${active === s.id ? 'active' : ''}`} onClick={() => setActive(s.id)}>{s.title}</button>
            ))}
          </nav>
          <div className="terms-content">
            {current && (
              <div className="terms-article">
                <h2 className="terms-article-title">{current.title}</h2>
                <div className="terms-article-body">
                  {current.body.split('
').map((line, i) => <p key={i}>{line}</p>)}
                </div>
                {current.table && (
                  <div className="privacy-table-wrap">
                    <table className="privacy-table">
                      <thead>
                        <tr>{current.table.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {current.table.rows.map((row, ri) => (
                          <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            <div className="terms-nav-buttons">
              {active > 1 && <button className="terms-nav-btn" onClick={() => setActive(active - 1)}>← 이전</button>}
              {active < sections.length && <button className="terms-nav-btn primary" onClick={() => setActive(active + 1)}>다음 →</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
