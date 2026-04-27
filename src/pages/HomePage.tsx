import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  incrementSummonerSearch,
  getTodaySummonerCount,
  getAnalyzedChampionCount,
  onStatsChange,
} from '../utils/searchStats'
import { getRecentSearches, addRecentSearch, removeRecentSearch } from '../utils/recentSearchStore'
import { getDDVersion, champIconUrl, getChampMap } from '../utils/riotApi'
import { searchSummoners } from '../utils/supabase'
import { findCelebrity, searchCelebrities, type Celebrity } from '../data/celebrities'
import { getPatchChange } from '../data/patchChanges'
import './HomePage.css'

const quickLinks = [
  { path: '/ranked',    label: '솔로랭크 통계',   desc: '랭크 게임 챔피언 티어',      color: '#f59e0b' },
  { path: '/normal',    label: '일반게임 통계',   desc: '일반게임 챔피언 승률 분석',  color: '#10b981' },
  { path: '/aram',      label: '칼바람나락 통계', desc: '칼바람나락 챔피언 분석',     color: '#0ea5e9' },
  { path: '/champion',  label: '챔피언 분석',     desc: '챔피언별 심층 데이터',       color: '#6366f1' },
  { path: '/ranking',   label: '랭킹',           desc: '소환사 랭킹 순위',           color: '#e879f9' },
  { path: '/community', label: '커뮤니티',        desc: '공략, 팁, 자유게시판',       color: '#f97316' },
  { path: '/notice',    label: 'Morelol 공지사항', desc: '서비스 업데이트 및 점검 안내', color: '#14b8a6' },
  { path: '/contact',   label: '문의하기',         desc: '버그 신고 및 서비스 문의',   color: '#8b5cf6' },
  { path: 'https://www.leagueoflegends.com/ko-kr/news/game-updates/', label: 'Riot 패치노트', desc: '최신 밸런스 패치 내역 확인', color: '#f43f5e', external: true },
]

interface HotChamp {
  position: string
  label: string
  championId: string
  count: number
}

const POSITION_ICONS: Record<string, string> = {
  TOP:     'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-top.png',
  JUNGLE:  'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-jungle.png',
  MIDDLE:  'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-middle.png',
  BOTTOM:  'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-bottom.png',
  UTILITY: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-utility.png',
}

const fallbackChamps: HotChamp[] = [
  { position: 'TOP',     label: '탑',   championId: 'Darius',   count: 0 },
  { position: 'JUNGLE',  label: '정글', championId: 'Vi',       count: 0 },
  { position: 'MIDDLE',  label: '미드', championId: 'Syndra',   count: 0 },
  { position: 'BOTTOM',  label: '원딜', championId: 'Jinx',     count: 0 },
  { position: 'UTILITY', label: '서폿', championId: 'Thresh',   count: 0 },
]

export default function HomePage() {
  const [inputValue, setInputValue] = useState('')
  const [focused, setFocused]       = useState(false)
  const [, setTodayCount] = useState(getTodaySummonerCount)
  const [, setChampCount] = useState(getAnalyzedChampionCount)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<Array<{gameName: string, tagLine: string}>>([])
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [celebSuggestions, setCelebSuggestions] = useState<Celebrity[]>([])
  const [champSuggestions, setChampSuggestions] = useState<Array<{id: string, name: string}>>([])
  const [ddVersion, setDdVersion] = useState('')
  const [hotChamps, setHotChamps] = useState<HotChamp[]>(fallbackChamps)
  const [champNameMap, setChampNameMap] = useState<Record<string, string>>({})
  const navigate = useNavigate()

  useEffect(() => {
    setRecentSearches(getRecentSearches())

    getDDVersion().then(setDdVersion).catch(() => {})

    // 챔피언 한글 이름 맵 (영문ID → 한글명)
    getChampMap().then(map => {
      const rev: Record<string, string> = {}
      Object.values(map).forEach(c => { rev[c.id] = c.name })
      setChampNameMap(rev)
    }).catch(() => {})

    // 포지션별 인기 챔피언
    fetch('/api/popular-champs')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setHotChamps(data) })
      .catch(() => {})

    return onStatsChange(() => {
      setTodayCount(getTodaySummonerCount())
      setChampCount(getAnalyzedChampionCount())
    })
  }, [])

  // 소환사 + 챔피언 자동완성
  useEffect(() => {
    const query = inputValue.trim()
    if (!query) {
      setSuggestions([])
      setCelebSuggestions([])
      setChampSuggestions([])
      setIsSuggesting(false)
      return
    }

    // 챔피언 검색: 한글명(띄어쓰기 무시) 또는 영문ID 부분 일치
    const q = query.toLowerCase()
    const qNoSpace = query.replace(/\s/g, '').toLowerCase()
    const matched = Object.entries(champNameMap)
      .filter(([id, name]) =>
        name.includes(query) ||
        name.replace(/\s/g, '').toLowerCase().includes(qNoSpace) ||
        id.toLowerCase().includes(q)
      )
      .map(([id, name]) => ({ id, name }))
      .slice(0, 5)
    setChampSuggestions(matched)

    setCelebSuggestions(searchCelebrities(query))
    setIsSuggesting(true)
    const timer = setTimeout(async () => {
      const results = await searchSummoners(query)
      setSuggestions(results)
      setIsSuggesting(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [inputValue, champNameMap])

  const handleSearch = (name: string) => {
    if (name.trim()) {
      const celeb = findCelebrity(name.trim())
      const target = celeb ? celeb.account : name.trim()
      incrementSummonerSearch()
      addRecentSearch(target)
      setRecentSearches(getRecentSearches())
      navigate(`/summoner/${encodeURIComponent(target)}`)
    }
  }

  const handleRemoveRecent = (e: React.MouseEvent, name: string) => {
    e.stopPropagation()
    removeRecentSearch(name)
    setRecentSearches(getRecentSearches())
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(inputValue)
  }

  return (
    <div className="home">
      {/* 상단 광고 */}
      <div className="ad-banner top-ad">
        <span className="ad-label">Advertisement</span>
      </div>

      {/* 히어로 */}
      <div className="home-hero">
        <div className="home-hero-bg" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <div className="home-hero-content">
          <h1 className="home-title">
            <span className="home-title-main">More</span>
            <span className="home-title-dot">lol</span>
          </h1>
          <p className="home-subtitle">더 깊은 전적 분석 · 더 정확한 티어 정보</p>

          <form className="home-search-form" onSubmit={handleSubmit}>
            <div className={`home-search-box ${focused ? 'focused' : ''}`}>
              <select className="home-server-select">
                <option>KR</option>
                <option>NA</option>
                <option>EUW</option>
                <option>EUNE</option>
                <option>JP</option>
              </select>
              <div className="home-search-divider" />
              <input
                type="text"
                className="home-search-input"
                placeholder="소환사명 또는 소환사명#태그 입력"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
              />
              <button type="submit" className="home-search-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>
            </div>

            {focused && (() => {
              const q = inputValue.trim()
              const filteredRecents = q
                ? recentSearches.filter(n => n.toLowerCase().includes(q.toLowerCase()))
                : recentSearches
              const showDropdown = filteredRecents.length > 0 || q
              if (!showDropdown) return null
              return (
                <div className="home-dropdown">
                  {filteredRecents.length > 0 && (
                    <>
                      <div className="dropdown-section-title">최근 검색</div>
                      {filteredRecents.map(name => (
                        <div key={name} className="dropdown-item" onMouseDown={() => handleSearch(name)}>
                          <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                          </svg>
                          <span style={{ flex: 1 }}>{name}</span>
                          <span className="dropdown-server">KR</span>
                          <button
                            className="dropdown-remove-btn"
                            onMouseDown={e => handleRemoveRecent(e, name)}
                            aria-label="삭제"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </>
                  )}

                  {q && champSuggestions.length > 0 && (
                    <>
                      <div className="dropdown-section-title">챔피언</div>
                      {champSuggestions.map(c => {
                        const patch = getPatchChange(c.id)
                        return (
                          <div
                            key={c.id}
                            className="dropdown-item"
                            onMouseDown={() => navigate(`/champion/${c.id}`)}
                          >
                            {ddVersion ? (
                              <img
                                src={champIconUrl(ddVersion, c.id)}
                                alt={c.name}
                                style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                              />
                            ) : (
                              <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                              </svg>
                            )}
                            <span style={{ flex: 1 }}>{c.name}</span>
                            {patch && (
                              <span style={{
                                fontSize: 10, fontWeight: 800, color: '#fff',
                                background: patch.color, padding: '2px 7px',
                                borderRadius: 20, marginRight: 4, whiteSpace: 'nowrap',
                              }}>
                                {patch.type === 'buff' ? '▲ 상향' : patch.type === 'nerf' ? '▼ 하향' : '● 조정'}
                              </span>
                            )}
                            <span className="dropdown-server" style={{ color: '#6366f1' }}>{c.id}</span>
                          </div>
                        )
                      })}
                    </>
                  )}

                  {q && celebSuggestions.length > 0 && (
                    <>
                      <div className="dropdown-section-title">프로게이머 / 스트리머</div>
                      {celebSuggestions.map(c => (
                        <div
                          key={c.account}
                          className="dropdown-item"
                          onMouseDown={() => handleSearch(c.displayName)}
                        >
                          <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          <span style={{ flex: 1 }}>
                            {c.displayName}
                            {c.team && <span className="dropdown-tag"> {c.team}</span>}
                          </span>
                          <span className="dropdown-server" style={{ color: c.type === 'pro' ? '#f59e0b' : '#a78bfa' }}>
                            {c.type === 'pro' ? '프로' : '스트리머'}
                          </span>
                        </div>
                      ))}
                    </>
                  )}

                  {q && (
                    <>
                      <div className="dropdown-section-title">
                        소환사 찾기
                        {isSuggesting && <span className="dropdown-loading-dots"><span /><span /><span /></span>}
                      </div>
                      {!isSuggesting && suggestions.length === 0 && celebSuggestions.length === 0 && (
                        <div className="dropdown-empty">검색 결과 없음</div>
                      )}
                      {suggestions.map(s => (
                        <div
                          key={`${s.gameName}#${s.tagLine}`}
                          className="dropdown-item"
                          onMouseDown={() => handleSearch(`${s.gameName}#${s.tagLine}`)}
                        >
                          <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          <span style={{ flex: 1 }}>
                            {s.gameName}
                            <span className="dropdown-tag">#{s.tagLine}</span>
                          </span>
                          <span className="dropdown-server">KR</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )
            })()}
          </form>

        </div>
      </div>

      {/* 본문 */}
      <div className="home-body">
        <div className="home-ad-left ad-side">
          <span className="ad-label">AD</span>
        </div>

        <div className="home-center">
          {/* 중간 광고 */}
          <div className="ad-banner mid-ad">
            <span className="ad-label">Advertisement</span>
          </div>

          {/* 빠른 이동 */}
          <div className="quick-links">
            {quickLinks.map(item => (
              <div
                key={item.path}
                className="quick-card"
                onClick={() => item.external ? window.open(item.path, '_blank', 'noopener noreferrer') : navigate(item.path)}
                style={{ '--card-color': item.color } as React.CSSProperties}
              >
                <div className="quick-label">{item.label}</div>
                <div className="quick-desc">{item.desc}</div>
              </div>
            ))}
          </div>

          {/* 핫 챔피언 */}
          <div className="home-section">
            <div className="home-section-header">
              <h2 className="home-section-title">
                <span className="section-title-dot" />
                포지션별 인기 챔피언
              </h2>
              <span className="home-section-sub">챌린저 실시간 기준</span>
            </div>
            <div className="hot-champs">
              {hotChamps.map((champ) => (
                <div key={champ.position} className="hot-champ-card" onClick={() => navigate(`/champion/${champ.championId}`)}>
                  <img src={POSITION_ICONS[champ.position]} alt={champ.label} className="hot-position-icon" title={champ.label} />
                  {ddVersion ? (
                    <img
                      src={champIconUrl(ddVersion, champ.championId)}
                      alt={champ.championId}
                      className="hot-icon hot-icon-img"
                    />
                  ) : (
                    <div className="hot-icon" />
                  )}
                  <div className="hot-info">
                    <div className="hot-name">{champNameMap[champ.championId] ?? champ.championId}</div>
                    <div className="hot-en">{champ.championId}</div>
                  </div>
                  <div className="hot-right">
                    <div className="hot-wr" style={{ color: 'var(--text-muted)' }}>{champ.count}게임</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="home-ad-right ad-side">
          <span className="ad-label">AD</span>
        </div>
      </div>

      {/* 하단 광고 */}
      <div className="ad-banner bottom-ad">
        <span className="ad-label">Advertisement</span>
      </div>

      {/* 서비스 소개 */}
      <section className="home-about">
        <div className="home-about-inner">
          <h2 className="home-about-title">more.lol이란?</h2>
          <p className="home-about-desc">
            more.lol은 리그 오브 레전드 플레이어를 위한 무료 전적 검색 및 게임 분석 플랫폼입니다.
            Riot Games 공개 API를 기반으로 소환사의 최근 전적, 챔피언 숙련도, 랭크 변동 추이, 포지션별 성과를 한눈에 확인할 수 있습니다.
            단순한 전적 나열을 넘어, AI 분석을 통해 각 게임에서의 강점과 개선점을 구체적으로 짚어드립니다.
          </p>

          <div className="home-features">
            <div className="home-feature-card">
              <div className="home-feature-icon">🔍</div>
              <h3 className="home-feature-title">소환사 전적 검색</h3>
              <p className="home-feature-desc">
                소환사명 또는 소환사명#태그를 입력하면 최근 20게임의 전적을 즉시 확인할 수 있습니다.
                KDA, CS, 시야 점수, 사용 아이템, 룬 구성까지 상세하게 표시됩니다.
                솔로랭크·자유랭크·일반게임·칼바람나락 필터로 원하는 모드만 골라볼 수도 있습니다.
              </p>
            </div>
            <div className="home-feature-card">
              <div className="home-feature-icon">🤖</div>
              <h3 className="home-feature-title">AI 게임 분석</h3>
              <p className="home-feature-desc">
                각 게임마다 AI 분석 버튼을 누르면 초반 운영, 오브젝트 기여, 한타 참여율을 종합해
                맞춤형 피드백을 제공합니다. 단순 통계가 아닌 실질적인 플레이 조언을 받을 수 있습니다.
                킬관여율과 팀 기여도를 함께 분석해 본인이 캐리했는지, 팀원 도움을 받았는지까지 파악합니다.
              </p>
            </div>
            <div className="home-feature-card">
              <div className="home-feature-icon">📊</div>
              <h3 className="home-feature-title">챔피언 티어리스트</h3>
              <p className="home-feature-desc">
                솔로랭크, 일반게임, 칼바람나락 각 모드별 챔피언 티어를 S+부터 D까지 제공합니다.
                챌린저급 게임 데이터를 기반으로 승률·픽률·밴률을 종합 분석하며 매일 오전 6시 업데이트됩니다.
                챔피언 상세 페이지에서 포지션별 추천 빌드와 스킬 순서도 확인할 수 있습니다.
              </p>
            </div>
            <div className="home-feature-card">
              <div className="home-feature-icon">🏆</div>
              <h3 className="home-feature-title">랭킹 & 통계</h3>
              <p className="home-feature-desc">
                한국 서버 소환사 랭킹을 티어·LP 기준으로 확인하고, 프로게이머와 스트리머의 계정도 검색할 수 있습니다.
                포지션 성향 테스트로 내 플레이 스타일에 맞는 포지션을 추천받고,
                커뮤니티에서 다른 플레이어들과 공략·팁을 공유할 수도 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 활용 가이드 */}
      <section className="home-guide">
        <div className="home-guide-inner">
          <h2 className="home-guide-title">이런 분들께 추천합니다</h2>
          <div className="home-guide-list">
            <div className="home-guide-item">
              <span className="home-guide-num">01</span>
              <div>
                <strong>랭크를 올리고 싶은 플레이어</strong>
                <p>내 게임을 AI로 분석해 실수 패턴을 파악하고, 현재 메타에서 강한 챔피언을 티어리스트로 확인하세요. 데이터 기반으로 챔피언 풀을 구성하면 훨씬 효율적으로 랭크를 올릴 수 있습니다.</p>
              </div>
            </div>
            <div className="home-guide-item">
              <span className="home-guide-num">02</span>
              <div>
                <strong>칼바람 나락을 즐기는 플레이어</strong>
                <p>칼바람 전용 챔피언 티어와 승률 데이터를 확인해 무작위로 배정된 챔피언의 강점을 미리 파악하세요. 칼바람은 일반 소환사의 협곡과 메타가 크게 다르기 때문에 별도 분석이 중요합니다.</p>
              </div>
            </div>
            <div className="home-guide-item">
              <span className="home-guide-num">03</span>
              <div>
                <strong>친구·상대방 전적을 확인하고 싶은 플레이어</strong>
                <p>게임 중 만난 상대나 팀원의 소환사명을 검색해 최근 전적, 선호 챔피언, 플레이 스타일을 미리 파악할 수 있습니다. 듀오를 구할 때도 상대방의 데이터를 참고해보세요.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
