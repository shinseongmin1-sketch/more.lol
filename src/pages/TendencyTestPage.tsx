import { useState } from 'react'
import './TendencyTestPage.css'

type Lane = 'top' | 'jungle' | 'mid' | 'adc' | 'support'
interface ScoreMap { top: number; jungle: number; mid: number; adc: number; support: number }
interface Option { text: string; scores: ScoreMap }
interface Question { question: string; options: Option[] }

const QUESTIONS: Question[] = [
  {
    question: "팀 게임에서 내가 가장 원하는 역할은?",
    options: [
      { text: "혼자 상대 라인을 압박해 팀에 부담을 준다", scores: { top: 3, jungle: 0, mid: 1, adc: 0, support: 0 } },
      { text: "맵을 돌아다니며 갱킹으로 팀을 돕는다", scores: { top: 0, jungle: 3, mid: 1, adc: 0, support: 1 } },
      { text: "게임 중심에서 흐름을 주도하고 로밍한다", scores: { top: 0, jungle: 1, mid: 3, adc: 0, support: 0 } },
      { text: "팀원과 함께 성장하고 한타에서 최대 딜을 넣는다", scores: { top: 0, jungle: 0, mid: 0, adc: 3, support: 2 } },
    ]
  },
  {
    question: "게임 중 와드(시야)에 대한 나의 생각은?",
    options: [
      { text: "항상 꼼꼼히 설치한다 — 정보가 곧 승리", scores: { top: 0, jungle: 2, mid: 1, adc: 0, support: 3 } },
      { text: "오브젝트 전에는 꼭 챙긴다", scores: { top: 1, jungle: 3, mid: 1, adc: 1, support: 1 } },
      { text: "신경 쓰고 싶지만 바빠서 가끔 잊는다", scores: { top: 1, jungle: 0, mid: 2, adc: 2, support: 0 } },
      { text: "솔직히 딜 넣는 게 더 중요하다고 생각한다", scores: { top: 2, jungle: 0, mid: 1, adc: 2, support: 0 } },
    ]
  },
  {
    question: "한타 상황에서 나의 포지션은?",
    options: [
      { text: "앞서 나가며 싸움을 시작하거나 상대를 끊는다", scores: { top: 2, jungle: 2, mid: 1, adc: 0, support: 0 } },
      { text: "뒤에서 최대한 많이, 안전하게 때린다", scores: { top: 0, jungle: 0, mid: 0, adc: 3, support: 0 } },
      { text: "팀원이 맞으면 대신 맞거나 즉시 살려낸다", scores: { top: 1, jungle: 0, mid: 0, adc: 0, support: 3 } },
      { text: "이니시에이팅에 맞춰 강력한 스킬로 연계한다", scores: { top: 0, jungle: 1, mid: 3, adc: 1, support: 1 } },
    ]
  },
  {
    question: "게임이 지고 있는 상황에서 나는?",
    options: [
      { text: "더 공격적으로 1:1로 캐리를 시도한다", scores: { top: 3, jungle: 0, mid: 2, adc: 0, support: 0 } },
      { text: "오브젝트와 시야를 더 꼼꼼히 챙기며 역전을 노린다", scores: { top: 0, jungle: 3, mid: 1, adc: 0, support: 1 } },
      { text: "침착하게 포지션 잡고 한타 기회를 기다린다", scores: { top: 0, jungle: 0, mid: 1, adc: 3, support: 1 } },
      { text: "팀원들에게 소통하며 분위기를 살린다", scores: { top: 0, jungle: 1, mid: 1, adc: 0, support: 3 } },
    ]
  },
  {
    question: "가장 강하게 느끼는 게임 시간대는?",
    options: [
      { text: "초반 — 라인전에서 이기고 스노우볼 굴릴 때", scores: { top: 2, jungle: 0, mid: 3, adc: 0, support: 1 } },
      { text: "중반 — 갱킹과 오브젝트로 격차를 벌릴 때", scores: { top: 0, jungle: 3, mid: 1, adc: 0, support: 2 } },
      { text: "후반 — 아이템 풀 완성 후 한타가 터질 때", scores: { top: 1, jungle: 0, mid: 0, adc: 3, support: 0 } },
      { text: "시간대 상관없이 팀 상황에 맞춰 강해진다", scores: { top: 1, jungle: 1, mid: 1, adc: 1, support: 3 } },
    ]
  },
  {
    question: "팀원이 위기에 처하면?",
    options: [
      { text: "즉시 달려가 함께 싸운다", scores: { top: 1, jungle: 2, mid: 1, adc: 0, support: 2 } },
      { text: "스킬/아이템으로 살려내는 것이 먼저다", scores: { top: 0, jungle: 0, mid: 0, adc: 0, support: 3 } },
      { text: "지원하기 어려우면 다른 라인 압박으로 보답한다", scores: { top: 3, jungle: 1, mid: 2, adc: 0, support: 0 } },
      { text: "상황 판단 후 유리하면 합류, 아니면 다른 목표를 챙긴다", scores: { top: 0, jungle: 3, mid: 2, adc: 1, support: 0 } },
    ]
  },
  {
    question: "롤에서 가장 재미있는 순간은?",
    options: [
      { text: "솔로킬을 따냈을 때", scores: { top: 3, jungle: 0, mid: 2, adc: 0, support: 0 } },
      { text: "갱킹으로 팀원을 살리고 킬까지 챙겼을 때", scores: { top: 0, jungle: 3, mid: 0, adc: 0, support: 1 } },
      { text: "로밍 킬로 게임 분위기를 반전시켰을 때", scores: { top: 0, jungle: 1, mid: 3, adc: 0, support: 0 } },
      { text: "한타에서 딜량 1위를 찍었을 때", scores: { top: 0, jungle: 0, mid: 1, adc: 3, support: 0 } },
      { text: "팀원을 살려내 게임을 뒤집었을 때", scores: { top: 0, jungle: 0, mid: 0, adc: 0, support: 3 } },
    ]
  },
  {
    question: "나의 성격에 가장 가까운 것은?",
    options: [
      { text: "독립적이고 자립심이 강하다", scores: { top: 3, jungle: 1, mid: 1, adc: 0, support: 0 } },
      { text: "계획적이고 분석적이다", scores: { top: 0, jungle: 3, mid: 1, adc: 1, support: 0 } },
      { text: "리더십 있고 적극적이다", scores: { top: 1, jungle: 1, mid: 3, adc: 0, support: 0 } },
      { text: "꼼꼼하고 흔들리지 않는다", scores: { top: 0, jungle: 0, mid: 1, adc: 3, support: 1 } },
      { text: "배려심이 강하고 팀 중심적이다", scores: { top: 0, jungle: 0, mid: 0, adc: 0, support: 3 } },
    ]
  },
  {
    question: "게임에서 가장 중요하게 생각하는 것은?",
    options: [
      { text: "라인전 우위 — 1:1에서 지지 않는 것", scores: { top: 3, jungle: 0, mid: 2, adc: 0, support: 0 } },
      { text: "오브젝트 — 드래곤, 바론을 빠짐없이 챙기는 것", scores: { top: 0, jungle: 3, mid: 0, adc: 0, support: 1 } },
      { text: "딜량 — 내가 많이 때려야 이긴다", scores: { top: 1, jungle: 0, mid: 2, adc: 3, support: 0 } },
      { text: "시야와 정보 — 아는 쪽이 이긴다", scores: { top: 0, jungle: 2, mid: 1, adc: 0, support: 3 } },
    ]
  },
  {
    question: "실수나 데스 이후 나는 보통?",
    options: [
      { text: "더 공격적으로 보상하려 한다", scores: { top: 3, jungle: 0, mid: 2, adc: 0, support: 0 } },
      { text: "잠깐 멈추고 맵 전체 상황을 다시 파악한다", scores: { top: 0, jungle: 3, mid: 1, adc: 1, support: 0 } },
      { text: "마음을 가다듬고 조용히 플레이를 이어간다", scores: { top: 0, jungle: 0, mid: 1, adc: 3, support: 1 } },
      { text: "팀원에게 먼저 미안하다고 한다", scores: { top: 0, jungle: 0, mid: 0, adc: 0, support: 3 } },
    ]
  },
  {
    question: "선호하는 게임 운영 방식은?",
    options: [
      { text: "라인 압박 → 타워 → 스플릿 푸시", scores: { top: 3, jungle: 0, mid: 1, adc: 0, support: 0 } },
      { text: "갱킹 → 오브젝트 → 지속적인 압박", scores: { top: 0, jungle: 3, mid: 1, adc: 0, support: 1 } },
      { text: "킬 → 로밍 → 팀 스노우볼", scores: { top: 0, jungle: 1, mid: 3, adc: 0, support: 0 } },
      { text: "안전 파밍 → 아이템 완성 → 한타 캐리", scores: { top: 0, jungle: 0, mid: 0, adc: 3, support: 1 } },
    ]
  },
  {
    question: "내가 되고 싶은 플레이어상은?",
    options: [
      { text: "상대를 압도하는 1인 캐리 플레이어", scores: { top: 3, jungle: 0, mid: 2, adc: 1, support: 0 } },
      { text: "맵을 읽고 게임을 장악하는 전략가", scores: { top: 0, jungle: 3, mid: 1, adc: 0, support: 1 } },
      { text: "팀의 중심에서 이기는 그림을 그리는 리더", scores: { top: 1, jungle: 1, mid: 3, adc: 0, support: 0 } },
      { text: "흔들리지 않는 딜로 팀 화력을 책임지는 딜러", scores: { top: 0, jungle: 0, mid: 0, adc: 3, support: 1 } },
      { text: "팀원을 빛나게 하는 보이지 않는 MVP", scores: { top: 0, jungle: 0, mid: 0, adc: 0, support: 3 } },
    ]
  },
]

interface LaneData {
  lane: string; color: string; bgGradient: string
  name: string; description: string
  strengths: string[]; weaknesses: string[]; tips: string[]
}

const LANE_RESULTS: Record<Lane, LaneData> = {
  top: {
    lane: '탑', color: '#e74c3c',
    bgGradient: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
    name: '고독한 검투사',
    description: '혼자서도 강하며 라인전에서 상대를 압도하는 플레이어입니다. 팀에 휘둘리지 않고 자신만의 판단과 리듬으로 게임을 이끌어 나갑니다. 솔로 캐리 능력이 뛰어나며, 1:1 상황에서 진짜 실력이 드러납니다.',
    strengths: ['라인전 우위와 1:1 전투에서 압도적인 존재감', '스플릿 푸시로 팀에게 유리한 상황을 만드는 능력', '압박을 받아도 침착하게 자신의 플레이를 유지하는 멘탈'],
    weaknesses: ['팀과 소통 없이 혼자 움직이는 경향', '정글 지원 없이 피지컬에만 의존하는 경우', '팀 한타 합류 타이밍을 놓치는 경우'],
    tips: ['미니맵을 자주 확인해 정글 인베이드나 로밍을 미리 인지하세요', '스플릿 타이밍을 핑으로 팀원에게 알려 함께 운영하세요', '탑에서 이기는 것만큼 합류 타이밍도 연습하면 더 강해집니다'],
  },
  jungle: {
    lane: '정글', color: '#27ae60',
    bgGradient: 'linear-gradient(135deg, #27ae60 0%, #1e8449 100%)',
    name: '맵의 지배자',
    description: '맵 전체를 읽으며 게임의 흐름을 좌우하는 전략가입니다. 어느 라인이 힘든지 파악하고 최적의 타이밍에 나타나 팀에 기여합니다. 넓은 시야와 뛰어난 판단력으로 모든 라인에 영향을 미칩니다.',
    strengths: ['맵 전체를 보는 넓은 시야와 빠른 상황 판단', '갱킹 타이밍 포착과 오브젝트 관리 능력', '게임 흐름을 만들고 팀의 유불리를 주도하는 능력'],
    weaknesses: ['모든 라인 갱킹 요청을 동시에 만족시키기 어려움', '초반 카운터 정글 및 인베이드에 취약한 경우', '오브젝트 우선순위 판단 실수가 팀 전체에 영향'],
    tips: ['갱킹 전 라인 상태(미니언 수, 상대 위치)를 먼저 확인하세요', '시간대별 동선을 미리 계획하면 효율이 크게 올라갑니다', '드래곤/바론 타이밍 30초 전에 시야를 확보하는 습관을 들이세요'],
  },
  mid: {
    lane: '미드', color: '#3498db',
    bgGradient: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
    name: '게임의 핵심',
    description: '팀의 중심에서 게임 흐름을 만들어가는 리더입니다. 빠른 라인 클리어 후 로밍으로 다른 라인에 영향을 미치며, 스스로 판단하고 팀을 이끄는 능력이 탁월합니다. 게임의 키 플레이를 만드는 것이 즐거움입니다.',
    strengths: ['라인 클리어와 로밍으로 팀 전체에 영향력 행사', '빠른 상황 판단과 게임 템포 조절 능력', '정글러와 호흡을 맞춰 초반부터 게임을 주도하는 능력'],
    weaknesses: ['너무 많은 것을 혼자 하려다 라인을 비우는 경우', '로밍 타이밍 미스로 라인전 손해와 이득을 모두 놓치는 경우', '자신의 판단에 지나치게 의존해 팀과 불협화음이 생길 수 있음'],
    tips: ['웨이브 클리어 후 로밍 타이밍을 배우면 영향력이 2배가 됩니다', '정글러와 자주 소통해 초반 시너지를 극대화하세요', '상대 정글러 동선을 파악해 카운터 플레이도 연습해보세요'],
  },
  adc: {
    lane: '원딜', color: '#e67e22',
    bgGradient: 'linear-gradient(135deg, #e67e22 0%, #ca6f1e 100%)',
    name: '정밀 사격수',
    description: '완벽한 포지셔닝으로 팀의 화력을 책임지는 딜러입니다. 감정에 흔들리지 않고 묵묵히 실력을 쌓아 후반에 빛을 발합니다. 꼼꼼하고 일관된 플레이로 팀의 핵심 딜러 역할을 완벽하게 수행합니다.',
    strengths: ['안정적이고 일관된 딜량과 뛰어난 포지션 의식', '감정에 흔들리지 않는 침착함과 꾸준한 성장', '후반 아이템이 완성될수록 팀의 핵심 자원이 되는 능력'],
    weaknesses: ['서포터 의존도가 높고 혼자 판단하기 어려운 경우', '이니시에이팅 없이 상대에게 끊기면 아무것도 못 하는 경우', '초반 약한 시간대에 무리한 플레이로 데스하는 경우'],
    tips: ['어택 무브(A클릭)를 습관화하면 포지션 실수가 크게 줄어듭니다', '서포터의 움직임을 예측해 미리 포지션을 잡는 연습을 하세요', '라인전에서 CS 손해 없이 버티는 것이 먼저, 킬은 그 다음입니다'],
  },
  support: {
    lane: '서포터', color: '#9b59b6',
    bgGradient: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
    name: '팀의 든든한 버팀목',
    description: '팀원을 위해 헌신하며 눈에 띄지 않지만 결정적인 순간을 만드는 플레이어입니다. 팀의 상황을 누구보다 빠르게 파악하고, 위기에서 팀원을 살려내는 것에 보람을 느낍니다. 배려심과 팀워크가 남다릅니다.',
    strengths: ['팀원 상태를 빠르게 파악하고 위기에 즉각 대응하는 능력', '시야 관리와 맵 리딩으로 팀 전체에 정보를 제공', '팀워크와 소통으로 게임 분위기를 이끄는 능력'],
    weaknesses: ['팀이 따라주지 않으면 혼자 캐리하기 매우 어려움', '팀 의존도가 높아 팀원 실수에 영향을 많이 받음', '자신의 기여가 수치로 잘 드러나지 않아 평가받기 어려움'],
    tips: ['능동적인 로밍을 시도해 중립 오브젝트에서도 영향력을 높이세요', '적 미드/정글 시야 장악을 주도하면 팀이 훨씬 안정됩니다', '이니시에이팅 타이밍을 배우면 팀에 더 큰 기여를 할 수 있습니다'],
  },
}

const LANE_LABEL: Record<Lane, string> = { top: '탑', jungle: '정글', mid: '미드', adc: '원딜', support: '서포터' }

const LANE_ICONS: Record<Lane, string> = {
  top:     'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-top.png',
  jungle:  'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-jungle.png',
  mid:     'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-middle.png',
  adc:     'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-bottom.png',
  support: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-utility.png',
}

function LaneIcon({ lane, size = 32, white = false }: { lane: Lane; size?: number; white?: boolean }) {
  return (
    <img
      src={LANE_ICONS[lane]}
      width={size}
      height={size}
      alt={LANE_LABEL[lane]}
      style={white ? { filter: 'brightness(0) invert(1)' } : undefined}
    />
  )
}

export default function TendencyTestPage() {
  const [step, setStep] = useState<number | 'result'>(0)
  const [scores, setScores] = useState<ScoreMap>({ top: 0, jungle: 0, mid: 0, adc: 0, support: 0 })
  const [selected, setSelected] = useState<number | null>(null)

  const handleNext = () => {
    if (selected === null) return
    const option = QUESTIONS[step as number].options[selected]
    const newScores = { ...scores }
    for (const lane of Object.keys(option.scores) as Lane[]) {
      newScores[lane] += option.scores[lane]
    }
    setScores(newScores)
    setSelected(null)
    const next = (step as number) + 1
    setStep(next >= QUESTIONS.length ? 'result' : next)
  }

  const handleRetry = () => {
    setStep(0)
    setScores({ top: 0, jungle: 0, mid: 0, adc: 0, support: 0 })
    setSelected(null)
  }

  if (step === 'result') {
    const topLane = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]) as Lane
    const result = LANE_RESULTS[topLane]
    const maxScore = Math.max(...Object.values(scores))
    return (
      <div className="tendency-page">
        <div className="tendency-result">
          <div className="tendency-result-header" style={{ background: result.bgGradient }}>
            <div className="tendency-result-icon"><LaneIcon lane={topLane} size={56} white /></div>
            <div className="tendency-result-lane-label">{result.lane} 포지션</div>
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
              <h3 className="tendency-section-title tendency-tips-title">개선 방향</h3>
              <ul className="tendency-result-list">
                {result.tips.map((t, i) => <li key={i} className="tendency-tip-item">{t}</li>)}
              </ul>
            </div>

            <div className="tendency-score-chart">
              <h4 className="tendency-chart-title">포지션 적합도</h4>
              {(Object.entries(scores) as [Lane, number][])
                .sort((a, b) => b[1] - a[1])
                .map(([lane, score]) => (
                  <div key={lane} className="tendency-score-row">
                    <div className="tendency-score-lane">
                      <LaneIcon lane={lane} size={16} />
                      <span>{LANE_LABEL[lane]}</span>
                    </div>
                    <div className="tendency-score-bar-wrap">
                      <div
                        className="tendency-score-bar"
                        style={{ width: `${maxScore > 0 ? (score / maxScore) * 100 : 0}%`, background: LANE_RESULTS[lane].color }}
                      />
                    </div>
                    <span className="tendency-score-num">{score}점</span>
                  </div>
                ))
              }
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
        <h1 className="tendency-title">롤 성향 테스트</h1>
        <p className="tendency-subtitle">12개의 질문으로 나에게 맞는 포지션과 플레이 스타일을 찾아보세요</p>
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
