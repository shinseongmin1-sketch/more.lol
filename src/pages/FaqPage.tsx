import { useState } from 'react'
import './SubPage.css'
import './FaqPage.css'

const categories = ['전체', '서비스 이용', '데이터/통계', '계정', '기술/오류', '기타']
const faqs = [
  { id: 1,  cat: '서비스 이용', q: 'more.lol은 어떤 서비스인가요?', a: 'more.lol은 리그 오브 레전드 소환사 전적 검색, 챔피언 티어리스트, ARAM 통계, AI 게임 분석 등을 제공하는 무료 종합 분석 플랫폼입니다. 단순한 전적 조회를 넘어 AI가 각 게임의 초반 운영·오브젝트·한타 기여도를 분석해 맞춤형 피드백을 제공합니다.' },
  { id: 2,  cat: '서비스 이용', q: '소환사 검색은 어떻게 하나요?', a: '메인 페이지 상단의 검색창에 소환사명을 입력하면 됩니다. 닉네임#태그 형식(예: Hide on bush#KR1) 또는 닉네임만 입력해도 검색됩니다. 태그를 생략하면 자동으로 KR1 서버에서 검색합니다.' },
  { id: 3,  cat: '서비스 이용', q: 'AI 게임 분석은 어떻게 이용하나요?', a: '소환사 전적 페이지에서 각 게임 카드 오른쪽의 [🤖 AI 분석] 버튼을 클릭하면 됩니다. AI가 해당 게임의 KDA, CS, 시야 점수, 팀 기여도, 초반 킬/데스 등을 종합 분석해 ⚔️ 초반 운영 / 🏯 오브젝트 / 🔥 한타 / 💡 총평 형식으로 피드백을 제공합니다.' },
  { id: 4,  cat: '서비스 이용', q: '포지션 성향 테스트는 어떻게 진행되나요?', a: '메인 페이지 상단 메뉴 또는 검색창 드롭다운의 [포지션 성향 테스트]를 클릭하면 됩니다. 12개의 상황별 질문에 답하면 탑·정글·미드·원딜·서포터 중 내 플레이 스타일에 가장 잘 맞는 포지션을 추천해드립니다.' },
  { id: 5,  cat: '서비스 이용', q: 'ARAM(칼바람 나락) 티어리스트 데이터는 어떻게 산정되나요?', a: 'ARAM 티어리스트는 최근 14일간의 무작위 총력전 게임 데이터를 기반으로 챔피언의 승률, 픽률, KDA 등을 종합하여 S+~D 등급으로 분류합니다. 칼바람은 소환사 협곡과 메타가 크게 다르므로 별도 분석 데이터를 제공합니다.' },
  { id: 6,  cat: '데이터/통계', q: '데이터는 얼마나 자주 업데이트되나요?', a: '소환사 전적은 검색 시 Riot API를 통해 실시간으로 갱신됩니다. 챔피언 티어리스트는 매일 오전 6시에 일괄 업데이트됩니다. 라이브 게임 정보는 해당 소환사의 프로필 페이지에서 실시간으로 확인할 수 있습니다.' },
  { id: 7,  cat: '데이터/통계', q: '티어 등급 기준은 무엇인가요?', a: '승률을 기준으로 S+(55% 이상), S(52~55%), A(50~52%), B(48~50%), C(45~48%), D(45% 미만)로 분류합니다. 단순 승률 외에도 픽률과 밴률을 추가로 반영해 메타 영향력까지 종합적으로 평가합니다.' },
  { id: 8,  cat: '데이터/통계', q: '모스트 챔피언은 어떻게 계산되나요?', a: '최근 플레이한 전체 게임 기록을 불러와 챔피언별 게임 수, 승률, 평균 KDA를 집계합니다. 최대 1,000게임까지 분석하며, 소환사 프로필 페이지 하단의 [모스트 챔피언] 탭에서 확인할 수 있습니다.' },
  { id: 9,  cat: '데이터/통계', q: '챔피언 추천 빌드 정보는 어디서 오나요?', a: '챔피언 상세 페이지의 추천 빌드는 상위 랭크 플레이어들의 실제 게임 데이터를 분석해 도출한 아이템 조합, 룬 구성, 스킬 순서입니다. 패치가 바뀔 때마다 지속적으로 업데이트됩니다.' },
  { id: 10, cat: '계정', q: 'more.lol에 로그인이 필요한가요?', a: '전적 검색, 티어리스트, AI 분석, 챔피언 통계 확인은 모두 로그인 없이 이용 가능합니다. 로그인 시 커뮤니티 글쓰기·댓글, 문의하기 등의 추가 기능을 이용할 수 있습니다.' },
  { id: 11, cat: '계정', q: '계정은 어떻게 만드나요?', a: '메인 페이지 우측 상단의 [로그인] 버튼 클릭 후 이메일 주소와 비밀번호를 입력하면 회원가입이 완료됩니다. 별도의 이메일 인증 없이 바로 서비스를 이용할 수 있습니다.' },
  { id: 12, cat: '기술/오류', q: '전적이 갱신되지 않아요. 어떻게 해야 하나요?', a: '소환사 프로필 페이지 우측 상단의 [갱신] 버튼을 클릭하면 최신 전적을 불러옵니다. 갱신은 2분에 1회로 제한되어 있습니다. 반복적으로 갱신이 안 될 경우 Riot API 서버 점검 중일 수 있으니 잠시 후 다시 시도해 주세요.' },
  { id: 13, cat: '기술/오류', q: '소환사를 검색했는데 "찾을 수 없습니다"라고 나와요.', a: '소환사명과 태그를 정확히 입력했는지 확인해 주세요. 2023년 이후 라이엇 계정 시스템이 변경되어 닉네임#태그 형식이 필수입니다. 태그를 모를 경우 롤 클라이언트 프로필에서 확인할 수 있습니다.' },
  { id: 14, cat: '기술/오류', q: 'AI 분석이 "시간 초과"로 실패해요.', a: 'AI 분석 서버가 일시적으로 응답이 늦을 때 발생합니다. 잠시 후 다시 [🤖 AI 분석] 버튼을 눌러보세요. 반복적으로 실패할 경우 문의하기 페이지를 통해 알려주세요.' },
  { id: 15, cat: '기타', q: 'more.lol은 Riot Games와 공식 파트너인가요?', a: 'more.lol은 Riot Games와 공식적으로 제휴하지 않으며, Riot Games의 공개 API를 활용하여 운영되는 독립 서비스입니다. 사이트 내 모든 게임 관련 이미지와 데이터의 저작권은 Riot Games에 있습니다.' },
  { id: 16, cat: '기타', q: '버그나 오류를 발견했을 때 어떻게 신고하나요?', a: '메인 페이지 하단 또는 헤더의 [문의하기] 메뉴를 통해 신고할 수 있습니다. 발생한 상황, 사용 중인 브라우저 종류, 오류 메시지를 함께 남겨주시면 빠르게 처리할 수 있습니다.' },
  { id: 17, cat: '기타', q: '개인정보는 어떻게 처리되나요?', a: '검색한 소환사명은 서비스 품질 개선을 위해 저장될 수 있습니다. 회원 가입 시 입력한 이메일은 계정 관리 목적으로만 사용되며 제3자에게 제공되지 않습니다. 자세한 내용은 개인정보처리방침 페이지를 확인해 주세요.' },
]

export default function FaqPage() {
  const [activeCat, setActiveCat] = useState('전체')
  const [openId, setOpenId] = useState<number | null>(1)
  const filtered = activeCat === '전체' ? faqs : faqs.filter(f => f.cat === activeCat)
  return (
    <div className="subpage faq-page">
      <div className="subpage-header">
        <div className="subpage-header-inner">
          <div>
            <h1 className="subpage-title">자주 묻는 질문</h1>
            <p className="subpage-desc">more.lol 이용에 관한 궁금증을 해결해 드립니다</p>
          </div>
          <div className="subpage-meta"><span className="patch-badge">FAQ</span></div>
        </div>
      </div>
      <div className="subpage-body">
        <div className="faq-cats">
          {categories.map(c => (
            <button key={c} className={`faq-cat ${activeCat === c ? 'active' : ''}`} onClick={() => setActiveCat(c)}>{c}</button>
          ))}
        </div>
        <div className="faq-list">
          {filtered.map(f => (
            <div key={f.id} className={`faq-item ${openId === f.id ? 'open' : ''}`}>
              <div className="faq-question" onClick={() => setOpenId(openId === f.id ? null : f.id)}>
                <span className="faq-q-mark">Q</span>
                <span className="faq-q-text">{f.q}</span>
                <span className="faq-arrow">&#x23c4;</span>
              </div>
              {openId === f.id && <div className="faq-answer">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
