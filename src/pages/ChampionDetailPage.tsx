import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDDVersion, champIconUrl } from '../utils/riotApi'
import { statShards } from '../data/garenBuild'
import { ROLE_PRESETS, ROLE_SUMMONERS, ROLE_POSITION } from '../data/champRunePresets'
import { TEMPLATES, getRoleFromTags, makeSkillOrder } from '../data/buildTemplates'
import { CHAMP_BUILDS } from '../data/champBuilds'
import type { RoleName } from '../data/buildTemplates'
import './ChampionDetailPage.css'

const POSITIONS = ['탑', '정글', '미드', '원딜', '서포터'] as const
const SPELL_KEYS = ['Q', 'W', 'E', 'R'] as const
const SPELL_COLORS: Record<string, string> = { Q: '#3b82f6', W: '#10b981', E: '#8b5cf6', R: '#f59e0b' }
const TAG_KO: Record<string, string> = {
  Fighter: '전사', Tank: '탱커', Mage: '마법사',
  Assassin: '암살자', Support: '서포터', Marksman: '원거리딜러',
}

function getRoleForPosition(pos: string, tags: string[]): RoleName {
  switch (pos) {
    case '탑':
      return (tags.includes('Tank') && !tags.includes('Fighter')) ? 'tank' : 'fighter'
    case '정글':
      return 'jungler'
    case '미드':
      return tags.includes('Assassin') ? 'assassin' : 'mage'
    case '원딜':
      return 'marksman'
    case '서포터':
      return (tags.includes('Tank') && !tags.includes('Mage') && !tags.includes('Marksman'))
        ? 'supportTank' : 'supportEnchant'
    default:
      return getRoleFromTags(tags)
  }
}

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
  const [itemData, setItemData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState<'build' | 'skills' | 'stats'>('build')
  const [activePos, setActivePos] = useState('탑')
  const [activePreset, setActivePreset] = useState(0)

  useEffect(() => { setActivePreset(0) }, [champId])

  useEffect(() => {
    if (!champId) return
    setLoading(true); setError(false)
    getDDVersion()
      .then(async v => {
        setDdVersion(v)
        const [champRes, runeRes, itemRes] = await Promise.all([
          fetch(`https://ddragon.leagueoflegends.com/cdn/${v}/data/ko_KR/champion/${champId}.json`),
          fetch(`https://ddragon.leagueoflegends.com/cdn/${v}/data/ko_KR/runesReforged.json`),
          fetch(`https://ddragon.leagueoflegends.com/cdn/${v}/data/ko_KR/item.json`),
        ])
        if (!champRes.ok) throw new Error()
        const champJson = await champRes.json()
        const data = champJson.data[champId]
        setChampData(data)
        // 챔피언의 주 포지션으로 자동 이동
        const initRole = getRoleFromTags(data.tags ?? [])
        setActivePos(ROLE_POSITION[initRole])
        setActivePreset(0)
        if (runeRes.ok) {
          const runeJson = await runeRes.json()
          setRuneTreeData(runeJson)
        }
        if (itemRes.ok) {
          const itemJson = await itemRes.json()
          setItemData(itemJson.data ?? {})
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

  const mainRole = getRoleFromTags(champData.tags ?? [])
  const mainPosition = ROLE_POSITION[mainRole]
  const role = getRoleForPosition(activePos, champData.tags ?? [])
  const template = TEMPLATES[role]
  const presets = ROLE_PRESETS[role]

  const champBuild = CHAMP_BUILDS[champId ?? '']
  const summoners      = champBuild?.summoners     ?? ROLE_SUMMONERS[role]
  const startItems     = champBuild?.startItems    ?? template.startItems
  const buildBoots     = champBuild?.boots         ?? template.boots
  const coreItems      = champBuild?.coreItems     ?? template.coreItems
  const fullBuild      = champBuild?.fullBuild     ?? template.fullBuild
  const skillMaxOrder  = champBuild?.skillMaxOrder ?? template.skillMaxOrder
  const champSkillOrder = makeSkillOrder(...skillMaxOrder)

  const splashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champId}_0.jpg`
  const spellIcon = (img: string) => `https://ddragon.leagueoflegends.com/cdn/${ddVersion}/img/spell/${img}`
  const passiveIcon = (img: string) => `https://ddragon.leagueoflegends.com/cdn/${ddVersion}/img/passive/${img}`
  const itemIcon = (id: string) => `https://ddragon.leagueoflegends.com/cdn/${ddVersion}/img/item/${id}.png`

  const skillRows: Record<string, boolean[]> = { Q: [], W: [], E: [], R: [] }
  champSkillOrder.forEach(s => {
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
              <button key={p} className={`cd-pos-tab${activePos === p ? ' active' : ''}`} onClick={() => { setActivePos(p); setActivePreset(0) }}>
                {p}
                {p === mainPosition && <span className="cd-pos-main-dot" />}
              </button>
            ))}
          </div>
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
        {activeTab === 'build' && (() => {
          const RUNE_CDN = 'https://ddragon.leagueoflegends.com/cdn/img/'
          const preset   = presets[activePreset] ?? presets[0]
          const primTree = runeTreeData.find((t: any) => t.id === preset.primaryTreeId)
          const secTree  = runeTreeData.find((t: any) => t.id === preset.secondaryTreeId)

          const findRuneIcon = (treeId: number, runeId: number): string => {
            const tree = runeTreeData.find((t: any) => t.id === treeId)
            if (!tree) return ''
            for (const slot of tree.slots)
              for (const r of slot.runes)
                if (r.id === runeId) return RUNE_CDN + r.icon
            return RUNE_CDN + tree.icon
          }

          return (
            <div className="build-cards">

              {/* ── 카드 1: 룬 ── */}
              <div className="build-card rune-card">
                <div className="build-card-head">
                  <span className="build-card-icon">💎</span>
                  <span className="build-card-title">룬</span>
                  <span className="build-card-sub">추천 룬 세팅</span>
                </div>

                {/* ── 프리셋 선택 (인게임 추천 3종) ── */}
                <div className="rune-presets">
                  {presets.map((p, i) => {
                    const tree = runeTreeData.find((t: any) => t.id === p.primaryTreeId)
                    const ksIcon = findRuneIcon(p.primaryTreeId, p.keystoneId)
                    return (
                      <button
                        key={i}
                        className={`rune-preset-btn ${activePreset === i ? 'active' : ''}`}
                        onClick={() => setActivePreset(i)}
                      >
                        <div className="rune-preset-icons">
                          {tree && <img src={RUNE_CDN + tree.icon} className="rune-preset-tree-icon" alt="" />}
                          {ksIcon && <img src={ksIcon} className="rune-preset-ks-icon" alt={p.name} />}
                        </div>
                        <span className="rune-preset-name">{p.name}</span>
                        {activePreset === i && <span className="rune-preset-check">✓</span>}
                      </button>
                    )
                  })}
                </div>
                {(!primTree || !secTree)
                  ? <div className="build-card-body"><p className="build-empty">룬 데이터 로딩 중...</p></div>
                  : (
                    <div className="rune-screen">

                      {/* ── 왼쪽: 주 특성 트리 ── */}
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
                              const sel = preset.selectedRunes.has(r.id)
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

                      {/* ── 오른쪽: 보조특성 + 스탯파편 ── */}
                      <div className="rune-right-col">

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
                                const sel = preset.selectedRunes.has(r.id)
                                return (
                                  <div key={r.id} className={`rune-circle rune-circle-sm ${sel ? 'sel' : ''}`}>
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

                        {/* 스탯 파편 */}
                        <div className="rune-shards">
                          <span className="rune-shards-title">스탯 파편</span>
                          {(['offense','flex','defense'] as const).map((row, ri) => {
                            const labels = ['공격', '유연', '방어']
                            return (
                              <div key={row} className="rune-shard-row">
                                <span className="rune-shard-label">{labels[ri]}</span>
                                {statShards[row].map(s => (
                                  <div key={s.id} className={`rune-circle rune-circle-shard ${s.id === preset.statShardSelected[ri] ? 'sel' : ''}`}>
                                    <div className="rune-circle-ring" />
                                    <img src={s.icon} alt={s.name} />
                                    <div className="rune-tooltip">
                                      <span className="rune-tooltip-name">{s.name}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )
                          })}
                        </div>

                      </div>

                      {/* ── 3번째 컬럼: 소환사 주문 + 아이템 빌드 ── */}
                      <div className="rune-extra-col">
                        <div className="rune-inline-section">
                          <span className="rune-inline-title">소환사 주문</span>
                          <div className="rune-inline-spell-row">
                            {summoners.map(s => (
                              <div key={s.id} className="rune-inline-spell">
                                <img src={`https://ddragon.leagueoflegends.com/cdn/${ddVersion}/img/spell/${s.id}.png`} alt={s.name} />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="rune-inline-section">
                          <span className="rune-inline-title">아이템 빌드</span>
                          {(() => {
                            const allItems = [
                              ...startItems,
                              buildBoots,
                              ...coreItems,
                              ...fullBuild,
                            ].filter((item, idx, arr) => arr.findIndex(i => i.id === item.id) === idx)
                            return (
                              <div className="rune-inline-item-row">
                                {allItems.map((item, i) => (
                                  <div key={item.id} className="rune-inline-item-cell">
                                    {i > 0 && <span className="rune-inline-item-arrow">›</span>}
                                    <div className="rune-inline-item-box">
                                      <img src={itemIcon(item.id)} alt={item.name} />
                                      <div className="rune-item-tip">
                                        <span className="rune-item-tip-name">{item.name}</span>
                                        {itemData[item.id]?.plaintext && (
                                          <span className="rune-item-tip-desc">{itemData[item.id].plaintext}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )
                          })()}
                        </div>
                      </div>

                    </div>
                  )
                }
              </div>

              {/* ── 카드 2: 스킬 순서 ── */}
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
