import { useNavigate } from 'react-router-dom'
import './SubPage.css'
import './AboutPage.css'

export default function AboutPage() {
  const navigate = useNavigate()
  return (
    <div className="subpage about-page">
      <div className="subpage-header">
        <div className="subpage-header-inner">
          <div>
            <h1 className="subpage-title">서비스 소개</h1>
            <p className="subpage-desc">more.lol이 제공하는 기능과 가치를 소개합니다</p>
          </div>
          <div className="subpage-meta"><span className="patch-badge">ABOUT</span></div>
        </div>
      </div>

      <div className="subpage-body">
        <section className="about-section">
          <h2 className="about-section-title">more.lol이란?</h2>
          <p className="about-text">
            more.lol은 리그 오브 레전드 플레이어를 위해 만들어진 무료 전적 분석 플랫폼입니다.
            Riot Games의 공개 API를 기반으로 소환사의 게임 기록, 챔피언 숙련도, 랭크 변동 추이 등을 분석하여
            플레이어가 자신의 강점과 약점을 객관적으로 파악할 수 있도록 돕습니다.
          </p>
          <p className="about-text">
            단순히 전적을 보여주는 것을 넘어, AI 기반 게임 분석을 통해 각 경기의 초반 운영, 오브젝트 기여, 한타 참여도를
            종합적으로 평가하고 구체적인 피드백을 제공합니다.
            더 나은 플레이어가 되고 싶은 모든 소환사를 위한 서비스입니다.
          </p>
        </section>

        <section className="about-section">
          <h2 className="about-section-title">주요 기능</h2>
          <div className="about-features">
            <div className="about-feature">
              <div className="about-feature-header">
                <span className="about-feature-icon">🔍</span>
                <h3 className="about-feature-name">소환사 전적 검색</h3>
              </div>
              <p className="about-text">
                소환사명 또는 소환사명#태그 형식으로 검색하면 최근 전적을 즉시 확인할 수 있습니다.
                KDA, CS, 시야 점수, 사용 아이템, 룬 구성, 스펠 선택까지 경기별로 상세하게 표시됩니다.
                솔로랭크·자유랭크·일반게임·칼바람나락 모드별 필터로 원하는 게임 유형만 골라 볼 수 있으며,
                라이브 게임 정보를 통해 현재 진행 중인 게임도 실시간으로 확인할 수 있습니다.
              </p>
            </div>
            <div className="about-feature">
              <div className="about-feature-header">
                <span className="about-feature-icon">🤖</span>
                <h3 className="about-feature-name">AI 게임 분석</h3>
              </div>
              <p className="about-text">
                각 경기 카드에서 AI 분석 버튼을 누르면 해당 게임의 타임라인 데이터를 바탕으로
                초반 15분 운영, 오브젝트(드래곤·바론·전령) 기여, 팀파이트 참여율을 분석한 맞춤형 피드백을 받을 수 있습니다.
                팀 전체 KDA 대비 개인 기여도를 함께 분석해 내가 캐리한 경기인지, 팀원 도움으로 이긴 경기인지까지 파악해 드립니다.
              </p>
            </div>
            <div className="about-feature">
              <div className="about-feature-header">
                <span className="about-feature-icon">📊</span>
                <h3 className="about-feature-name">챔피언 티어리스트</h3>
              </div>
              <p className="about-text">
                솔로랭크·일반게임·칼바람나락 각 모드별 챔피언 티어를 S+부터 D까지 제공합니다.
                챌린저급 게임 데이터를 기반으로 승률, 픽률, 밴률을 종합 분석하며 매일 오전 6시에 업데이트됩니다.
                챔피언 상세 페이지에서는 포지션별 추천 빌드, 스킬 순서, 카운터 챔피언 정보도 확인할 수 있습니다.
              </p>
            </div>
            <div className="about-feature">
              <div className="about-feature-header">
                <span className="about-feature-icon">🏆</span>
                <h3 className="about-feature-name">소환사 랭킹</h3>
              </div>
              <p className="about-text">
                한국 서버 소환사들의 랭크 순위를 한눈에 확인하고, 프로게이머 및 스트리머의 계정도 검색할 수 있습니다.
                랭크 변동 추이를 그래프로 시각화해 상승세인지 하락세인지 파악하고,
                모스트 챔피언 분석을 통해 어떤 챔피언에서 가장 좋은 성과를 내는지 알 수 있습니다.
              </p>
            </div>
            <div className="about-feature">
              <div className="about-feature-header">
                <span className="about-feature-icon">🎯</span>
                <h3 className="about-feature-name">포지션 성향 테스트</h3>
              </div>
              <p className="about-text">
                12개의 상황별 질문에 답하면 탑·정글·미드·원딜·서포터 중 내 플레이 스타일에 맞는 포지션을 추천해드립니다.
                공격적인 플레이를 선호하는지, 팀을 서포트하는 스타일인지, 오브젝트에 집중하는 편인지 등
                다양한 성향을 분석해 최적의 포지션과 챔피언 유형을 제안합니다.
              </p>
            </div>
            <div className="about-feature">
              <div className="about-feature-header">
                <span className="about-feature-icon">💬</span>
                <h3 className="about-feature-name">커뮤니티</h3>
              </div>
              <p className="about-text">
                다른 플레이어들과 챔피언 공략, 메타 분석, 팁을 자유롭게 공유할 수 있는 커뮤니티 공간입니다.
                로그인 후 글 작성 및 댓글이 가능하며, 비로그인 상태에서도 게시글 읽기는 가능합니다.
                건전한 커뮤니티 문화를 위해 부적절한 게시물은 신고 기능을 통해 관리됩니다.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2 className="about-section-title">데이터 출처 및 신뢰성</h2>
          <p className="about-text">
            more.lol의 모든 게임 데이터는 Riot Games에서 공식 제공하는 API를 통해 수집됩니다.
            소환사 전적, 챔피언 정보, 매치 상세 데이터 등은 Riot의 공식 서버와 실시간으로 연동되어 정확성을 보장합니다.
            티어리스트는 자체 분석 로직을 통해 승률·픽률·밴률을 종합 계산하며, 매일 최신 데이터로 갱신됩니다.
          </p>
          <p className="about-text">
            more.lol은 Riot Games의 공식 파트너가 아닌 독립 서비스로 운영됩니다.
            사이트에 사용된 챔피언 이미지, 아이콘, 게임 데이터의 저작권은 Riot Games에 있습니다.
          </p>
        </section>

        <section className="about-section">
          <h2 className="about-section-title">이런 분께 추천합니다</h2>
          <div className="about-recommend">
            <div className="about-recommend-item">
              <span className="about-recommend-icon">📈</span>
              <div>
                <strong>랭크를 올리고 싶은 플레이어</strong>
                <p>AI 분석으로 반복되는 실수 패턴을 파악하고, 현재 메타에서 강한 챔피언을 티어리스트로 확인하세요.</p>
              </div>
            </div>
            <div className="about-recommend-item">
              <span className="about-recommend-icon">🎮</span>
              <div>
                <strong>칼바람 나락을 즐기는 플레이어</strong>
                <p>칼바람 전용 챔피언 티어와 승률 데이터로 무작위 배정된 챔피언의 강점을 미리 파악하세요.</p>
              </div>
            </div>
            <div className="about-recommend-item">
              <span className="about-recommend-icon">👥</span>
              <div>
                <strong>팀원·상대방 전적을 확인하고 싶은 플레이어</strong>
                <p>게임 중 만난 소환사의 선호 챔피언과 플레이 스타일을 미리 파악해 전략적으로 대응하세요.</p>
              </div>
            </div>
            <div className="about-recommend-item">
              <span className="about-recommend-icon">🔰</span>
              <div>
                <strong>포지션을 정하지 못한 입문자</strong>
                <p>포지션 성향 테스트로 내 게임 스타일에 맞는 포지션을 추천받고 집중적으로 연습해보세요.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="about-cta">
          <p className="about-cta-text">지금 바로 내 전적을 확인해보세요</p>
          <button className="about-cta-btn" onClick={() => navigate('/')}>전적 검색 시작하기</button>
        </div>
      </div>
    </div>
  )
}
