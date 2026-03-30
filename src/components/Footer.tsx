import { Link, useNavigate } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  const navigate = useNavigate()
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <div className="footer-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <span>more</span><span className="footer-logo-dot">.lol</span>
          </div>
          <p className="footer-desc">
            더 깊은 리그 오브 레전드 전적 분석 서비스.<br />
            more.lol은 Riot Games와 공식적으로 제휴하지 않습니다.
          </p>
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
          </div>
          <div className="footer-col">
            <div className="footer-col-title">약관</div>
            <Link to="/terms">이용약관</Link>
            <Link to="/privacy">개인정보처리방침</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 more.lol. All rights reserved.</span>
        <span>more.lol isn't endorsed by Riot Games.</span>
      </div>
    </footer>
  )
}
