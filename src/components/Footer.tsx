import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <div className="footer-logo">
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
            <a href="#">전적 검색</a>
            <a href="#">챔피언 분석</a>
            <a href="#">티어리스트</a>
            <a href="#">ARAM 통계</a>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">정보</div>
            <a href="#">공지사항</a>
            <a href="#">자주 묻는 질문</a>
            <a href="#">문의하기</a>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">약관</div>
            <a href="#">이용약관</a>
            <a href="#">개인정보처리방침</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 more.lol. All rights reserved.</span>
        <span>more.lol isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games.</span>
      </div>
    </footer>
  )
}
