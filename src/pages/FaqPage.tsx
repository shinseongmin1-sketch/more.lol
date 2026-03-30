import { useState } from 'react'
import './SubPage.css'
import './FaqPage.css'

const categories = ['전체', '서비스 이용', '데이터/통계', '계정', '기술/오류', '기타']
const faqs = [
  { id: 1, cat: '서비스 이용', q: 'more.lol은 어떤 서비스인가요?', a: 'more.lol은 리그 오브 레전드 소환사 전적 검색, 챔피언 티어리스트, ARAM 통계 등을 제공하는 무료 분석 플랫폼입니다.' },
  { id: 2, cat: '서비스 이용', q: '소환사 검색은 어떻게 하나요?', a: '메인 페이지 상단의 검색창에 소환사명을 입력하면 됩니다. 닉네임#태그 형식 또는 닉네임만 입력해도 검색됩니다.' },
  { id: 3, cat: '서비스 이용', q: 'ARAM 티어리스트 데이터는 어떻게 산정되나요?', a: 'ARAM 티어리스트는 최근 14일간의 무작위 총력전 게임 데이터를 기반으로 챔피언의 승률, 픽률, KDA 등을 종합하여 S+~D 등급으로 분류합니다.' },
  { id: 4, cat: '데이터/통계', q: '데이터는 얼마나 자주 업데이트되나요?', a: '소환사 전적은 검색 시 실시간으로 갱신됩니다. 챔피언 티어리스트는 매일 오전 6시에 일괄 업데이트됩니다.' },
  { id: 5, cat: '데이터/통계', q: '티어 등급 기준은 무엇인가요?', a: 'S+ 55%이상, S 52~55%, A 50~52%, B 48~50%, C 45~48%, D 45%이하 승률을 기준으로 하며 픽률과 밴률도 반영됩니다.' },
  { id: 6, cat: '계정', q: 'more.lol에 로그인이 필요한가요?', a: '전적 검색, 티어리스트, 통계 확인은 로그인 없이 이용 가능합니다. 로그인 시 즐겨찾기, 커뮤니티 글쓰기 등 추가 기능을 이용할 수 있습니다.' },
  { id: 7, cat: '기술/오류', q: '전적이 갱신되지 않아요. 어떻게 해야 하나요?', a: '소환사 프로필 페이지에서 [갱신] 버튼을 클릭하면 최신 전적을 불러옵니다. 반복적으로 갱신이 안 될 경우 잠시 후 다시 시도해 주세요.' },
  { id: 8, cat: '기타', q: 'more.lol은 Riot Games와 공식 파트너인가요?', a: 'more.lol은 Riot Games와 공식적으로 제휴하지 않으며, Riot Games의 공개 API를 활용하여 운영되는 독립 서비스입니다.' },
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
