import './SubPage.css'
import './InfoPage.css'

export default function InfoPage() {
  return (
    <div className="subpage info-page">
      <div className="subpage-header">
        <div className="subpage-header-inner">
          <div>
            <h1 className="subpage-title">이용 안내</h1>
            <p className="subpage-desc">데이터 기준, 업데이트 주기, 이용 조건을 안내합니다</p>
          </div>
          <div className="subpage-meta"><span className="patch-badge">INFO</span></div>
        </div>
      </div>

      <div className="subpage-body">
        <section className="info-section">
          <h2 className="info-section-title">데이터 기준 안내</h2>
          <div className="info-table">
            <div className="info-row">
              <div className="info-label">소환사 전적</div>
              <div className="info-value">Riot Games API 실시간 연동 / 검색 시마다 갱신 (2분 쿨타임)</div>
            </div>
            <div className="info-row">
              <div className="info-label">솔로랭크 티어리스트</div>
              <div className="info-value">챌린저 구간 기준 / 매일 오전 6시 업데이트</div>
            </div>
            <div className="info-row">
              <div className="info-label">일반게임 티어리스트</div>
              <div className="info-value">최근 14일 일반게임 데이터 기준 / 매일 오전 6시 업데이트</div>
            </div>
            <div className="info-row">
              <div className="info-label">칼바람 티어리스트</div>
              <div className="info-value">최근 14일 ARAM 데이터 기준 / 매일 오전 6시 업데이트</div>
            </div>
            <div className="info-row">
              <div className="info-label">AI 분석</div>
              <div className="info-value">경기별 최초 1회 분석 후 결과 저장 (동일 경기 재분석 불필요)</div>
            </div>
            <div className="info-row">
              <div className="info-label">라이브 게임</div>
              <div className="info-value">현재 진행 중인 게임 실시간 조회 / 30초 간격 갱신</div>
            </div>
            <div className="info-row">
              <div className="info-label">랭크 변동 히스토리</div>
              <div className="info-value">소환사 검색 시 자동 기록 / 최근 60일 보관</div>
            </div>
          </div>
        </section>

        <section className="info-section">
          <h2 className="info-section-title">티어 등급 산정 기준</h2>
          <p className="info-text">
            챔피언 티어는 승률을 기본 지표로 하되, 픽률과 밴률을 보정값으로 반영해 최종 등급을 산정합니다.
            픽률이 극히 낮은 챔피언은 샘플 수 부족으로 데이터 신뢰도가 낮아 등급이 표시되지 않을 수 있습니다.
          </p>
          <div className="info-tier-table">
            <div className="info-tier-row header">
              <span>등급</span><span>승률 기준</span><span>의미</span>
            </div>
            <div className="info-tier-row"><span className="tier-badge s-plus">S+</span><span>55% 이상</span><span>현재 메타 최강 챔피언</span></div>
            <div className="info-tier-row"><span className="tier-badge s">S</span><span>52 ~ 55%</span><span>매우 강한 챔피언</span></div>
            <div className="info-tier-row"><span className="tier-badge a">A</span><span>50 ~ 52%</span><span>준수한 성능의 챔피언</span></div>
            <div className="info-tier-row"><span className="tier-badge b">B</span><span>48 ~ 50%</span><span>평균 수준의 챔피언</span></div>
            <div className="info-tier-row"><span className="tier-badge c">C</span><span>45 ~ 48%</span><span>다소 약한 챔피언</span></div>
            <div className="info-tier-row"><span className="tier-badge d">D</span><span>45% 미만</span><span>현재 메타에서 불리한 챔피언</span></div>
          </div>
          <p className="info-text info-text-sm">
            ※ 티어는 메타 변화에 따라 달라질 수 있으며, 플레이어의 숙련도에 따라 실제 성과는 다를 수 있습니다.
          </p>
        </section>

        <section className="info-section">
          <h2 className="info-section-title">이용 조건</h2>
          <div className="info-conditions">
            <div className="info-condition">
              <h3 className="info-condition-title">무료 이용</h3>
              <p className="info-text">
                more.lol의 모든 핵심 기능(전적 검색, AI 분석, 티어리스트, 챔피언 정보)은 완전 무료로 제공됩니다.
                별도의 결제나 구독 없이 이용할 수 있습니다.
              </p>
            </div>
            <div className="info-condition">
              <h3 className="info-condition-title">회원가입 없이 이용 가능한 기능</h3>
              <ul className="info-list">
                <li>소환사 전적 검색 및 AI 분석</li>
                <li>챔피언 티어리스트 (솔로랭크·일반·칼바람)</li>
                <li>챔피언 상세 정보 및 추천 빌드</li>
                <li>소환사 랭킹</li>
                <li>포지션 성향 테스트</li>
                <li>커뮤니티 게시글 읽기</li>
              </ul>
            </div>
            <div className="info-condition">
              <h3 className="info-condition-title">회원가입 후 이용 가능한 기능</h3>
              <ul className="info-list">
                <li>커뮤니티 글쓰기 및 댓글</li>
                <li>문의하기 및 건의사항 제출</li>
                <li>프로필 설정 및 닉네임 등록</li>
              </ul>
            </div>
            <div className="info-condition">
              <h3 className="info-condition-title">이용 제한</h3>
              <ul className="info-list">
                <li>전적 갱신: 동일 소환사 기준 2분에 1회</li>
                <li>AI 분석: 동일 경기는 최초 1회만 분석 (이후 저장된 결과 표시)</li>
                <li>만 14세 미만은 회원가입이 제한됩니다</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="info-section">
          <h2 className="info-section-title">저작권 및 면책 고지</h2>
          <p className="info-text">
            more.lol은 Riot Games와 공식적으로 제휴하지 않은 독립 서비스입니다.
            사이트 내에 사용된 리그 오브 레전드 관련 이미지, 챔피언 데이터, 게임 아이콘 등의 저작권은 Riot Games, Inc.에 있습니다.
          </p>
          <p className="info-text">
            more.lol에서 제공하는 티어 정보, AI 분석 결과, 통계 데이터는 참고용으로만 활용하시기 바랍니다.
            데이터의 정확성을 위해 노력하지만, Riot API의 일시적 오류나 지연으로 인해 실제와 다를 수 있습니다.
          </p>
          <p className="info-text">
            문의사항이나 오류 제보는 <strong>문의하기</strong> 페이지를 통해 남겨주시면 빠르게 처리해 드리겠습니다.
          </p>
        </section>
      </div>
    </div>
  )
}
