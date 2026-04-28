import { useState, useEffect } from 'react'
import './TendencyTestPage.css'
import { getDDVersion, champIconUrl } from '../utils/riotApi'
import { CHAMP_KO_TO_ID } from '../utils/champIdMap'

type ProType = 'allrounder' | 'stable' | 'proactive' | 'creative' | 'laner'
interface ScoreMap { allrounder: number; stable: number; proactive: number; creative: number; laner: number }
interface Option { text: string; scores: ScoreMap }
interface Question { question: string; options: Option[] }

function s(allrounder: number, stable: number, proactive: number, creative: number, laner: number): ScoreMap {
  return { allrounder, stable, proactive, creative, laner }
}

const QUESTIONS: Question[] = [
  {
    question: "롤에서 가장 즐기는 순간은?",
    options: [
      { text: "어떤 챔피언이든 완벽히 소화해 '신기'라는 말을 들을 때", scores: s(3,0,0,1,0) },
      { text: "딜량 1위 + 안정적인 생존으로 팀을 떠받칠 때", scores: s(0,3,0,0,0) },
      { text: "갱킹/로밍으로 먼저 게임 흐름을 만들었을 때", scores: s(0,0,3,0,0) },
      { text: "아무도 생각 못한 픽이나 콤보로 팀을 이끌었을 때", scores: s(0,0,0,3,0) },
      { text: "라인전에서 솔로킬 따내고 혼자 스노우볼 굴릴 때", scores: s(0,0,0,0,3) },
    ]
  },
  {
    question: "챔피언 풀을 늘리는 방식은?",
    options: [
      { text: "지속적으로 새로운 챔피언을 연구하고 익힌다", scores: s(3,1,0,1,0) },
      { text: "믿을 수 있는 2~3개 챔피언을 극한으로 연마한다", scores: s(0,3,0,0,1) },
      { text: "현 메타에서 강한 챔피언을 빠르게 학습한다", scores: s(0,0,3,0,0) },
      { text: "독특하고 창의적인 비주류 픽을 연구한다", scores: s(0,0,0,3,0) },
      { text: "라인전 특화 챔피언만 집중적으로 파고든다", scores: s(0,0,0,0,3) },
    ]
  },
  {
    question: "팀이 유리한 상황에서 나는?",
    options: [
      { text: "상황에 맞게 최적의 운영 방식을 판단한다", scores: s(3,1,1,0,0) },
      { text: "실수 없이 현 유리함을 안정적으로 지킨다", scores: s(0,3,0,0,0) },
      { text: "오브젝트를 빠르게 챙겨 격차를 더 벌린다", scores: s(0,0,3,0,0) },
      { text: "창의적인 픽/이동으로 상대 허를 찌른다", scores: s(0,0,0,3,0) },
      { text: "상대 라이너를 계속 압박해 스플릿으로 끝낸다", scores: s(0,0,0,0,3) },
    ]
  },
  {
    question: "게임이 불리할 때 나는?",
    options: [
      { text: "모든 챔피언의 강점을 살려 역전 플레이를 찾는다", scores: s(3,0,0,1,0) },
      { text: "침착하게 안전 딜을 유지하며 기회를 기다린다", scores: s(0,3,0,0,0) },
      { text: "과감한 역갱킹이나 역이니시로 흐름을 뒤집는다", scores: s(0,0,3,0,0) },
      { text: "상대가 예측 못할 포지션과 타이밍을 만든다", scores: s(0,0,0,3,0) },
      { text: "라인전 압박으로 상대 자원을 빼앗아 역전한다", scores: s(0,0,0,0,3) },
    ]
  },
  {
    question: "한타에서 나의 역할은?",
    options: [
      { text: "상황에 따라 딜, 이니시, 핀치 등 유동적으로 맡는다", scores: s(3,0,0,1,0) },
      { text: "흔들리지 않고 안전한 뒤쪽에서 딜을 넣는다", scores: s(0,3,0,0,0) },
      { text: "적극적으로 이니시에이팅해 싸움을 만든다", scores: s(0,0,3,0,0) },
      { text: "예측 불가능한 포지션 변환으로 적을 혼란시킨다", scores: s(0,0,0,3,0) },
      { text: "상대 라이너와 1:1로 싸워 분리 전투를 만든다", scores: s(0,0,0,0,3) },
    ]
  },
  {
    question: "가장 중요하게 생각하는 스킬은?",
    options: [
      { text: "어떤 챔피언이든 다룰 수 있는 범용 메카닉", scores: s(3,0,0,0,0) },
      { text: "어택무브와 완벽한 포지셔닝", scores: s(0,3,0,0,0) },
      { text: "갱킹/합류 타이밍 판단과 빠른 동선", scores: s(0,0,3,0,0) },
      { text: "창의적인 아이템 빌드와 독창적인 전략", scores: s(0,0,0,3,0) },
      { text: "라인전 CS 우위와 솔로킬 압박 능력", scores: s(0,0,0,0,3) },
    ]
  },
  {
    question: "패치에서 내가 주로 플레이하는 챔피언이 너프됐을 때?",
    options: [
      { text: "다른 강한 챔피언으로 자연스럽게 이동한다", scores: s(3,0,0,0,0) },
      { text: "너프된 챔피언도 극한으로 연마해 살려낸다", scores: s(0,3,0,0,1) },
      { text: "메타에서 가장 강한 챔피언을 빠르게 학습한다", scores: s(0,0,3,0,0) },
      { text: "상성을 이용한 독창적인 대안 픽을 찾는다", scores: s(0,0,0,3,0) },
      { text: "같은 역할의 라인전 강자 챔피언으로 이동한다", scores: s(0,0,0,0,3) },
    ]
  },
  {
    question: "연습할 때 가장 많은 시간을 쓰는 부분은?",
    options: [
      { text: "다양한 챔피언 숙련도 전체를 고루 높이기", scores: s(3,0,0,0,0) },
      { text: "주 챔피언의 포지션·딜 타이밍 최적화", scores: s(0,3,0,0,0) },
      { text: "맵 전체 동선과 타이밍 연습", scores: s(0,0,3,0,0) },
      { text: "비주류 콤보와 스킬 활용법 탐구", scores: s(0,0,0,3,0) },
      { text: "라인전 매치업 연구와 웨이브 관리", scores: s(0,0,0,0,3) },
    ]
  },
  {
    question: "가장 자신 있는 상황은?",
    options: [
      { text: "어떤 상황에서든 — 모든 챔피언이 다 자신 있다", scores: s(3,0,0,0,0) },
      { text: "팀이 나를 믿고 딜을 맡겨줄 때", scores: s(0,3,0,0,0) },
      { text: "내가 게임 흐름을 주도할 때", scores: s(0,0,3,0,0) },
      { text: "상대가 내 픽을 예측 못할 때", scores: s(0,0,0,3,0) },
      { text: "1:1에서 우위를 점할 때", scores: s(0,0,0,0,3) },
    ]
  },
  {
    question: "다른 사람들이 나의 플레이를 어떻게 봐줬으면 해?",
    options: [
      { text: "이 챔피언도, 저 챔피언도 다 잘한다 — 만능이다", scores: s(3,0,0,0,0) },
      { text: "흔들리지 않는 안정감, 믿을 수 있는 딜러", scores: s(0,3,0,0,0) },
      { text: "게임을 주도하고 흐름을 만드는 플레이어", scores: s(0,0,3,0,0) },
      { text: "아무도 생각 못한 것을 해내는 창의적인 플레이어", scores: s(0,0,0,3,0) },
      { text: "1:1에서 절대 지지 않는 라인전의 강자", scores: s(0,0,0,0,3) },
    ]
  },
]

interface ProData {
  name: string; proName: string; color: string; bgGradient: string; emoji: string
  description: string; strengths: string[]; tips: string[]
  champExamples: string[]
}

const PRO_RESULTS: Record<ProType, ProData> = {
  allrounder: {
    name: '만능형 플레이어',
    proName: '페이커 스타일',
    color: '#c89b3c',
    emoji: '👑',
    bgGradient: 'linear-gradient(135deg, #7d6012 0%, #c89b3c 100%)',
    description: '어떤 챔피언, 어떤 상황에서도 최고의 플레이를 만들어내는 만능형입니다. 특정 챔피언에 의존하지 않고 상황에 따라 가장 적합한 챔피언을 선택해 플레이하는 것이 특기입니다. 롤의 교과서라고 불리는 스타일입니다.',
    strengths: ['어떤 메타에서도 적응하는 뛰어난 범용성', '상황에 맞게 유동적으로 역할을 조정하는 능력', '지속적인 성장과 배움을 통한 실력 향상'],
    tips: ['챔피언 풀을 다양하게 유지하되, 각 챔피언의 핵심 메카닉을 확실히 익히세요', '한 챔피언을 마스터하면 다른 챔피언 학습이 훨씬 빨라집니다', '상황별 최적 판단력이 이 유형의 최강 무기입니다 — 항상 "지금 뭐가 최선인가?"를 생각하세요'],
    champExamples: ['알리스타', '트위스티드 페이트', '엘리스', '아지르', '아칼리'],
  },
  stable: {
    name: '안정형 캐리',
    proName: '룰러 스타일',
    color: '#e67e22',
    emoji: '🎯',
    bgGradient: 'linear-gradient(135deg, #9c4a0c 0%, #e67e22 100%)',
    description: '흔들리지 않는 안정적인 플레이로 팀의 화력을 책임지는 타입입니다. 화려하지 않더라도 항상 일관된 퍼포먼스를 보여주며, 실수 없는 플레이가 가장 강한 무기입니다. 팀원들이 가장 믿고 싶어하는 스타일입니다.',
    strengths: ['어떤 상황에서도 일관된 안정적인 퍼포먼스', '실수를 극도로 줄이는 꼼꼼한 플레이', '팀원에게 신뢰를 주는 믿음직한 존재감'],
    tips: ['안정성이 강점이지만 때로는 과감한 플레이도 필요합니다', '포지션을 완벽히 익혀 실수를 줄이는 데 집중하세요', '어택무브를 습관화하면 안정성이 더욱 높아집니다'],
    champExamples: ['케이틀린', '징크스', '애쉬', '바루스', '에즈리얼'],
  },
  proactive: {
    name: '주도적 전략가',
    proName: '캐니언 스타일',
    color: '#27ae60',
    emoji: '🌪️',
    bgGradient: 'linear-gradient(135deg, #0b5345 0%, #27ae60 100%)',
    description: '먼저 게임 흐름을 만들고 적이 따라오게 하는 공격적인 전략가 타입입니다. 갱킹, 로밍, 오브젝트 등 모든 것을 내가 먼저 주도하며, 상대가 반응할 새 없이 격차를 벌려버립니다.',
    strengths: ['먼저 게임 흐름을 만드는 공격적인 주도권', '오브젝트와 갱킹 타이밍 판단 탁월', '상대가 준비되기 전에 선제적으로 격차를 벌림'],
    tips: ['주도적인 플레이가 강점이지만 과감함이 역이용당하지 않도록 리스크를 계산하세요', '시야 장악을 먼저 한 뒤 움직이는 습관을 들이세요', '팀원에게 핑으로 미리 알려주면 시너지가 크게 올라갑니다'],
    champExamples: ['그레이브즈', '세주아니', '바이', '니달리', '킨드레드'],
  },
  creative: {
    name: '창의적 플레이메이커',
    proName: '케리아 스타일',
    color: '#8e44ad',
    emoji: '✨',
    bgGradient: 'linear-gradient(135deg, #5b2c6f 0%, #8e44ad 100%)',
    description: '아무도 생각 못한 픽과 플레이로 상대의 허를 찌르는 창의적인 타입입니다. 독창적인 아이디어와 예측 불가능한 판단으로 상대 팀을 혼란에 빠뜨리는 것이 특기입니다. 롤을 예술처럼 하는 스타일입니다.',
    strengths: ['예측 불가능한 창의적 플레이로 상대 혼란', '독창적인 픽과 빌드로 상대방 준비를 무력화', '롤의 새로운 면을 계속 발견하며 성장'],
    tips: ['창의적 플레이도 기본기 위에서 빛납니다 — 기초를 먼저 확실히 다지세요', '독창성을 살리되, 팀원과의 소통을 통해 시너지를 만드세요', '비주류 픽을 시도하기 전에 일반 게임에서 충분히 연습하세요'],
    champExamples: ['쓰레쉬', '블리츠크랭크', '파이크', '레나타 글라스크', '세라핀'],
  },
  laner: {
    name: '라인전 특화형',
    proName: '제우스 스타일',
    color: '#e74c3c',
    emoji: '⚔️',
    bgGradient: 'linear-gradient(135deg, #922b21 0%, #e74c3c 100%)',
    description: '라인전에서 상대를 압도하고 솔로킬로 스노우볼을 굴리는 라인전 특화 타입입니다. 1:1에서 절대 지지 않는 강인함과 CS 우위로 격차를 만들어냅니다. 라인전이 곧 게임이라고 생각하는 스타일입니다.',
    strengths: ['1:1 라인전에서 압도적인 존재감', 'CS 우위와 솔로킬로 빠른 스노우볼', '상대 라이너를 압박해 팀 전체에 이득 생성'],
    tips: ['라인전 강점을 팀 전체 운영과 연결하는 연습이 필요합니다', '솔로킬 후 합류 타이밍을 놓치지 마세요', '매치업 연구를 철저히 해 모든 상황에서 우위를 가져가세요'],
    champExamples: ['피오라', '다리우스', '제이스', '에코', '암베사', '아트록스'],
  },
}

const PRO_LABEL: Record<ProType, string> = {
  allrounder: '만능형', stable: '안정형', proactive: '주도형', creative: '창의형', laner: '라인전형'
}

export default function ProStylePage() {
  const [step, setStep] = useState<number | 'result'>(0)
  const [scores, setScores] = useState<ScoreMap>({ allrounder: 0, stable: 0, proactive: 0, creative: 0, laner: 0 })
  const [selected, setSelected] = useState<number | null>(null)
  const [ddVersion, setDdVersion] = useState('')

  useEffect(() => {
    getDDVersion().then(setDdVersion).catch(() => {})
  }, [])

  const handleNext = () => {
    if (selected === null) return
    const option = QUESTIONS[step as number].options[selected]
    const newScores = { ...scores }
    for (const t of Object.keys(option.scores) as ProType[]) {
      newScores[t] += option.scores[t]
    }
    setScores(newScores)
    setSelected(null)
    const next = (step as number) + 1
    setStep(next >= QUESTIONS.length ? 'result' : next)
  }

  const handleRetry = () => {
    setStep(0)
    setScores({ allrounder: 0, stable: 0, proactive: 0, creative: 0, laner: 0 })
    setSelected(null)
  }

  if (step === 'result') {
    const topType = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]) as ProType
    const result = PRO_RESULTS[topType]
    const maxScore = Math.max(...Object.values(scores))

    return (
      <div className="tendency-page">
        <div className="tendency-result">
          <div className="tendency-result-header" style={{ background: result.bgGradient }}>
            <div className="tendency-result-icon" style={{ fontSize: 52, lineHeight: 1 }}>{result.emoji}</div>
            <div className="tendency-result-lane-label">{result.proName}</div>
            <div className="tendency-result-name">{result.name}</div>
          </div>
          <div className="tendency-result-body">
            <p className="tendency-result-desc">{result.description}</p>

            <div className="tendency-result-section">
              <h3 className="tendency-section-title tendency-strengths-title">핵심 강점</h3>
              <ul className="tendency-result-list">
                {result.strengths.map((s, i) => <li key={i} className="tendency-strength-item">{s}</li>)}
              </ul>
            </div>

            <div className="tendency-result-section">
              <h3 className="tendency-section-title tendency-tips-title">성장 방향</h3>
              <ul className="tendency-result-list">
                {result.tips.map((t, i) => <li key={i} className="tendency-tip-item">{t}</li>)}
              </ul>
            </div>

            <div className="tendency-result-section">
              <h3 className="tendency-section-title" style={{ color: result.color }}>
                <span style={{ display: 'inline-block', width: 3, height: 12, borderRadius: 0, background: result.color, boxShadow: `0 0 8px ${result.color}99`, marginRight: 8, flexShrink: 0 }} />
                추천 챔피언
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {result.champExamples.map((champ, i) => {
                  const champId = CHAMP_KO_TO_ID[champ]
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: result.color + '18',
                      border: `1px solid ${result.color}45`,
                      borderRadius: 3, padding: '5px 12px 5px 5px',
                    }}>
                      {ddVersion && champId ? (
                        <img
                          src={champIconUrl(ddVersion, champId)}
                          alt={champ}
                          style={{ width: 36, height: 36, borderRadius: 2, objectFit: 'cover', flexShrink: 0, display: 'block' }}
                        />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: 2, background: result.color + '30', flexShrink: 0 }} />
                      )}
                      <span style={{ fontSize: 13, fontWeight: 700, color: result.color, whiteSpace: 'nowrap' }}>{champ}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="tendency-score-chart">
              <h4 className="tendency-chart-title">프로 스타일 적합도</h4>
              {(Object.entries(scores) as [ProType, number][])
                .sort((a, b) => b[1] - a[1])
                .map(([t, score]) => (
                  <div key={t} className="tendency-score-row">
                    <div className="tendency-score-lane">
                      <span style={{ fontSize: 14 }}>{PRO_RESULTS[t].emoji}</span>
                      <span style={{ fontSize: 11 }}>{PRO_LABEL[t]}</span>
                    </div>
                    <div className="tendency-score-bar-wrap">
                      <div className="tendency-score-bar" style={{ width: `${maxScore > 0 ? (score / maxScore) * 100 : 0}%`, background: PRO_RESULTS[t].color }} />
                    </div>
                    <span className="tendency-score-num">{score}점</span>
                  </div>
                ))}
            </div>

            <button className="tendency-retry-btn" onClick={handleRetry}>다시 테스트하기</button>
          </div>
        </div>
      </div>
    )
  }

  const stepNum = step as number
  const q = QUESTIONS[stepNum]
  const progress = (stepNum / QUESTIONS.length) * 100

  return (
    <div className="tendency-page">
      <div className="tendency-hero">
        <h1 className="tendency-title">프로게이머 유형 테스트</h1>
        <p className="tendency-subtitle">10개의 질문으로 내 플레이 스타일과 닮은 프로게이머 유형을 찾아보세요</p>
      </div>
      <div className="tendency-progress-wrap">
        <div className="tendency-progress-header">
          <span className="tendency-progress-label">Q{stepNum + 1} / {QUESTIONS.length}</span>
          <span className="tendency-progress-pct">{Math.round(progress)}%</span>
        </div>
        <div className="tendency-progress-track">
          <div className="tendency-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div key={stepNum} className="tendency-card">
        <div className="tendency-q-badge">Q{stepNum + 1}</div>
        <h2 className="tendency-q-text">{q.question}</h2>
        <div className="tendency-options">
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`tendency-option ${selected === i ? 'selected' : ''}`}
              onClick={() => setSelected(i)}
            >
              <span className="tendency-option-marker">{String.fromCharCode(65 + i)}</span>
              <span className="tendency-option-text">{opt.text}</span>
              {selected === i && (
                <svg className="tendency-option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
        <button
          className={`tendency-next-btn ${selected !== null ? 'active' : ''}`}
          disabled={selected === null}
          onClick={handleNext}
        >
          {stepNum + 1 === QUESTIONS.length ? '결과 보기' : '다음 질문'}
          {selected !== null && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
