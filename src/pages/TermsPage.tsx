import { useState } from 'react'
import './SubPage.css'
import './TermsPage.css'

const articles = [
  { id: 1, title: '제1조 (목적)', body: '이 약관은 more.lol(이하 "서비스")이 제공하는 모든 서비스의 이용조건 및 절차, 이용자와 서비스 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.' },
  { id: 2, title: '제2조 (정의)', body: '① "서비스"란 more.lol이 제공하는 리그 오브 레전드 전적 검색, 챔피언 분석, 커뮤니티 등의 온라인 서비스를 말합니다.
② "이용자"란 이 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.
③ "회원"이란 서비스에 회원 등록을 한 자로, 계속적으로 서비스를 이용할 수 있는 자를 말합니다.
④ "비회원"이란 회원 등록 없이 서비스를 이용하는 자를 말합니다.' },
  { id: 3, title: '제3조 (약관의 효력 및 변경)', body: '① 이 약관은 서비스를 이용하고자 하는 모든 이용자에게 효력이 발생합니다.
② 서비스는 필요한 경우 이 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해 공지합니다.
③ 이용자가 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 회원 탈퇴를 요청할 수 있습니다.' },
  { id: 4, title: '제4조 (서비스의 제공)', body: '① 서비스는 다음과 같은 기능을 제공합니다.
  - 소환사 전적 검색 및 통계
  - 챔피언 티어리스트 및 분석
  - ARAM 특화 통계
  - 커뮤니티 게시판
② 서비스는 운영상, 기술상의 필요에 따라 제공하는 서비스를 변경할 수 있습니다.
③ 서비스는 연중무휴, 24시간 제공을 원칙으로 하나, 시스템 점검 등의 이유로 일시 중단될 수 있습니다.' },
  { id: 5, title: '제5조 (회원가입 및 계정 관리)', body: '① 이용자는 서비스가 정한 가입 양식에 따라 회원 정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로써 회원 가입을 신청합니다.
② 회원은 등록사항에 변경이 있는 경우 즉시 수정하여야 하며, 미수정으로 인한 불이익은 회원이 부담합니다.
③ 회원은 자신의 계정과 비밀번호를 철저히 관리할 책임이 있습니다.' },
  { id: 6, title: '제6조 (이용자의 의무)', body: '이용자는 다음 행위를 하여서는 안 됩니다.
① 타인의 개인정보 및 계정을 도용하는 행위
② 서비스의 운영을 방해하거나 서버에 과부하를 일으키는 행위
③ 타인을 비방하거나 명예를 훼손하는 내용을 게시하는 행위
④ 관련 법령을 위반하는 일체의 행위
⑤ 서비스의 데이터를 무단으로 크롤링하거나 상업적으로 활용하는 행위' },
  { id: 7, title: '제7조 (금지행위)', body: '① 서비스는 다음 각 호에 해당하는 행위를 금지합니다.
  - 허위 정보 게재 및 타인 사칭
  - 음란물 또는 청소년 유해 콘텐츠 게시
  - 광고성 스팸 게시물 작성
  - 지식재산권 침해 행위
② 금지행위 적발 시 서비스 이용이 제한되거나 법적 조치가 취해질 수 있습니다.' },
  { id: 8, title: '제8조 (서비스 이용 제한)', body: '① 서비스는 이용자가 이 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 경고, 일시 정지, 영구 이용 제한 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.
② 서비스는 이용 제한의 경우 이용자에게 이메일 등을 통해 통보합니다.' },
  { id: 9, title: '제9조 (책임의 한계)', body: '① 서비스는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
② 서비스는 이용자의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.
③ more.lol의 데이터는 Riot Games API를 기반으로 하며, 데이터의 정확성을 보장하지 않습니다.
④ more.lol은 Riot Games와 공식 제휴 관계가 아닙니다.' },
  { id: 10, title: '제10조 (준거법 및 재판 관할)', body: '① 이 약관의 해석 및 서비스 이용으로 발생한 분쟁에 대해서는 대한민국 법률을 적용합니다.
② 서비스 이용으로 발생한 분쟁에 대한 소송은 민사소송법상의 관할 법원에 제기합니다.

[시행일] 이 약관은 2026년 3월 30일부터 시행합니다.' },
]

export default function TermsPage() {
  const [active, setActive] = useState(1)
  const current = articles.find(a => a.id === active)
  return (
    <div className="subpage terms-page">
      <div className="subpage-header">
        <div className="subpage-header-inner">
          <div>
            <h1 className="subpage-title">이용약관</h1>
            <p className="subpage-desc">more.lol 서비스 이용약관 · 시행일: 2026.03.30</p>
          </div>
          <div className="subpage-meta"><span className="patch-badge">법적고지</span></div>
        </div>
      </div>
      <div className="subpage-body">
        <div className="terms-layout">
          <nav className="terms-toc">
            <div className="toc-title">목차</div>
            {articles.map(a => (
              <button key={a.id} className={`toc-item ${active === a.id ? 'active' : ''}`} onClick={() => setActive(a.id)}>{a.title}</button>
            ))}
          </nav>
          <div className="terms-content">
            {current && (
              <div className="terms-article">
                <h2 className="terms-article-title">{current.title}</h2>
                <div className="terms-article-body">{current.body.split('
').map((line, i) => <p key={i}>{line}</p>)}</div>
              </div>
            )}
            <div className="terms-nav-buttons">
              {active > 1 && <button className="terms-nav-btn" onClick={() => setActive(active - 1)}>← 이전 조항</button>}
              {active < articles.length && <button className="terms-nav-btn primary" onClick={() => setActive(active + 1)}>다음 조항 →</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
