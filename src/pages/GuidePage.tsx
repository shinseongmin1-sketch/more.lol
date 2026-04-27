import './SubPage.css'
import './GuidePage.css'

const guides = [
  {
    id: 1,
    icon: '🔍',
    title: '소환사 전적 검색하기',
    steps: [
      { step: '01', desc: '메인 페이지 검색창에 소환사명을 입력합니다. "소환사명#태그" 형식(예: Hide on bush#KR1) 또는 소환사명만 입력해도 됩니다.' },
      { step: '02', desc: '검색창 아래 드롭다운에서 최근 검색 기록이나 자동완성 결과를 선택하거나, 엔터를 눌러 바로 검색할 수 있습니다.' },
      { step: '03', desc: '전적 페이지에서 솔로랭크·자유랭크·일반·칼바람 필터를 선택해 원하는 게임 유형만 확인합니다.' },
      { step: '04', desc: '각 경기 카드를 클릭하면 팀 구성, 아이템, KDA 상세 정보를 펼쳐볼 수 있습니다.' },
    ],
    tip: '태그를 모를 경우 롤 클라이언트 프로필 화면에서 닉네임 아래에 표시되는 #태그를 확인하세요.',
  },
  {
    id: 2,
    icon: '🤖',
    title: 'AI 게임 분석 활용하기',
    steps: [
      { step: '01', desc: '소환사 전적 페이지에서 분석하고 싶은 경기를 찾습니다.' },
      { step: '02', desc: '경기 카드 오른쪽의 [🤖 AI 분석] 버튼을 클릭합니다.' },
      { step: '03', desc: 'AI가 타임라인 데이터를 분석하는 동안 잠시 기다립니다. 보통 3~10초 정도 걸립니다.' },
      { step: '04', desc: '⚔️ 초반 운영 / 🏯 오브젝트 / 🔥 한타 / 💡 총평 형식으로 피드백이 표시됩니다.' },
    ],
    tip: '킬관여율이 낮은 경기는 "팀원에게 의존한 경기"로, 높은 경우 "팀에 기여한 경기"로 분석됩니다. 총평을 중심으로 개선점을 파악하세요.',
  },
  {
    id: 3,
    icon: '📊',
    title: '챔피언 티어리스트 보는 법',
    steps: [
      { step: '01', desc: '상단 메뉴에서 [솔로랭크 통계], [일반게임 통계], [칼바람나락 통계] 중 원하는 모드를 선택합니다.' },
      { step: '02', desc: '포지션 필터(탑·정글·미드·원딜·서폿)로 원하는 라인의 챔피언만 걸러볼 수 있습니다.' },
      { step: '03', desc: '티어는 S+(55% 이상)부터 D(45% 미만)까지 6단계로 구분되며, 픽률과 밴률도 함께 표시됩니다.' },
      { step: '04', desc: '챔피언 이름을 클릭하면 해당 챔피언의 상세 페이지로 이동해 추천 빌드와 스킬 순서를 확인할 수 있습니다.' },
    ],
    tip: '픽률이 높지 않더라도 승률이 S+ 챔피언은 숙련도가 높을수록 강한 경우가 많습니다. 밴률까지 함께 고려해 챔피언 풀을 구성해보세요.',
  },
  {
    id: 4,
    icon: '🏆',
    title: '랭킹 및 프로·스트리머 검색',
    steps: [
      { step: '01', desc: '상단 메뉴의 [랭킹]을 클릭하면 한국 서버 소환사 랭킹 순위를 확인할 수 있습니다.' },
      { step: '02', desc: '메인 검색창에 프로게이머나 스트리머 이름(예: 페이커, 도파)을 입력하면 해당 계정이 자동완성으로 표시됩니다.' },
      { step: '03', desc: '소환사 프로필 페이지에서 [랭크 변동 그래프]로 LP 히스토리를 확인하고, [모스트 챔피언]으로 주력 챔피언을 파악합니다.' },
    ],
    tip: '프로게이머 부계정도 등록되어 있으니 메인 계정 검색이 안 될 경우 부계정으로도 검색해보세요.',
  },
  {
    id: 5,
    icon: '🎯',
    title: '포지션 성향 테스트',
    steps: [
      { step: '01', desc: '메인 페이지 검색창 드롭다운 또는 상단 메뉴에서 [포지션 성향 테스트]를 선택합니다.' },
      { step: '02', desc: '12개의 상황별 질문에 솔직하게 답합니다. 정답이 없으니 실제 플레이 성향대로 선택하세요.' },
      { step: '03', desc: '결과 화면에서 추천 포지션, 맞는 챔피언 유형, 플레이 스타일 분석을 확인합니다.' },
    ],
    tip: '입문자라면 추천받은 포지션의 쉬운 챔피언부터 시작해보세요. 포지션 이해도가 높아질수록 성장 속도가 빨라집니다.',
  },
  {
    id: 6,
    icon: '💬',
    title: '커뮤니티 이용하기',
    steps: [
      { step: '01', desc: '상단 메뉴의 [커뮤니티]를 클릭합니다. 게시글 읽기는 비로그인 상태에서도 가능합니다.' },
      { step: '02', desc: '글을 작성하려면 우측 상단 [로그인] 후 [글쓰기] 버튼을 클릭합니다.' },
      { step: '03', desc: '챔피언 공략, 메타 분석, 팁, 자유 주제 등 다양한 내용을 공유할 수 있습니다.' },
      { step: '04', desc: '부적절한 게시물은 [신고] 버튼으로 관리팀에 알릴 수 있습니다.' },
    ],
    tip: '공략 게시물 작성 시 챔피언명과 포지션을 제목에 포함하면 다른 플레이어들이 검색하기 쉽습니다.',
  },
]

export default function GuidePage() {
  return (
    <div className="subpage guide-page">
      <div className="subpage-header">
        <div className="subpage-header-inner">
          <div>
            <h1 className="subpage-title">more.lol 가이드</h1>
            <p className="subpage-desc">각 기능을 단계별로 알아보세요</p>
          </div>
          <div className="subpage-meta"><span className="patch-badge">GUIDE</span></div>
        </div>
      </div>

      <div className="subpage-body">
        <div className="guide-list">
          {guides.map(g => (
            <section key={g.id} className="guide-card">
              <div className="guide-card-header">
                <span className="guide-icon">{g.icon}</span>
                <h2 className="guide-title">{g.title}</h2>
              </div>
              <div className="guide-steps">
                {g.steps.map(s => (
                  <div key={s.step} className="guide-step">
                    <span className="guide-step-num">{s.step}</span>
                    <p className="guide-step-desc">{s.desc}</p>
                  </div>
                ))}
              </div>
              <div className="guide-tip">
                <span className="guide-tip-label">💡 TIP</span>
                <p>{g.tip}</p>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
