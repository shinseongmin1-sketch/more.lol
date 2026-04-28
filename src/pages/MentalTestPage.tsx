import { useState } from 'react'
import './TendencyTestPage.css'

type MentalType = 'analyst' | 'warrior' | 'storm' | 'sage'
interface ScoreMap { analyst: number; warrior: number; storm: number; sage: number }
interface Option { text: string; scores: ScoreMap }
interface Question { question: string; options: Option[] }

function s(analyst: number, warrior: number, storm: number, sage: number): ScoreMap {
  return { analyst, warrior, storm, sage }
}

const QUESTIONS: Question[] = [
  {
    question: "솔로랭크 3연패를 당했을 때 나는?",
    options: [
      { text: "내 플레이를 돌아보고 실수 패턴을 찾는다", scores: s(3,1,0,0) },
      { text: "'다음 판엔 반드시 이긴다'며 바로 다시 큐를 넣는다", scores: s(0,3,0,0) },
      { text: "화가 나서 채팅이 많아지고 과감해진다", scores: s(0,0,3,0) },
      { text: "조용히 로그아웃하고 다른 걸 한다", scores: s(0,0,0,3) },
    ]
  },
  {
    question: "팀원이 명백한 실수로 게임을 망쳤을 때?",
    options: [
      { text: "어떤 판단 오류였는지 상황을 분석한다", scores: s(3,0,0,0) },
      { text: "괜찮다고 격려하고 다음 한타를 준비한다", scores: s(1,2,0,0) },
      { text: "채팅으로 즉시 지적하거나 핑을 과하게 박는다", scores: s(0,0,3,0) },
      { text: "아무 말도 하지 않고 그냥 넘어간다", scores: s(0,0,0,3) },
    ]
  },
  {
    question: "게임이 완전히 망해가고 있을 때?",
    options: [
      { text: "어디서 역전 기회를 만들 수 있는지 계산한다", scores: s(3,1,0,0) },
      { text: "포기하지 않고 마지막까지 싸운다", scores: s(0,3,0,0) },
      { text: "팀원을 탓하는 채팅을 보낸다", scores: s(0,0,3,0) },
      { text: "빠른 항복에 바로 투표한다", scores: s(0,0,0,3) },
    ]
  },
  {
    question: "내가 혼자 캐리했는데 팀이 져줬을 때?",
    options: [
      { text: "승률 확률상 어쩔 수 없는 일이라고 이성적으로 받아들인다", scores: s(3,0,0,1) },
      { text: "'다음엔 더 잘해서 혼자 이겨버리자'고 다짐한다", scores: s(0,3,0,0) },
      { text: "매우 화가 나고 그 생각이 한동안 머리를 떠나지 않는다", scores: s(0,0,3,0) },
      { text: "'롤은 진짜 운 게임'이라며 쿨하게 정리한다", scores: s(1,0,0,2) },
    ]
  },
  {
    question: "내 실수로 팀이 지고 있을 때?",
    options: [
      { text: "즉시 실수를 인정하고 최대한 만회 방법을 찾는다", scores: s(3,1,0,0) },
      { text: "더 집중해서 남은 게임에 최선을 다한다", scores: s(0,3,0,0) },
      { text: "자책이 심해지고 그게 또 연속 실수로 이어진다", scores: s(0,0,3,0) },
      { text: "어차피 뒤집기 어렵다고 생각하고 긴장이 풀린다", scores: s(0,0,0,3) },
    ]
  },
  {
    question: "상대가 도발 이모트나 춤을 출 때?",
    options: [
      { text: "신경 쓰지 않고 더 냉정하게 플레이한다", scores: s(3,0,0,1) },
      { text: "더 자극받아 오히려 더 잘하게 된다", scores: s(0,3,0,0) },
      { text: "매우 자극받고 그 상대를 잡는 데 집착한다", scores: s(0,0,3,0) },
      { text: "딱히 신경 안 쓰고 내 할 것만 한다", scores: s(1,0,0,2) },
    ]
  },
  {
    question: "오늘 하루 랭크 결산이 -10LP일 때?",
    options: [
      { text: "어떤 챔피언·매치업에서 많이 졌는지 메모한다", scores: s(3,0,0,0) },
      { text: "내일은 반드시 회복한다고 다짐하고 잔다", scores: s(0,3,0,0) },
      { text: "기분이 안 좋아져서 주변 사람에게도 예민해진다", scores: s(0,0,3,0) },
      { text: "쿨하게 '오늘 운 없었네' 하고 자러 간다", scores: s(0,0,0,3) },
    ]
  },
  {
    question: "팀원이 '또 솔랭크 하냐'고 비꼴 때?",
    options: [
      { text: "반박할 근거를 생각하면서 게임에 집중한다", scores: s(3,0,0,1) },
      { text: "더 잘해서 증명하겠다는 의지가 불타오른다", scores: s(0,3,0,0) },
      { text: "맞받아치며 채팅 배틀을 시작한다", scores: s(0,0,3,0) },
      { text: "흘려듣고 무시한다", scores: s(1,0,0,2) },
    ]
  },
]

interface MentalData {
  name: string; color: string; bgGradient: string; emoji: string
  description: string; strengths: string[]; weaknesses: string[]; tips: string[]
}

const MENTAL_RESULTS: Record<MentalType, MentalData> = {
  analyst: {
    name: '냉철한 분석가', color: '#3498db', emoji: '🧠',
    bgGradient: 'linear-gradient(135deg, #1a5276 0%, #3498db 100%)',
    description: '감정보다 데이터를 믿는 유형입니다. 어떤 상황에서도 이성적으로 원인을 분석하고 다음 행동을 계획합니다. 멘탈이 흔들리는 일이 거의 없으며, 패배도 성장의 데이터로 소화합니다.',
    strengths: ['어떤 상황에서도 감정에 휘둘리지 않음', '패배 후 빠르게 원인을 파악하고 개선', '장기적인 실력 성장 속도가 매우 빠름'],
    weaknesses: ['지나친 분석으로 즉흥적인 플레이가 약해질 수 있음', '팀원 감정을 읽지 못해 소통이 부족한 경우', '완벽함을 추구하다 과감한 플레이를 놓치기도 함'],
    tips: ['분석 시간을 정해두고 그 외에는 직감도 믿어보세요', '팀원과의 간단한 소통이 게임을 더 부드럽게 만들어줍니다', '분석 결과를 실제 플레이에 연결하는 훈련을 해보세요'],
  },
  warrior: {
    name: '불굴의 투사', color: '#e74c3c', emoji: '🔥',
    bgGradient: 'linear-gradient(135deg, #922b21 0%, #e74c3c 100%)',
    description: '어떤 상황에서도 포기하지 않는 불굴의 의지를 가진 유형입니다. 연패도 오히려 더 강한 의지를 불태우는 연료가 됩니다. 끈기와 승부욕이 이 유형의 가장 큰 무기입니다.',
    strengths: ['절대 포기하지 않는 끈기와 강한 승부욕', '위기 상황에서 오히려 집중력이 높아짐', '팀원을 독려하는 리더십 기질'],
    weaknesses: ['승부욕이 지나쳐 피로감이 쌓이는 경향', '때로는 쉬는 것이 더 좋다는 판단이 어려움', '감정적 과몰입으로 한 판에 너무 많은 에너지 소비'],
    tips: ['강한 의지도 좋지만 적당한 휴식이 장기 실력 향상에 도움됩니다', '승부욕을 분노가 아닌 집중력으로 전환하는 연습을 해보세요', '연패 시 1~2판 후 잠깐 쉬는 습관을 들이세요'],
  },
  storm: {
    name: '감정의 폭풍', color: '#e67e22', emoji: '⚡',
    bgGradient: 'linear-gradient(135deg, #9c4a0c 0%, #e67e22 100%)',
    description: '감정 기복이 크고 승패에 강하게 반응하는 유형입니다. 이기면 세상 최고, 지면 세상 최악처럼 느껴집니다. 감정이 곧 에너지가 되어 폭발적인 플레이를 만들기도 하지만, 틸트에 주의가 필요합니다.',
    strengths: ['감정이 에너지가 되어 폭발적인 순간 집중력', '승리했을 때의 기쁨이 누구보다 크고 진함', '게임에 깊이 몰입하는 열정적인 플레이어'],
    weaknesses: ['연패 시 틸트로 이어져 추가 패배 유발 위험', '채팅 과다로 팀 분위기를 해치는 경우', '감정 회복 속도가 다른 유형보다 느림'],
    tips: ['연패 2판 후 반드시 10분 휴식을 취하세요', '채팅을 /mute all로 차단하면 틸트 방지에 효과적입니다', '게임 전 "이번 판은 감정 없이 플레이한다"고 다짐해보세요'],
  },
  sage: {
    name: '초연한 현자', color: '#27ae60', emoji: '🍃',
    bgGradient: 'linear-gradient(135deg, #0b5345 0%, #27ae60 100%)',
    description: '승패에 크게 흔들리지 않는 초연한 유형입니다. 게임을 그냥 게임으로 보는 건강한 관점을 갖고 있습니다. 멘탈 안정도는 최고 수준이지만, 때로는 너무 쿨해서 승부욕이 부족해 보이기도 합니다.',
    strengths: ['어떤 상황에서도 평정심 유지', '장기전도 지치지 않고 꾸준히 즐길 수 있음', '팀원의 실수에도 분위기를 해치지 않음'],
    weaknesses: ['승부욕 부족으로 결정적 순간 집중력이 약해질 수 있음', '너무 쿨하게 포기해 역전 기회를 놓치는 경우', '게임에 깊이 투자하지 않아 실력 성장 속도가 느릴 수 있음'],
    tips: ['가끔은 결과에 집착해보는 것도 실력 향상에 도움됩니다', '포기하기 전에 역전 시나리오를 한 번만 더 생각해보세요', '쿨함을 유지하되, 중요한 순간만큼은 최대 집중력을 쏟아보세요'],
  },
}

const MENTAL_LABEL: Record<MentalType, string> = {
  analyst: '냉철한 분석가', warrior: '불굴의 투사', storm: '감정의 폭풍', sage: '초연한 현자'
}

export default function MentalTestPage() {
  const [step, setStep] = useState<number | 'result'>(0)
  const [scores, setScores] = useState<ScoreMap>({ analyst: 0, warrior: 0, storm: 0, sage: 0 })
  const [selected, setSelected] = useState<number | null>(null)

  const handleNext = () => {
    if (selected === null) return
    const option = QUESTIONS[step as number].options[selected]
    const newScores = { ...scores }
    for (const t of Object.keys(option.scores) as MentalType[]) {
      newScores[t] += option.scores[t]
    }
    setScores(newScores)
    setSelected(null)
    const next = (step as number) + 1
    setStep(next >= QUESTIONS.length ? 'result' : next)
  }

  const handleRetry = () => {
    setStep(0)
    setScores({ analyst: 0, warrior: 0, storm: 0, sage: 0 })
    setSelected(null)
  }

  if (step === 'result') {
    const topType = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]) as MentalType
    const result = MENTAL_RESULTS[topType]
    const maxScore = Math.max(...Object.values(scores))
    return (
      <div className="tendency-page">
        <div className="tendency-result">
          <div className="tendency-result-header" style={{ background: result.bgGradient }}>
            <div className="tendency-result-icon" style={{ fontSize: 52, lineHeight: 1 }}>{result.emoji}</div>
            <div className="tendency-result-lane-label">롤 멘탈 유형</div>
            <div className="tendency-result-name">{result.name}</div>
          </div>
          <div className="tendency-result-body">
            <p className="tendency-result-desc">{result.description}</p>
            <div className="tendency-result-section">
              <h3 className="tendency-section-title tendency-strengths-title">강점</h3>
              <ul className="tendency-result-list">
                {result.strengths.map((s, i) => <li key={i} className="tendency-strength-item">{s}</li>)}
              </ul>
            </div>
            <div className="tendency-result-section">
              <h3 className="tendency-section-title tendency-weaknesses-title">약점</h3>
              <ul className="tendency-result-list">
                {result.weaknesses.map((w, i) => <li key={i} className="tendency-weakness-item">{w}</li>)}
              </ul>
            </div>
            <div className="tendency-result-section">
              <h3 className="tendency-section-title tendency-tips-title">멘탈 개선 방향</h3>
              <ul className="tendency-result-list">
                {result.tips.map((t, i) => <li key={i} className="tendency-tip-item">{t}</li>)}
              </ul>
            </div>
            <div className="tendency-score-chart">
              <h4 className="tendency-chart-title">멘탈 유형 분포</h4>
              {(Object.entries(scores) as [MentalType, number][])
                .sort((a, b) => b[1] - a[1])
                .map(([t, score]) => (
                  <div key={t} className="tendency-score-row">
                    <div className="tendency-score-lane">
                      <span style={{ fontSize: 14 }}>{MENTAL_RESULTS[t].emoji}</span>
                      <span style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{MENTAL_LABEL[t].split(' ')[1] ?? MENTAL_LABEL[t]}</span>
                    </div>
                    <div className="tendency-score-bar-wrap">
                      <div className="tendency-score-bar" style={{ width: `${maxScore > 0 ? (score / maxScore) * 100 : 0}%`, background: MENTAL_RESULTS[t].color }} />
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
        <h1 className="tendency-title">롤 멘탈 유형 테스트</h1>
        <p className="tendency-subtitle">8개의 상황 질문으로 내 롤 멘탈 유형을 분석해보세요</p>
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
