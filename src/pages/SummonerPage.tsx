import { useParams } from 'react-router-dom'
import './SummonerPage.css'

const mockMatches = [
  { id: 1, win: true, mode: 'ARAM', champion: '럭스', kda: '8/3/18', cs: 0, duration: '24:12', ago: '12분 전', items: ['#4a90e2', '#ffd43b', '#9b59b6', '#e74c3c', '#00b894', '#fd79a8'] },
  { id: 2, win: false, mode: 'ARAM', champion: '야스오', kda: '12/9/5', cs: 0, duration: '19:34', ago: '1시간 전', items: ['#55efc4', '#fdcb6e', '#4a90e2', '#ff6b6b', '#a29bfe', '#e17055'] },
  { id: 3, win: true, mode: '솔로랭크', champion: '이즈리얼', kda: '7/2/11', cs: 187, duration: '31:48', ago: '2시간 전', items: ['#3498db', '#ffd43b', '#ff6b9d', '#74c0fc', '#9b59b6', '#fdcb6e'] },
  { id: 4, win: true, mode: 'ARAM', champion: '진', kda: '14/4/9', cs: 0, duration: '22:07', ago: '3시간 전', items: ['#ff6b9d', '#ffd43b', '#4a90e2', '#e74c3c', '#00b894', '#a29bfe'] },
  { id: 5, win: false, mode: '솔로랭크', champion: '요네', kda: '6/8/4', cs: 204, duration: '28:55', ago: '5시간 전', items: ['#4a90e2', '#55efc4', '#9b59b6', '#ffd43b', '#ff6b6b', '#e17055'] },
]

const rankInfo = [
  { queue: '솔로랭크', tier: 'GOLD', division: 'II', lp: 84, wins: 47, losses: 43, icon: '#ffd43b' },
  { queue: '자유랭크', tier: 'SILVER', division: 'I', lp: 12, wins: 31, losses: 28, icon: '#b2bec3' },
]

function ItemDot({ color }: { color: string }) {
  return <div className="item-dot" style={{ background: color }} />
}

export default function SummonerPage() {
  const { name } = useParams<{ name: string }>()
  const summonerName = decodeURIComponent(name || '')
  const winCount = mockMatches.filter(m => m.win).length
  const lossCount = mockMatches.length - winCount
  const winRate = Math.round((winCount / mockMatches.length) * 100)

  return (
    <div className="summoner-page">
      <div className="summoner-header">
        <div className="summoner-header-inner">
          <div className="summoner-profile">
            <div className="summoner-avatar">
              <div className="avatar-icon">
                {summonerName.slice(0, 2).toUpperCase()}
              </div>
              <div className="summoner-level">287</div>
            </div>
            <div className="summoner-info">
              <div className="summoner-name-row">
                <h1 className="summoner-name">{summonerName}</h1>
                <span className="summoner-server">KR</span>
              </div>
              <div className="summoner-tag"># KR1</div>
              <div className="summoner-actions">
                <button className="btn-refresh">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  전적 갱신
                </button>
                <button className="btn-favorite">즐겨찾기</button>
              </div>
            </div>
          </div>

          <div className="summoner-ranks">
            {rankInfo.map(r => (
              <div key={r.queue} className="rank-card">
                <div className="rank-icon" style={{ borderColor: r.icon + '44', background: r.icon + '15' }}>
                  <span style={{ color: r.icon, fontSize: 20, fontWeight: 900 }}>{r.tier[0]}</span>
                </div>
                <div className="rank-details">
                  <div className="rank-queue">{r.queue}</div>
                  <div className="rank-tier" style={{ color: r.icon }}>{r.tier} {r.division}</div>
                  <div className="rank-lp">{r.lp} LP</div>
                  <div className="rank-record">
                    <span className="win-text">{r.wins}승</span>
                    <span className="lose-text">{r.losses}패</span>
                    <span className="rate-text">{Math.round(r.wins / (r.wins + r.losses) * 100)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="summoner-content">
        <div className="summoner-content-inner">
          <div className="content-left">
            <div className="recent-summary-card">
              <div className="summary-header">최근 {mockMatches.length}게임</div>
              <div className="summary-body">
                <div className="summary-circle">
                  <svg viewBox="0 0 80 80" className="circle-svg">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="var(--bg-secondary)" strokeWidth="8" />
                    <circle cx="40" cy="40" r="32" fill="none" stroke="var(--accent-blue)" strokeWidth="8"
                      strokeDasharray={`${(winRate / 100) * 200.96} 200.96`}
                      strokeLinecap="round"
                      transform="rotate(-90 40 40)" />
                  </svg>
                  <div className="circle-text">
                    <span className="circle-rate">{winRate}%</span>
                  </div>
                </div>
                <div className="summary-stats">
                  <div><span className="win-text">{winCount}승</span> <span className="lose-text">{lossCount}패</span></div>
                  <div className="summary-kda">평균 KDA <strong>3.8</strong></div>
                  <div className="summary-recent">최근 7연승 중</div>
                </div>
              </div>
            </div>

            <div className="most-champs-card">
              <div className="card-title">모스트 챔피언</div>
              {['럭스', '이즈리얼', '진'].map((name, i) => (
                <div key={name} className="most-champ-row">
                  <div className="most-rank">{i + 1}</div>
                  <div className="most-icon" style={{ background: ['#ffd43b22', '#3498db22', '#ff6b9d22'][i], border: `1px solid ${['#ffd43b44', '#3498db44', '#ff6b9d44'][i]}`, borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: ['#ffd43b', '#3498db', '#ff6b9d'][i] }}>
                    {name.slice(0, 2)}
                  </div>
                  <div className="most-info">
                    <div className="most-name">{name}</div>
                    <div className="most-rate">
                      <span className="win-text">62%</span>
                      <span className="most-games"> ({[28, 21, 19][i]}게임)</span>
                    </div>
                  </div>
                  <div className="most-kda-val">{[4.2, 3.8, 3.5][i]}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="content-right">
            <div className="match-list">
              <div className="match-list-header">
                <div className="match-filters">
                  {['전체', 'ARAM', '솔로랭크', '일반'].map((f, i) => (
                    <button key={f} className={`match-filter-btn ${i === 0 ? 'active' : ''}`}>{f}</button>
                  ))}
                </div>
              </div>

              {mockMatches.map(match => (
                <div key={match.id} className={`match-card ${match.win ? 'win' : 'lose'}`}>
                  <div className={`match-result-bar ${match.win ? 'win' : 'lose'}`} />
                  <div className="match-mode">{match.mode}</div>
                  <div className="match-champ-icon" style={{ background: '#4a90e222', border: '2px solid #4a90e244', borderRadius: 12, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#4a90e2' }}>
                    {match.champion.slice(0, 2)}
                  </div>
                  <div className="match-main">
                    <div className="match-top">
                      <span className={`match-result-text ${match.win ? 'win' : 'lose'}`}>{match.win ? '승리' : '패배'}</span>
                      <span className="match-champ-name">{match.champion}</span>
                      <span className="match-kda">{match.kda}</span>
                      {match.cs > 0 && <span className="match-cs">CS {match.cs}</span>}
                    </div>
                    <div className="match-items">
                      {match.items.map((color, i) => <ItemDot key={i} color={color} />)}
                    </div>
                  </div>
                  <div className="match-meta">
                    <div className="match-duration">{match.duration}</div>
                    <div className="match-ago">{match.ago}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
