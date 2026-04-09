import { useState } from 'react'
import './SubPage.css'
import './TermsPage.css'

const toc = [
  '제1조 목적', '제2조 서비스 내용', '제3조 14세 미만 이용 제한',
  '제4조 광고', '제5조 회원가입 및 계정', '제6조 커뮤니티 이용 규칙',
  '제7조 이용자 간 분쟁 및 피해', '제8조 서비스 변경 및 중단',
  '제9조 Riot Games 관련 고지', '제10조 준거법',
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
            <p className="subpage-desc">morelol.kr 서비스 이용에 관한 약관입니다. 서비스 이용 전 반드시 읽어주세요.</p>
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
            <div className="legal-effective"><span>시행일</span><strong>2026년 4월 7일</strong></div>

            <div id="art0" className="legal-article">
              <div className="legal-article-title"><span className="legal-article-num">제1조</span>목적</div>
              <p>본 약관은 morelol.kr이 제공하는 리그 오브 레전드 전적 검색 및 커뮤니티 서비스 이용에 관한 사항을 규정합니다.</p>
            </div>

            <div id="art1" className="legal-article">
              <div className="legal-article-title"><span className="legal-article-num">제2조</span>서비스 내용</div>
              <ol className="legal-ol">
                <li data-num="1">전적 검색 서비스는 회원가입 없이 누구나 이용할 수 있습니다.</li>
                <li data-num="2">커뮤니티 서비스는 회원가입 후 이용할 수 있습니다.</li>
                <li data-num="3">서비스는 Riot Games API를 통해 전적 데이터를 제공하며, 데이터 반영이 지연되거나 일시적으로 부정확할 수 있습니다.</li>
              </ol>
            </div>

            <div id="art2" className="legal-article">
              <div className="legal-article-title"><span className="legal-article-num">제3조</span>14세 미만 이용 제한</div>
              <ol className="legal-ol">
                <li data-num="1">커뮤니티 서비스는 14세 미만 이용자의 회원가입을 받지 않습니다.</li>
                <li data-num="2">회원가입 시 14세 이상임에 동의한 것으로 간주합니다.</li>
              </ol>
            </div>

            <div id="art3" className="legal-article">
              <div className="legal-article-title"><span className="legal-article-num">제4조</span>광고</div>
              <ol className="legal-ol">
                <li data-num="1">본 서비스는 운영 비용 충당을 위해 제3자 광고를 게재합니다.</li>
                <li data-num="2">광고 내용은 광고주의 책임이며, morelol.kr은 광고를 통해 발생한 손해에 대해 책임을 지지 않습니다.</li>
                <li data-num="3">광고 차단 프로그램 사용은 이용자의 자유이나, 광고는 서비스 운영의 중요한 재원임을 안내드립니다.</li>
              </ol>
            </div>

            <div id="art4" className="legal-article">
              <div className="legal-article-title"><span className="legal-article-num">제5조</span>회원가입 및 계정</div>
              <ol className="legal-ol">
                <li data-num="1">아이디, 비밀번호, 닉네임을 입력하여 회원가입할 수 있습니다.</li>
                <li data-num="2">계정 정보 관리 책임은 이용자 본인에게 있습니다.</li>
                <li data-num="3">타인의 정보를 도용하거나 허위 정보로 가입하는 것을 금지합니다.</li>
                <li data-num="4">회원 탈퇴는 설정 메뉴에서 언제든지 직접 가능합니다.</li>
              </ol>
            </div>

            <div id="art5" className="legal-article">
              <div className="legal-article-title"><span className="legal-article-num">제6조</span>커뮤니티 이용 규칙</div>
              <p>이용자가 작성한 게시글 및 댓글의 내용과 그로 인한 법적 책임은 작성자 본인에게 있습니다.</p>
              <p>다음 행위를 금지합니다.</p>
              <ol className="legal-ol">
                <li data-num="1">금전 요구, 사기, 불법 거래 등 범죄와 관련된 게시글 작성</li>
                <li data-num="2">타인의 명예를 훼손하거나 개인정보를 유출하는 행위</li>
                <li data-num="3">욕설, 혐오 표현, 도배 등 건전한 커뮤니티 환경을 해치는 행위</li>
                <li data-num="4">허위 사실 유포 및 광고성 게시글 무단 작성</li>
              </ol>
              <div className="legal-highlight">위 규칙을 위반한 게시글은 사전 통보 없이 삭제될 수 있으며, 해당 계정은 이용이 제한될 수 있습니다.</div>
            </div>

            <div id="art6" className="legal-article">
              <div className="legal-article-title"><span className="legal-article-num">제7조</span>이용자 간 분쟁 및 피해</div>
              <ol className="legal-ol">
                <li data-num="1">커뮤니티 내 이용자 간 거래, 분쟁, 사기 등으로 발생한 피해에 대해 morelol.kr은 중개자가 아니므로 법적 책임을 지지 않습니다.</li>
                <li data-num="2">사기, 협박 등 범죄 피해를 입은 경우 즉시 수사기관(경찰청 사이버범죄신고시스템 cyberbureau.police.go.kr 또는 112)에 신고하시기 바랍니다.</li>
                <li data-num="3">운영자에게 신고 접수 시 해당 게시글 삭제 및 계정 제재 조치를 취합니다.</li>
                <li data-num="4">수사기관의 적법한 요청이 있을 경우 관련 정보를 제공할 수 있습니다.</li>
              </ol>
            </div>

            <div id="art7" className="legal-article">
              <div className="legal-article-title"><span className="legal-article-num">제8조</span>서비스 변경 및 중단</div>
              <ol className="legal-ol">
                <li data-num="1">시스템 점검, Riot API 서버 상태 등으로 서비스가 일시 중단될 수 있습니다.</li>
                <li data-num="2">서비스 내용은 사전 공지 후 변경될 수 있습니다.</li>
              </ol>
            </div>

            <div id="art8" className="legal-article">
              <div className="legal-article-title"><span className="legal-article-num">제9조</span>Riot Games 관련 고지</div>
              <ol className="legal-ol">
                <li data-num="1">본 서비스는 Riot Games의 공식 서비스가 아니며, Riot Games의 승인을 받지 않았습니다.</li>
                <li data-num="2">리그 오브 레전드 및 관련 자산의 저작권은 Riot Games, Inc.에 귀속됩니다.</li>
                <li data-num="3">본 서비스에서 제공하는 전적 데이터는 Riot Games API를 통해 제공됩니다.</li>
              </ol>
            </div>

            <div id="art9" className="legal-article">
              <div className="legal-article-title"><span className="legal-article-num">제10조</span>준거법</div>
              <ol className="legal-ol">
                <li data-num="1">본 약관은 대한민국 법령에 따르며, 분쟁 발생 시 운영자 소재지 관할 법원을 제1심으로 합니다.</li>
              </ol>
              <div className="legal-highlight">부칙: 이 약관은 2026년 4월 7일부터 시행됩니다.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
