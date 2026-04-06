import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDDVersion, champIconUrl } from '../utils/riotApi'
import {
  statShards, selectedRunes,
  skillOrder, skillMaxOrder,
  startItems, boots, coreItems, fullBuild, situationalItems,
  buildStats, summonerSpells,
} from '../data/garenBuild'
import './ChampionDetailPage.css'

const POSITIONS = ['탑', '정글', '미드', '원딜', '서포터'] as const
const SPELL_KEYS = ['Q', 'W', 'E', 'R'] as const
const SPELL_COLORS: Record<string, string> = { Q: '#3b82f6', W: '#10b981', E: '#8b5cf6', R: '#f59e0b' }
const TAG_KO: Record<string, string> = {
  Fighter: '전사', Tank: '탱커', Mage: '마법사',
  Assassin: '암살자', Support: '서포터', Marksman: '원거리딜러',
}

// 가렌 추천 룬: 주 특성 8000(정밀), 보조 특성 8400(결의)
const PRIMARY_TREE_ID  = 8000
const SECONDARY_TREE_ID = 8400

function cleanHtml(s: string) {
  return s.replace(/<[^>]+>/g, '').replace(/&[a-zA-Z]+;/g, m =>
    ({ '&lt;': '<', '&gt;': '>', '&amp;': '&', '&quot;': '"' }[m] ?? m)
  )
}

export default function ChampionDetailPage() {
  const { champId } = useParams<{ champId: string }>()
  const navigate = useNavigate()

  const [ddVersion, setDdVersion] = useState('')
  const [champData, setChampData] = useState<any>(null)
  const [runeTreeData, setRuneTreeData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState<'build' | 'skills' | 'stats'>('build')
  const [activePos, setActivePos] = useState('탑')

  const isGaren = champId === 'Garen'

  useEffect(() => {
    if (!champId) return
    setLoading(true); setError(false)
    getDDVersion()
      .then(async v => {
        setDdVersion(v)
        const [champRes, runeRes] = await Promise.all([
          fetch(`https://ddragon.leagueoflegends.com/cdn/${v}/data/ko_KR/champion/${champId}.json`),
          fetch(`https://ddragon.leagueoflegends.com/cdn/${v}/data/ko_KR/runesReforged.json`),
        ])
        if (!champRes.ok) throw new Error()
        const champJson = await champRes.json()
        setChampData(champJson.data[champId])
        if (runeRes.ok) {
          const runeJson = await runeRes.json()
          setRuneTreeData(runeJson)
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [champId])

  if (loading) return (
    <div className="cd-loading"><div className="cd-spinner" /><span>불러오는 중...</span></div>
  )
  if (error || !champData) return (
    <div className="cd-loading"><span>챔피언 정보를 불러올 수 없습니다.</span></div>
  )

  const splashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champId}_0.jpg`
  const spellIcon = (img: string) => `https://ddragon.leagueoflegends.com/cdn/${ddVersion}/img/spell/${img}`
  const passiveIcon = (img: string) => `https://ddragon.leagueoflegends.com/cdn/${ddVersion}/img/passive/${img}`
  const itemIcon = (id: string) => `https://ddragon.leagueoflegends.com/cdn/${ddVersion}/img/item/${id}.png`

  // 스킬 순서 행별 마킹
  const skillRows: Record<string, boolean[]> = { Q: [], W: [], E: [], R: [] }
  skillOrder.forEach(s => {
    SPELL_KEYS.forEach(k => skillRows[k].push(s === k))
  })

  return (
    <div className="cd-page">

      {/* ══ 히어로 배너 ══ */}
      <div className="cd-banner" style={{ '--splash': `url(${splashUrl})` } as React.CSSProperties}>
        <div className="cd-banner-overlay" />
        <div className="cd-banner-inner">
          <button className="cd-back" onClick={() => navigate('/champion')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            목록으로
          </button>
          <div className="cd-banner-body">
            <img src={champIconUrl(ddVersion, champId!)} alt={champData.name} className="cd-banner-icon" />
            <div>
              <h1 className="cd-banner-name">{champData.name}</h1>
              <p className="cd-banner-title">{champData.title}</p>
              <div className="cd-banner-tags">
                {champData.tags?.map((t: string) => <span key={t} className="cd-tag-badge">{TAG_KO[t] ?? t}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ 탭 + 포지션 헤더 ══ */}
      <div className="cd-header-bar">
        <div className="cd-header-inner">
          <div className="cd-pos-tabs">
            {POSITIONS.map(p => (
              <button key={p} className={`cd-pos-tab${activePos === p ? ' active' : ''}`} onClick={() => setActivePos(p)}>
                {p}
                {p === '탑' && isGaren && <span className="cd-pos-main-dot" />}
              </button>
            ))}
          </div>
          {isGaren && (
            <div className="cd-header-stats">
              <div className="cd-hstat">
                <span className={`cd-tier-badge tier-${buildStats.tier}`}>{buildStats.tier}</span>
              </div>
              <div className="cd-hstat"><span className="cd-hstat-val wr">{buildStats.winRate}%</span><span className="cd-hstat-lbl">승률</span></div>
              <div className="cd-hstat"><span className="cd-hstat-val">{buildStats.pickRate}%</span><span className="cd-hstat-lbl">픽률</span></div>
              <div className="cd-hstat"><span className="cd-hstat-val">{buildStats.banRate}%</span><span className="cd-hstat-lbl">밴률</span></div>
              <div className="cd-hstat"><span className="cd-hstat-val">{buildStats.games.toLocaleString()}</span><span className="cd-hstat-lbl">게임 수</span></div>
            </div>
          )}
        </div>
      </div>

      {/* ══ 탭 메뉴 ══ */}
      <div className="cd-tab-nav">
        {(['build','skills','stats'] as const).map(t => (
          <button key={t} className={`cd-tab-btn${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'build' ? '빌드 & 룬' : t === 'skills' ? '스킬' : '스탯 & 스토리'}
          </button>
        ))}
      </div>

      <div className="cd-main">

        {/* ══════ 빌드 탭 ══════ */}
        {activeTab === 'build' && isGaren && (() => {
          const RUNE_CDN = 'https://ddragon.leagueoflegends.com/cdn/img/'
          const primTree = runeTreeData.find((t: any) => t.id === PRIMARY_TREE_ID)
          const secTree  = runeTreeData.find((t: any) => t.id === SECONDARY_TREE_ID)
          return (
            <div className="build-cards">

              {/* ── 카드 1: 룬 (인게임 선택 화면) ── */}
              <div className="build-card rune-card">
                <div className="build-card-head">
                  <span className="build-card-icon">💎</span>
                  <span className="build-card-title">룬</span>
                  <span className="build-card-sub">추천 룬 세팅</span>
                </div>
                {(!primTree || !secTree)
                  ? <div className="build-card-body"><p className="build-empty">룬 데이터 로딩 중...</p></div>
                  : (
                    <div className="rune-screen">

                      {/* ── 좌: 주 특성 트리 전체 ── */}
                      <div className="rune-primary">
                        <div className="rune-tree-header">
                          <div className="rune-tree-header-glow" style={{ background: `radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)` }} />
                          <img src={RUNE_CDN + primTree.icon} className="rune-tree-logo" alt="" />
                          <div className="rune-tree-header-text">
                            <span className="rune-tree-name">{primTree.name}</span>
                            <span className="rune-tree-sub">주 특성</span>
                          </div>
                        </div>
                        {primTree.slots.map((slot: any, si: number) => (
                          <div key={si} className={`rune-tree-row ${si === 0 ? 'rune-keystone-row' : ''}`}>
                            {slot.runes.map((r: any) => {
                              const sel = selectedRunes.has(r.id)
                              return (
                                <div key={r.id} className={`rune-circle ${si === 0 ? 'keystone' : ''} ${sel ? 'sel' : ''}`}>
                                  <div className="rune-circle-ring" />
                                  <img src={RUNE_CDN + r.icon} alt={r.name} />
                                  <div className="rune-tooltip">
                                    <span className="rune-tooltip-name">{r.name}</span>
                                    <span className="rune-tooltip-desc">{cleanHtml(r.shortDesc ?? r.longDesc ?? '')}</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ))}
                      </div>

                      {/* ── 우: 보조 특성 + 스탯 파편 ── */}
                      <div className="rune-secondary-wrap">

                        {/* 보조 특성 */}
                        <div className="rune-secondary">
                          <div className="rune-tree-header rune-tree-header-sm">
                            <img src={RUNE_CDN + secTree.icon} className="rune-tree-logo rune-tree-logo-sm" alt="" />
                            <div className="rune-tree-header-text">
                              <span className="rune-tree-name">{secTree.name}</span>
                              <span className="rune-tree-sub">보조 특성</span>
                            </div>
                          </div>
                          {secTree.slots.slice(1).map((slot: any, si: number) => (
                            <div key={si} className="rune-tree-row rune-tree-row-sm">
                              {slot.runes.map((r: any) => {
                                const sel = selectedRunes.has(r.id)
                                return (
                                  <div key={r.id} className={`rune-circle rune-circle-sm ${sel ? 'sel' : ''}`}>
                                    <div className="rune-circle-ring" />
                                    <img src={RUNE_CDN + r.icon} alt={r.name} />
                                    <div className="rune-tooltip rune-tooltip-left">
                                      <span className="rune-tooltip-name">{r.name}</span>
                                      <span className="rune-tooltip-desc">{cleanHtml(r.shortDesc ?? r.longDesc ?? '')}</span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ))}
                        </div>

                        {/* 스탯 파편 */}
                        <div className="rune-shards">
                          <span className="rune-shards-title">스탯 파편</span>
                          {(['offense','flex','defense'] as const).map((row, ri) => {
                            const labels = ['공격', '유연', '방어']
                            return (
                              <div key={row} className="rune-shard-row">
                                <span className="rune-shard-label">{labels[ri]}</span>
                                {statShards[row].map(s => (
                                  <div key={s.id} className={`rune-circle rune-circle-shard ${s.id === statShards.selected[ri] ? 'sel' : ''}`}>
                                    <div className="rune-circle-ring" />
                                    <img src={s.icon} alt={s.name} />
                                    <div className="rune-tooltip rune-tooltip-left">
                                      <span className="rune-tooltip-name">{s.name}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )
                          })}
                        </div>

                      </div>
                    </div>
                  )
                }
              </div>

              {/* ── 카드 2: 소환사 주문 ── */}
              <div className="build-card">
                <div className="build-card-head">
                  <span className="build-card-icon">⚡</span>
                  <span className="build-card-title">소환사 주문</span>
                  <span className="build-card-sub">추천 소환사 주문 2개</span>
                </div>
                <div className="build-card-body">
                  <div className="spell-row">
                    {summonerSpells.map(s => (
                      <div key={s.id} className="spell-item">
                        <img src={`https://ddragon.leagueoflegends.com/cdn/${ddVersion}/img/spell/${s.id}.png`} alt={s.name} />
                        <span>{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── 카드 3: 아이템 빌드 ── */}
              <div className="build-card">
                <div className="build-card-head">
                  <span className="build-card-icon">🛡️</span>
                  <span className="build-card-title">아이템 빌드</span>
                  <span className="build-card-sub">추천 빌드 순서</span>
                </div>
                <div className="build-card-body">
                  {[
                    { label: '시작 아이템', items: startItems },
                    { label: '신발',        items: [boots] },
                    { label: '코어 아이템', items: coreItems },
                    { label: '완성 빌드',   items: fullBuild },
                    { label: '상황별 아이템', items: situationalItems },
                  ].map(({ label, items }) => (
                    <div key={label} className="item-group">
                      <span className="item-group-label">{label}</span>
                      <div className="item-flow">
                        {items.map((item, i) => (
                          <div key={item.id} className="item-flow-cell">
                            {i > 0 && <span className="item-arrow">›</span>}
                            <div className="item-box" title={item.name}>
                              <img src={itemIcon(item.id)} alt={item.name} />
                              <span>{item.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── 카드 4: 스킬 순서 ── */}
              <div className="build-card">
                <div className="build-card-head">
                  <span className="build-card-icon">📋</span>
                  <span className="build-card-title">스킬 순서</span>
                  <span className="build-card-sub">레벨별 스킬 찍는 순서</span>
                </div>
                <div className="build-card-body">
                  {/* 최대 올리는 순서 */}
                  <div className="skill-maxorder">
                    <span className="skill-maxorder-label">스킬 우선순위</span>
                    <div className="skill-maxorder-items">
                      {skillMaxOrder.map((k, i) => (
                        <span key={i} className="skill-maxorder-item">
                          {i > 0 && <span className="skill-maxorder-arrow">›</span>}
                          <img src={spellIcon(champData.spells[SPELL_KEYS.indexOf(k as typeof SPELL_KEYS[number])].image.full)} alt={k} />
                          <span style={{ color: SPELL_COLORS[k] }}>{k}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* 레벨별 스킬 표 */}
                  <div className="skill-table">
                    <div className="skill-table-lvrow">
                      <div className="skill-table-label-col" />
                      {Array.from({ length: 18 }, (_, i) => (
                        <div key={i} className="skill-table-lv">{i + 1}</div>
                      ))}
                    </div>
                    {SPELL_KEYS.map((key, ki) => (
                      <div key={key} className="skill-table-row">
                        <div className="skill-table-label-col">
                          <img src={spellIcon(champData.spells[ki].image.full)} alt={key} />
                          <span style={{ color: SPELL_COLORS[key] }}>{key}</span>
                        </div>
                        {skillRows[key].map((active, li) => (
                          <div key={li} className="skill-table-cell">
                            <div
                              className={`skill-dot ${active ? 'active' : ''}`}
                              style={active ? { background: SPELL_COLORS[key], boxShadow: `0 0 6px ${SPELL_COLORS[key]}99` } : {}}
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )
        })()}

        {/* 다른 챔피언 빌드 탭 (데이터 미지원) */}
        {activeTab === 'build' && !isGaren && (
          <div className="cd-no-data">
            <div className="cd-no-data-icon">🔧</div>
            <p>해당 챔피언의 빌드 데이터를 수집 중입니다.</p>
          </div>
        )}

        {/* ══════ 스킬 탭 ══════ */}
        {activeTab === 'skills' && (
          <div className="cd-skills-list">
            {/* 패시브 */}
            <div className="cd-skill-card">
              <div className="cd-sk-side">
                <div className="cd-sk-badge" style={{ background: '#4b556322' }}>P</div>
                <img src={passiveIcon(champData.passive.image.full)} className="cd-sk-icon" alt="P" />
              </div>
              <div className="cd-sk-body">
                <div className="cd-sk-title">{champData.passive.name} <span className="cd-sk-tag passive">패시브</span></div>
                <div className="cd-sk-desc">{cleanHtml(champData.passive.description)}</div>
              </div>
            </div>

            {champData.spells.map((spell: any, i: number) => (
              <div key={spell.id} className="cd-skill-card">
                <div className="cd-sk-side">
                  <div className="cd-sk-badge" style={{ background: SPELL_COLORS[SPELL_KEYS[i]] + '22', border: `1px solid ${SPELL_COLORS[SPELL_KEYS[i]]}44` }}>
                    <span style={{ color: SPELL_COLORS[SPELL_KEYS[i]] }}>{SPELL_KEYS[i]}</span>
                  </div>
                  <img src={spellIcon(spell.image.full)} className="cd-sk-icon" alt={SPELL_KEYS[i]} />
                </div>
                <div className="cd-sk-body">
                  <div className="cd-sk-title">{spell.name}</div>
                  <div className="cd-sk-meta">
                    <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> {spell.cooldownBurn}초</span>
                    {spell.costBurn !== '0' && <span>마나 {spell.costBurn}</span>}
                    <span>사거리 {spell.rangeBurn}</span>
                    <span>최대 {spell.maxrank}레벨</span>
                  </div>
                  <div className="cd-sk-desc">{cleanHtml(spell.description)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════ 스탯 탭 ══════ */}
        {activeTab === 'stats' && (
          <div className="cd-stats-wrap">
            <div className="cd-card cd-stats-card">
              <div className="cd-card-head"><span>기본 스탯 (레벨 1)</span></div>
              <div className="cd-stat-grid">
                {[
                  ['체력', champData.stats.hp],
                  ['마나', champData.stats.mp],
                  ['이동 속도', champData.stats.movespeed],
                  ['방어력', champData.stats.armor],
                  ['마법 저항력', champData.stats.spellblock],
                  ['공격 사거리', champData.stats.attackrange],
                  ['공격력', champData.stats.attackdamage],
                  ['공격 속도', champData.stats.attackspeed?.toFixed(3)],
                  ['체력 재생', champData.stats.hpregen],
                ].map(([label, val]) => val != null && (
                  <div key={label as string} className="cd-stat-row">
                    <span>{label}</span><span className="cd-sv">{val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="cd-card cd-lore-card">
              <div className="cd-card-head"><span>배경 스토리</span></div>
              <p className="cd-lore">{champData.lore}</p>
              {champData.allytips?.length > 0 && <>
                <div className="cd-card-head" style={{marginTop:20}}><span>아군 팁</span></div>
                <ul className="cd-tips">{champData.allytips.map((t:string,i:number)=><li key={i}>{cleanHtml(t)}</li>)}</ul>
              </>}
              {champData.enemytips?.length > 0 && <>
                <div className="cd-card-head" style={{marginTop:20}}><span>적군 팁</span></div>
                <ul className="cd-tips enemy">{champData.enemytips.map((t:string,i:number)=><li key={i}>{cleanHtml(t)}</li>)}</ul>
              </>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
