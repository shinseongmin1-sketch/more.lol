import { Link, useNavigate } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  const navigate = useNavigate()
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <div className="footer-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <span>more</span><span className="footer-logo-dot">lol</span>
          </div>
          <p className="footer-desc">
            더 깊은 리그 오브 레전드 전적 분석 서비스.<br />
            morelol은 Riot Games와 공식적으로 제휴하지 않습니다.
          </p>
        </div>

        {/* 중간 카드 3개 */}
        <div className="footer-cards">
          <Link to="/notice" className="footer-card footer-card-notice">
            <div className="footer-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <div className="footer-card-body">
              <div className="footer-card-title">공지사항</div>
              <div className="footer-card-desc">서비스 업데이트 및 점검 안내</div>
            </div>
            <svg className="footer-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>

          <Link to="/contact" className="footer-card footer-card-contact">
            <div className="footer-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div className="footer-card-body">
              <div className="footer-card-title">문의하기</div>
              <div className="footer-card-desc">버그 신고 및 서비스 문의</div>
            </div>
            <svg className="footer-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>

          <a href="https://www.leagueoflegends.com/ko-kr/news/game-updates/" target="_blank" rel="noopener noreferrer" className="footer-card footer-card-patch">
            <div className="footer-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div className="footer-card-body">
              <div className="footer-card-title">패치노트</div>
              <div className="footer-card-desc">최신 밸런스 패치 내역 확인</div>
            </div>
            <svg className="footer-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <div className="footer-col-title">서비스</div>
            <Link to="/">전적 검색</Link>
            <Link to="/champion">챔피언 분석</Link>
            <Link to="/ranked">솔로랭크 티어</Link>
            <Link to="/aram">ARAM 통계</Link>
            <Link to="/normal">일반게임 통계</Link>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">정보</div>
            <Link to="/notice">공지사항</Link>
            <Link to="/faq">자주 묻는 질문</Link>
            <Link to="/contact">문의하기</Link>
            <a href="https://www.leagueoflegends.com/ko-kr/news/game-updates/" target="_blank" rel="noopener noreferrer">패치노트</a>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">약관</div>
            <Link to="/terms">이용약관</Link>
            <Link to="/privacy">개인정보처리방침</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 morelol. All rights reserved.</span>
        <span>morelol isn't endorsed by Riot Games.</span>
      </div>
    </footer>
  )
}
