import ChampionTierList from '../components/ChampionTierList'
import './SubPage.css'

export default function NormalPage() {
  return (
    <div className="subpage">
      <div className="subpage-header">
        <div className="subpage-header-inner">
          <div>
            <h1 className="subpage-title">일반게임 티어리스트</h1>
            <p className="subpage-desc">5v5 일반게임 챔피언 승률 · 픽률 분석</p>
          </div>
          <div className="subpage-meta">
            <span className="patch-badge">14.24 패치</span>
            <span className="update-info">
              <span className="update-dot" />
              실시간 업데이트
            </span>
          </div>
        </div>
      </div>
      <div className="subpage-body">
        <ChampionTierList mode="normal" />
      </div>
    </div>
  )
}
