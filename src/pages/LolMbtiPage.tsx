import { useState } from 'react'
import './TendencyTestPage.css'

// 4개 축: C/S, E/L, A/P, G/T
// C = 캐리 지향 / S = 서포트 지향
// E = 초반 파워 / L = 후반 파워
// A = 공격 지향 / P = 안정 지향
// G = 감각 플레이 / T = 분석 플레이

type Axis = 'cs' | 'el' | 'ap' | 'gt'
interface AxisScore { c: number; s: number; e: number; l: number; a: number; p: number; g: number; t: number }

interface Question {
  axis: Axis
  question: string
  options: [string, string] // [A side, B side]
}

const QUESTIONS: Question[] = [
  {
    axis: 'cs',
    question: "게임에서 가장 중요하게 생각하는 것은?",
    options: ["내 챔피언으로 최대한 많이 딜하고 킬을 따낸다", "팀원이 최고의 플레이를 할 수 있도록 돕는다"],
  },
  {
    axis: 'cs',
    question: "팀에서 역할이 겹칠 때 나는?",
    options: ["내가 캐리 역할을 맡겠다고 주장한다", "팀에서 가장 필요한 서포팅 역할을 맡는다"],
  },
  {
    axis: 'el',
    question: "선호하는 챔피언 특성은?",
    options: ["초반부터 강해 라인전에서 주도권을 가져오는 챔피언", "초반은 약해도 아이템 완성 후 후반에 강해지는 챔피언"],
  },
  {
    axis: 'el',
    question: "게임 운영 방식은?",
    options: ["초반에 유리함을 만들어 일찍 격차를 벌린다", "상황을 버티며 아이템을 완성해 한타로 역전한다"],
  },
  {
    axis: 'ap',
    question: "싸움이 시작될 것 같을 때 나는?",
    options: ["먼저 적극적으로 시작하거나 합류한다", "유리한 상황이 확실할 때만 참여한다"],
  },
  {
    axis: 'ap',
    question: "블라인드픽에서 나의 픽 방향은?",
    options: ["공격적인 픽으로 상대를 압박하고 주도권을 잡는다", "안정적인 픽으로 어떤 상대도 버티며 운영한다"],
  },
  {
    axis: 'gt',
    question: "플레이 중 판단 방식은?",
    options: ["순간적인 직감과 감각으로 즉흥적인 플레이를 한다", "데이터와 경험을 기반으로 계획적으로 플레이한다"],
  },
  {
    axis: 'gt',
    question: "실수를 했을 때 대처 방식은?",
    options: ["감각적으로 빠르게 만회 플레이를 시도한다", "잠깐 멈추고 왜 실수했는지 상황을 분석한다"],
  },
]

const MBTI_TYPES: Record<string, { name: string; description: string; color: string; keywords: string[] }> = {
  CEAG: { name: '전장의 폭풍', color: '#e74c3c', description: '초반부터 공격적으로 킬을 따내고 감각적인 플레이로 팀을 캐리합니다. 계획보다 실행, 주저함 없는 결단이 특징입니다.', keywords: ['🔥 공격적', '⚡ 초반 강자', '🗡️ 캐리 지향', '🎯 감각 플레이'] },
  CEAT: { name: '계산된 정복자', color: '#c0392b', description: '초반 공격적 플레이를 데이터로 뒷받침합니다. 감각과 분석을 동시에 갖춘 가장 균형 잡힌 캐리형입니다.', keywords: ['📊 분석형', '⚡ 초반 강자', '🗡️ 캐리 지향', '⚔️ 공격적'] },
  CEPG: { name: '기회의 사냥꾼', color: '#e67e22', description: '초반에 탐색하며 완벽한 킬 기회를 노립니다. 기다리다가 터지는 순간 감각적으로 처리하는 타입입니다.', keywords: ['🎯 감각 플레이', '⚡ 초반 탐색', '🗡️ 캐리 지향', '🛡️ 신중형'] },
  CEPT: { name: '냉정한 초반러', color: '#d35400', description: '초반 우위를 철저한 계획으로 가져옵니다. 감정 없이 수치를 보며 킬과 CS 우위를 계획적으로 확보합니다.', keywords: ['📊 분석형', '⚡ 초반 강자', '🗡️ 캐리 지향', '🛡️ 신중형'] },
  CLAG: { name: '후반의 야수', color: '#8e44ad', description: '후반까지 기다렸다가 터지는 폭발적인 캐리 타입. 아이템이 완성되면 감각적으로 게임을 끝내버립니다.', keywords: ['🔥 공격적', '🌙 후반 파워', '🗡️ 캐리 지향', '🎯 감각 플레이'] },
  CLAT: { name: '전략적 캐리', color: '#7d3c98', description: '후반 시간을 계획적으로 버티며 공격적인 한타로 결정짓는 타입. 분석력과 공격성을 겸비했습니다.', keywords: ['📊 분석형', '🌙 후반 파워', '🗡️ 캐리 지향', '⚔️ 공격적'] },
  CLPG: { name: '느긋한 캐리', color: '#2980b9', description: '서두르지 않고 후반 파밍에 집중하며 안정적으로 성장합니다. 감각적인 한방으로 게임을 마무리하는 타입입니다.', keywords: ['🎯 감각 플레이', '🌙 후반 파워', '🗡️ 캐리 지향', '🛡️ 안정형'] },
  CLPT: { name: '완성형 딜러', color: '#1a5276', description: '아이템 완성까지 계획적으로 파밍하고 안정적으로 딜하는 정석 캐리. 실수 없는 후반 플레이가 특기입니다.', keywords: ['📊 분석형', '🌙 후반 파워', '🗡️ 캐리 지향', '🛡️ 안정형'] },
  SEAG: { name: '감각적 이니시에이터', color: '#27ae60', description: '팀을 위해 먼저 달려들며 감각적인 타이밍으로 한타를 엽니다. 이니시에이팅의 본능적인 타이밍이 무기입니다.', keywords: ['🎯 감각 플레이', '⚡ 초반 한타', '🤝 팀 중심', '⚔️ 공격적'] },
  SEAT: { name: '전략적 돌격 서포터', color: '#1e8449', description: '초반부터 공격적인 로밍과 갱킹 서포팅으로 팀에 이득을 만드는 서포터. 계획적인 동선이 강점입니다.', keywords: ['📊 분석형', '⚡ 초반 강자', '🤝 팀 중심', '⚔️ 공격적'] },
  SEPG: { name: '직관적 수호자', color: '#d4ac0d', description: '초반 위기 감지 능력이 뛰어난 서포터. 직감으로 팀원의 위기를 먼저 느끼고 신중하게 보호합니다.', keywords: ['🎯 감각 플레이', '⚡ 초반 대응', '🤝 팀 중심', '🛡️ 신중형'] },
  SEPT: { name: '시야의 지배자', color: '#b7950b', description: '초반 시야와 정보를 계획적으로 확보해 팀에 이득을 주는 서포터. 지식이 곧 무기인 타입입니다.', keywords: ['📊 분석형', '⚡ 초반 정보전', '🤝 팀 중심', '🛡️ 신중형'] },
  SLAG: { name: '열정 팀플레이어', color: '#16a085', description: '후반 한타에서 감각적인 이니시로 팀을 이끄는 서포터. 공격적인 팀플레이에서 에너지를 얻습니다.', keywords: ['🔥 공격적', '🌙 후반 한타', '🤝 팀 중심', '🎯 감각 플레이'] },
  SLAT: { name: '끝판 이니시에이터', color: '#0d8073', description: '후반에 계획적인 이니시에이팅으로 한타를 지배하는 서포터. 정확한 타이밍 분석이 강점입니다.', keywords: ['📊 분석형', '🌙 후반 한타', '🤝 팀 중심', '⚔️ 공격적'] },
  SLPG: { name: '팀의 따뜻한 마음', color: '#3498db', description: '후반까지 안정적으로 팀원을 보호하며 감각적인 힐/쉴드로 결정적 순간을 만드는 서포터입니다.', keywords: ['🎯 감각 플레이', '🌙 후반 안정', '🤝 팀 중심', '🛡️ 신중형'] },
  SLPT: { name: '완벽한 조력자', color: '#154360', description: '후반 한타까지 계획적이고 안정적으로 팀원을 지원합니다. 실수 없는 서포팅으로 팀의 승리를 설계하는 타입입니다.', keywords: ['📊 분석형', '🌙 후반 안정', '🤝 팀 중심', '🛡️ 안정형'] },
}

export default function LolMbtiPage() {
  const [step, setStep] = useState<number | 'result'>(0)
  const [axisScores, setAxisScores] = useState<AxisScore>({ c: 0, s: 0, e: 0, l: 0, a: 0, p: 0, g: 0, t: 0 })
  const [selected, setSelected] = useState<0 | 1 | null>(null)

  const handleNext = () => {
    if (selected === null) return
    const q = QUESTIONS[step as number]
    const newScores = { ...axisScores }
    const axisMap: Record<Axis, [keyof AxisScore, keyof AxisScore]> = {
      cs: ['c', 's'], el: ['e', 'l'], ap: ['a', 'p'], gt: ['g', 't']
    }
    const [aKey, bKey] = axisMap[q.axis]
    if (selected === 0) newScores[aKey]++
    else newScores[bKey]++
    setAxisScores(newScores)
    setSelected(null)
    const next = (step as number) + 1
    setStep(next >= QUESTIONS.length ? 'result' : next)
  }

  const handleRetry = () => {
    setStep(0)
    setAxisScores({ c: 0, s: 0, e: 0, l: 0, a: 0, p: 0, g: 0, t: 0 })
    setSelected(null)
  }

  if (step === 'result') {
    const c1 = axisScores.c >= axisScores.s ? 'C' : 'S'
    const c2 = axisScores.e >= axisScores.l ? 'E' : 'L'
    const c3 = axisScores.a >= axisScores.p ? 'A' : 'P'
    const c4 = axisScores.g >= axisScores.t ? 'G' : 'T'
    const code = c1 + c2 + c3 + c4
    const result = MBTI_TYPES[code] ?? MBTI_TYPES['CLPT']

    const axes = [
      { left: '캐리 지향', right: '서포트 지향', lScore: axisScores.c, rScore: axisScores.s, result: c1 === 'C' ? '캐리(C)' : '서포트(S)' },
      { left: '초반 파워', right: '후반 파워', lScore: axisScores.e, rScore: axisScores.l, result: c2 === 'E' ? '초반(E)' : '후반(L)' },
      { left: '공격 지향', right: '안정 지향', lScore: axisScores.a, rScore: axisScores.p, result: c3 === 'A' ? '공격(A)' : '안정(P)' },
      { left: '감각 플레이', right: '분석 플레이', lScore: axisScores.g, rScore: axisScores.t, result: c4 === 'G' ? '감각(G)' : '분석(T)' },
    ]

    return (
      <div className="tendency-page">
        <div className="tendency-result">
          <div className="tendency-result-header" style={{ background: `linear-gradient(135deg, ${result.color}dd 0%, ${result.color} 100%)` }}>
            <div className="tendency-result-lane-label" style={{ fontSize: 22, letterSpacing: 4, marginBottom: 12 }}>{code}</div>
            <div className="tendency-result-name">{result.name}</div>
          </div>
          <div className="tendency-result-body">
            <p className="tendency-result-desc">{result.description}</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border-color)' }}>
              {result.keywords.map((kw, i) => (
                <span key={i} style={{
                  background: result.color + '22', color: result.color,
                  border: `1px solid ${result.color}44`,
                  padding: '5px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                }}>{kw}</span>
              ))}
            </div>

            <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>축별 분석</h4>
            {axes.map((ax, i) => {
              const total = ax.lScore + ax.rScore || 1
              const leftPct = Math.round((ax.lScore / total) * 100)
              return (
                <div key={i} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>{ax.left}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: result.color }}>{ax.result}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>{ax.right}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--border-color)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${leftPct}%`, background: result.color, borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{leftPct}%</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{100 - leftPct}%</span>
                  </div>
                </div>
              )
            })}

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
        <h1 className="tendency-title">롤 플레이어 MBTI</h1>
        <p className="tendency-subtitle">8개의 질문으로 나만의 4글자 롤 플레이어 유형을 찾아보세요</p>
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
              onClick={() => setSelected(i as 0 | 1)}
            >
              <span className="tendency-option-marker">{i === 0 ? 'A' : 'B'}</span>
              <span className="tendency-option-text">{opt}</span>
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
