import { useState } from 'react'
import './SubPage.css'
import './TermsPage.css'

const toc = [
  '제1조 목적', '제2조 정의', '제3조 약관의 효력 및 변경',
  '제4조 서비스의 제공', '제5조 이용계약', '제6조 이용자의 의무',
  '제7조 금지행위', '제8조 서비스 이용 제한', '제9조 면책조항', '제10조 준거법 및 관할법원',
]

export default function TermsPage() {
  const [active, setActive] = useState(0)
  const scrollTo = (i: number) => {
    setActive(i)
    document.getElementById('art' + i)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return (
    <div className="subpage terms-page">
      <div className="subpage-header">
        <div className="subpage-header-inner">
          <div>
            <h1 className="subpage-title">이용약관</h1>
            <p className="subpage-desc">more.lol 서비스 이용에 관한 약관입니다. 서비스 이용 전 반드시 읽어주세요.</p>
          </div>
          <div className="subpage-meta"><span className="patch-badge">법적 문서</span></div>
        </div>
      </div>
      <div className="subpage-body">
        <div className="legal-layout">
          <div className="legal-toc">
            <div className="legal-toc-title">목차</div>
            {toc.map((t, i) => (
              <button key={i} className={'legal-toc-item' + (active === i ? ' active' : '')} onClick={() => scrollTo(i)}>{t}</button>
            ))}
          </div>
          <div className="legal-doc">
            <div className="legal-effective"><span>시행일</span><strong>2026년 3월 1일</strong></div>

            <div id="art0" className="legal-article">
              <div className="legal-article-title"><span className="legal-article-num">제1조</span>목적</div>
              <p>이 약관은 more.lol(이하 "서비스")이 제공하는 리그 오브 레전드 전적 분석 서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
            </div>

            <div id="art1" className="legal-article">
              <div className="legal-article-title"><span className="legal-article-num">제2조</span>정의</div>
              <p>이 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
              <ol className="legal-ol">
                <li data-num="1">&quot;서비스&quot;란 more.lol이 제공하는 소환사 전적 검색, 챔피언 티어리스트, ARAM 통계 등의 모든 온라인 서비스를 의미합니다.</li>
                <li data-num="2">&quot;이용자&quot;란 이 약관에 따라 서비스를 이용하는 자를 의미합니다.</li>
                <li data-num="3">&quot;회원&quot;이란 서비스에 개인정보를 제공하여 회원 등록을 한 자로, 계속적으로 서비스를 이용할 수 있는 자를 의미합니다.</li>
                <li data-num="4">&quot;비회원&quot;이란 회원 등록 없이 서비스를 이용하는 자를 의미합니다.</li>
              </ol>
            </div>

            <div id="art2" className="legal-article">
              <div className="legal-article-title"><span className="legal-article-num">제3조</span>약관의 효력 및 변경</div>
              <ol className="legal-ol">
                <li data-num="1">이 약관은 서비스를 이용하고자 하는 모든 이용자에게 효력이 발생합니다.</li>
                <li data-num="2">서비스는 필요한 경우 이 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해 공지합니다.</li>
                <li data-num="3">약관 변경 시 적용일자 7일 이전부터(불리한 변경은 30일 이전) 공지하며, 이용자가 동의하지 않을 경우 서비스 이용을 중단하거나 회원 탈퇴를 요청할 수 있습니다.</li>
              </ol>
            </div>

            <div id="art3" className="legal-article">
              <div className="legal-article-title"><span className="legal-article-num">제4조</span>서비스의 제공</div>
              <ol className="legal-ol">
                <li data-num="1">서비스는 소환사 전적 검색, 챔피언 티어리스트, ARAM 통계, 커뮤니티 게시판 등을 제공합니다.</li>
                <li data-num="2">서비스는 운영상, 기술상의 필요에 따라 제공하는 서비스를 변경할 수 있습니다.</li>
                <li data-num="3">서비스는 연중무휴 24시간 제공을 원칙으로 하나, 시스템 점검 등의 이유로 일시 중단될 수 있습니다.</li>
              </ol>
            </div>

            <div id="art4" className="legal-article">
              <div className="legal-article-title"><span className="legal-article-num">제5조</span>이용계약</div>
              <ol className="legal-ol">
                <li data-num="1">서비스 이용계약은 이용자가 약관에 동의한 후 서비스를 이용함으로써 성립합니다.</li>
                <li data-num="2">회원 가입의 경우 신청 시 약관에 동의하고 필요한 정보를 입력함으로써 이용계약이 성립합니다.</li>
                <li data-num="3">만 14세 미만의 아동은 회원 가입을 할 수 없습니다.</li>
              </ol>
            </div>

            <div id="art5" className="legal-article">
              <div className="legal-article-title"><span className="legal-article-num">제6조</span>이용자의 의무</div>
              <ol className="legal-ol">
                <li data-num="1">이용자는 타인의 정보 도용 및 허위 정보 제공 행위를 하여서는 안 됩니다.</li>
                <li data-num="2">이용자는 서비스에서 얻은 정보를 서비스의 사전 승낙 없이 복제·출판·방송 등에 사용하거나 제3자에게 제공해서는 안 됩니다.</li>
                <li data-num="3">이용자는 관계 법령과 이 약관을 준수하여야 합니다.</li>
              </ol>
            </div>

            <div id="art6" className="legal-article">
              <div className="legal-article-title"><span className="legal-article-num">제7조</span>금지행위</div>
              <p>이용자는 다음 각 호에 해당하는 행위를 하여서는 안 됩니다.</p>
              <ol className="legal-ol">
                <li data-num="1">서비스 운영을 방해하거나 안정적 운영을 저해하는 정보를 전송하는 행위</li>
                <li data-num="2">크롤링, 스크래핑, 데이터 마이닝 등 자동화 방법으로 대량의 데이터를 수집하는 행위</li>
                <li data-num="3">타인을 사칭하거나 타인의 명예를 훼손하는 행위</li>
                <li data-num="4">관계 법령에 위반되는 행위</li>
              </ol>
              <div className="legal-highlight">위반 시 서비스는 사전 통보 없이 이용을 제한하거나 회원 자격을 박탈할 수 있습니다.</div>
            </div>

            <div id="art7" className="legal-article">
              <div className="legal-article-title"><span className="legal-article-num">제8조</span>서비스 이용 제한</div>
              <ol className="legal-ol">
                <li data-num="1">서비스는 이용자가 이 약관의 의무를 위반하거나 서비스의 정상 운영을 방해한 경우 경고, 일시 정지, 영구 이용 정지 등의 조치를 취할 수 있습니다.</li>
                <li data-num="2">이용자는 이용 제한 조치에 이의가 있는 경우 고객센터를 통해 이의 신청을 할 수 있습니다.</li>
              </ol>
            </div>

            <div id="art8" className="legal-article">
              <div className="legal-article-title"><span className="legal-article-num">제9조</span>면책조항</div>
              <ol className="legal-ol">
                <li data-num="1">서비스는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 책임이 면제됩니다.</li>
                <li data-num="2">서비스에 표시된 데이터의 정확성, 최신성을 보증하지 않으며, 해당 데이터를 이용하여 발생한 손해에 대해 책임지지 않습니다.</li>
                <li data-num="3">more.lol은 Riot Games에 의해 보증되거나 공인되지 않으며, Riot Games의 공식 견해를 반영하지 않습니다.</li>
              </ol>
            </div>

            <div id="art9" className="legal-article">
              <div className="legal-article-title"><span className="legal-article-num">제10조</span>준거법 및 관할법원</div>
              <ol className="legal-ol">
                <li data-num="1">이 약관의 해석 및 적용에 관하여는 대한민국 법령을 적용합니다.</li>
                <li data-num="2">서비스 이용으로 발생한 분쟁에 대해 소송이 제기되는 경우 민사소송법상의 관할 법원에 제기합니다.</li>
              </ol>
              <div className="legal-highlight">부칙: 이 약관은 2026년 3월 1일부터 시행됩니다.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
