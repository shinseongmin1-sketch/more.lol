import { useState, useEffect } from 'react'
import './TendencyTestPage.css'
import { getDDVersion, champIconUrl } from '../utils/riotApi'
import { CHAMP_KO_TO_ID } from '../utils/champIdMap'

type ChampClass = 'assassin' | 'tank' | 'mage' | 'marksman' | 'bruiser' | 'support'
interface ScoreMap { assassin: number; tank: number; mage: number; marksman: number; bruiser: number; support: number }
interface Option { text: string; scores: ScoreMap }
interface Question { question: string; options: Option[] }

function s(assassin: number, tank: number, mage: number, marksman: number, bruiser: number, support: number): ScoreMap {
  return { assassin, tank, mage, marksman, bruiser, support }
}

const QUESTIONS: Question[] = [
  {
    question: "한타에서 가장 하고 싶은 역할은?",
    options: [
      { text: "적 딜러를 찾아가 순식간에 처치한다", scores: s(3,0,0,0,1,0) },
      { text: "팀 앞에서 적의 스킬을 모두 받아낸다", scores: s(0,3,0,0,1,1) },
      { text: "광역 스킬로 여러 적을 동시에 강타한다", scores: s(0,0,3,1,0,0) },
      { text: "뒤에서 안전하게 지속적으로 딜을 넣는다", scores: s(0,0,1,3,0,0) },
    ]
  },
  {
    question: "가장 강하다고 느끼는 상황은?",
    options: [
      { text: "6레벨 이후 롤백 타이밍, 킬 압박을 넣을 때", scores: s(3,0,1,0,1,0) },
      { text: "아이템 2개 이상 갖추고 한타가 터질 때", scores: s(0,1,1,2,1,0) },
      { text: "레벨 1~3 초반 한타나 강제 교전", scores: s(1,2,0,0,2,1) },
      { text: "풀 아이템 후 공성과 한타를 주도할 때", scores: s(0,2,0,2,1,1) },
    ]
  },
  {
    question: "상대 딜러가 홀로 고립됐을 때?",
    options: [
      { text: "즉시 달려가 처치한다", scores: s(3,0,0,0,2,0) },
      { text: "우리 딜러가 맞으면 앞에서 막아준다", scores: s(0,3,0,0,0,2) },
      { text: "스킬 쿨이 돌아오면 광역으로 같이 처리한다", scores: s(0,0,3,1,0,0) },
      { text: "그 기회에 위치를 잡고 안전하게 딜한다", scores: s(0,0,0,3,0,1) },
    ]
  },
  {
    question: "선호하는 아이템 빌드 방향은?",
    options: [
      { text: "피해량·관통력을 극대화한다", scores: s(3,0,1,1,1,0) },
      { text: "체력·방어력·마저를 최대화한다", scores: s(0,3,0,0,2,0) },
      { text: "주문력·쿨타임을 최대화한다", scores: s(0,0,3,0,0,1) },
      { text: "공격력·치명타·공속을 쌓는다", scores: s(0,0,0,3,1,0) },
    ]
  },
  {
    question: "팀이 불리한 상황에서 나는?",
    options: [
      { text: "혼자서도 역전을 노리며 적극적으로 움직인다", scores: s(2,0,1,0,2,0) },
      { text: "적의 공격을 받아내며 팀원이 살 시간을 번다", scores: s(0,3,0,0,1,1) },
      { text: "결정적 한방을 위해 스킬을 아끼고 타이밍을 잡는다", scores: s(0,0,3,0,0,0) },
      { text: "침착하게 포지션을 잡고 기회가 오면 딜을 넣는다", scores: s(0,0,0,3,0,1) },
    ]
  },
  {
    question: "실수로 킬을 헌납했을 때?",
    options: [
      { text: "즉시 다음 교전에서 되갚아준다", scores: s(3,0,0,0,2,0) },
      { text: "팀원 앞에서 더 열심히 맞으며 보호한다", scores: s(0,3,0,0,0,1) },
      { text: "스킬 콤보를 더 신중하게 사용한다", scores: s(0,0,3,0,0,1) },
      { text: "포지션을 더 신경 쓰며 안전하게 딜한다", scores: s(0,0,0,3,0,0) },
    ]
  },
  {
    question: "가장 선호하는 챔피언 특성은?",
    options: [
      { text: "빠른 이동기와 단일 대상 폭발 피해", scores: s(3,0,0,0,1,0) },
      { text: "높은 체력과 강력한 군중 제어기", scores: s(0,3,0,0,1,1) },
      { text: "화려한 광역 스킬과 높은 마법 피해", scores: s(0,0,3,0,0,1) },
      { text: "긴 사거리와 안정적인 기본 공격 딜", scores: s(0,0,0,3,0,0) },
    ]
  },
  {
    question: "게임에서 가장 뿌듯한 순간은?",
    options: [
      { text: "적 딜러를 콤보 한 번에 처치했을 때", scores: s(3,0,1,0,1,0) },
      { text: "적의 CC기를 모두 받고 팀원을 살렸을 때", scores: s(0,3,0,0,0,2) },
      { text: "광역 스킬이 4명 이상 맞아 한타를 지배했을 때", scores: s(0,0,3,0,0,0) },
      { text: "한타 딜량 1위를 찍고 팀이 이겼을 때", scores: s(0,0,1,3,0,0) },
    ]
  },
  {
    question: "나의 성격과 가장 가까운 것은?",
    options: [
      { text: "빠르고 결단력 있다, 기회를 절대 놓치지 않는다", scores: s(3,0,0,0,1,0) },
      { text: "묵묵하고 희생정신이 강하다", scores: s(0,3,0,0,0,2) },
      { text: "창의적이고 전략적, 상황 분석을 즐긴다", scores: s(0,0,2,0,0,1) },
      { text: "꼼꼼하고 안정적이다, 실수를 극히 싫어한다", scores: s(0,0,0,3,0,0) },
    ]
  },
  {
    question: "배우고 싶은 기술은?",
    options: [
      { text: "갭클로즈와 백라인 다이브 타이밍", scores: s(3,0,0,0,1,0) },
      { text: "이니시에이팅과 CC 연계 타이밍", scores: s(0,3,0,0,1,1) },
      { text: "스킬샷 에임과 콤보 최적화", scores: s(0,0,3,0,0,0) },
      { text: "어택무브와 포지셔닝", scores: s(0,0,0,3,0,0) },
    ]
  },
]

interface ChampClassData {
  name: string; color: string; bgGradient: string
  description: string; strengths: string[]; weaknesses: string[]; tips: string[]
  examples: string[]
}

const CLASS_RESULTS: Record<ChampClass, ChampClassData> = {
  assassin: {
    name: '암살자 유형', color: '#e74c3c',
    bgGradient: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
    description: '적진에 날아들어 한순간에 목표물을 처치하는 암살자 플레이 스타일이 어울립니다. 빠른 기동성과 압도적인 버스트 딜로 적 딜러를 제거해 팀을 유리하게 만드는 데 재미를 느끼는 유형입니다. 실행력과 결단력이 강점입니다.',
    strengths: ['단일 대상 순간 처치 능력 최고', '빠른 이동기로 전장을 종횡무진', '적 딜러 제거로 한타 흐름 전환'],
    weaknesses: ['아이템 없는 초반 교전 취약', '잘못된 타이밍의 다이브는 즉사', '광역 CC기에 매우 취약'],
    tips: ['상대 스킬이 빠진 0.5초가 진입 타이밍입니다', '와드로 정글 위치를 항상 확인하고 움직이세요', '아이템 1개 완성 후 킬 압박을 시작하면 효과적입니다'],
    examples: ['제드', '카타리나', '탈론', '피즈', '아칼리'],
  },
  tank: {
    name: '탱커 유형', color: '#2980b9',
    bgGradient: 'linear-gradient(135deg, #1a5276 0%, #2980b9 100%)',
    description: '팀의 방패로서 모든 공격을 받아내며 팀원을 지키는 탱커 스타일이 어울립니다. 강력한 CC기로 적을 묶고 팀이 딜을 넣을 수 있는 환경을 조성하는 데서 보람을 느끼는 유형입니다. 희생정신이 강점입니다.',
    strengths: ['높은 내구성으로 어떤 상황에서도 버팀', '강력한 이니시에이팅과 CC 연계', '팀 앞에서 존재감 최대'],
    weaknesses: ['단독 캐리 능력이 낮음', '딜러 없이는 아무것도 할 수 없음', '아이템 후반 딜 기여 제한적'],
    tips: ['이니시에이팅은 아군 딜러 스킬 쿨 확인 후 시작하세요', '드래곤/바론 전 시야를 먼저 확보하세요', '아군 딜러 보호를 적 킬보다 우선시하세요'],
    examples: ['말파이트', '레오나', '오른', '나르', '암베사'],
  },
  mage: {
    name: '마법사 유형', color: '#8e44ad',
    bgGradient: 'linear-gradient(135deg, #6c3483 0%, #9b59b6 100%)',
    description: '강력한 광역 스킬로 여러 적을 동시에 제압하는 마법사 스타일이 어울립니다. 정확한 스킬 에임과 완벽한 콤보 타이밍에서 오는 성취감을 즐기는 유형입니다. 창의적이고 전략적인 플레이가 특기입니다.',
    strengths: ['광역 CC와 높은 마법 피해로 한타 지배', '스킬 적중 시 독특한 성취감', '포지션에 따른 다양한 플레이 스타일 가능'],
    weaknesses: ['스킬 빗나가면 전투 기여도 급락', '마나 관리 실패 시 무력화', '이동기 없는 챔피언은 포지션 실수가 치명적'],
    tips: ['스킬샷은 상대의 이동 방향을 예측해 던지세요', '한타 전까지 스킬을 아끼는 습관을 들이세요', '포지션을 미리 잡고 시작하는 것이 핵심입니다'],
    examples: ['신드라', '빅토르', '애니비아', '룰루', '럭스'],
  },
  marksman: {
    name: '원딜 유형', color: '#e67e22',
    bgGradient: 'linear-gradient(135deg, #ca6f1e 0%, #e67e22 100%)',
    description: '완벽한 포지셔닝과 안정적인 지속 딜로 팀의 화력을 책임지는 원딜 스타일이 어울립니다. 흔들리지 않는 집중력으로 최대 딜을 뽑아내는 데서 만족을 느끼는 유형입니다. 꼼꼼함과 안정성이 강점입니다.',
    strengths: ['아이템 완성 후 가장 높은 지속 딜량', '꼼꼼한 포지션과 안정적인 플레이', '후반 한타에서 팀의 핵심 자원'],
    weaknesses: ['CC기에 잡히면 즉사', '초반 약하고 서포터 의존도 높음', '포지션 실수 하나가 한타 전체를 무너뜨림'],
    tips: ['어택무브(A클릭)를 항상 사용하세요', '한타에서 절대로 앞줄에 서지 마세요', '서포터의 움직임을 예측하고 미리 포지션을 잡으세요'],
    examples: ['징크스', '케이틀린', '에즈리얼', '애쉬', '바루스'],
  },
  bruiser: {
    name: '전사 유형', color: '#27ae60',
    bgGradient: 'linear-gradient(135deg, #1e8449 0%, #27ae60 100%)',
    description: '딜과 내구성을 동시에 갖춰 근접 전투를 지배하는 전사 스타일이 어울립니다. 1:1 전투와 소규모 교전에서 강인함을 발휘하며, 솔로킬과 분리 싸움에서 최고의 재미를 느끼는 유형입니다.',
    strengths: ['딜과 내구성 균형으로 어디서든 강함', '1:1 전투에서 뛰어난 솔로 캐리 능력', '다양한 포지션과 상황에서 유연하게 대처'],
    weaknesses: ['아이템 없으면 딜도 탱도 어중간', '광역 CC와 광역 딜에 한계 존재', '팀파이팅보다 소규모 전투에 특화돼 팀워크 필요'],
    tips: ['상대 체력이 줄었을 때 짧은 교전으로 이득을 취하세요', '텔레포트 합류 타이밍이 승패를 결정합니다', '아이템 1~2개 완성 후 교전을 늘리세요'],
    examples: ['다리우스', '피오라', '일라오이', '야스오', '렝가'],
  },
  support: {
    name: '서포터 유형', color: '#16a085',
    bgGradient: 'linear-gradient(135deg, #0e6655 0%, #16a085 100%)',
    description: '팀원을 살리고 보조하며 보이지 않는 곳에서 게임을 만들어가는 서포터 스타일이 어울립니다. 팀원의 위기를 구해내고 이니시에이팅으로 게임 흐름을 바꾸는 데서 성취감을 느끼는 유형입니다.',
    strengths: ['팀원을 살려내는 결정적 순간 창출', '시야 장악으로 팀 전체에 정보 제공', '이니시에이팅 타이밍으로 한타를 여는 핵심 역할'],
    weaknesses: ['단독 캐리 능력 거의 없음', '팀이 따라주지 않으면 기여가 무의미', '개인 성장이 더디고 아이템 부족'],
    tips: ['로밍 타이밍을 적극적으로 찾으세요 — 미드 갱킹은 게임을 바꿉니다', '시야를 적 정글 쪽까지 확장하면 팀이 안정됩니다', '이니시 타이밍은 아군 딜러 스킬 쿨 확인 후 시작하세요'],
    examples: ['쓰레쉬', '나미', '레오나', '블리츠크랭크', '룰루'],
  },
}

const CLASS_LABEL: Record<ChampClass, string> = {
  assassin: '암살자', tank: '탱커', mage: '마법사', marksman: '원딜', bruiser: '전사', support: '서포터'
}
const CLASS_EMOJI: Record<ChampClass, string> = {
  assassin: '🗡️', tank: '🛡️', mage: '🔮', marksman: '🏹', bruiser: '⚔️', support: '💚'
}

export default function ChampionTypePage() {
  const [step, setStep] = useState<number | 'result'>(0)
  const [scores, setScores] = useState<ScoreMap>({ assassin: 0, tank: 0, mage: 0, marksman: 0, bruiser: 0, support: 0 })
  const [selected, setSelected] = useState<number | null>(null)
  const [ddVersion, setDdVersion] = useState('')

  useEffect(() => {
    getDDVersion().then(setDdVersion).catch(() => {})
  }, [])

  const handleNext = () => {
    if (selected === null) return
    const option = QUESTIONS[step as number].options[selected]
    const newScores = { ...scores }
    for (const cls of Object.keys(option.scores) as ChampClass[]) {
      newScores[cls] += option.scores[cls]
    }
    setScores(newScores)
    setSelected(null)
    const next = (step as number) + 1
    setStep(next >= QUESTIONS.length ? 'result' : next)
  }

  const handleRetry = () => {
    setStep(0)
    setScores({ assassin: 0, tank: 0, mage: 0, marksman: 0, bruiser: 0, support: 0 })
    setSelected(null)
  }

  if (step === 'result') {
    const topClass = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]) as ChampClass
    const result = CLASS_RESULTS[topClass]
    const maxScore = Math.max(...Object.values(scores))
    return (
      <div className="tendency-page">
        <div className="tendency-result">
          <div className="tendency-result-header" style={{ background: result.bgGradient }}>
            <div className="tendency-result-icon" style={{ fontSize: 52, lineHeight: 1 }}>{CLASS_EMOJI[topClass]}</div>
            <div className="tendency-result-lane-label">{CLASS_LABEL[topClass]} 챔피언</div>
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
              <h3 className="tendency-section-title tendency-tips-title">추천 챔피언</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {result.examples.map((champ, i) => {
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
              <h4 className="tendency-chart-title">챔피언 클래스 적합도</h4>
              {(Object.entries(scores) as [ChampClass, number][])
                .sort((a, b) => b[1] - a[1])
                .map(([cls, score]) => (
                  <div key={cls} className="tendency-score-row">
                    <div className="tendency-score-lane">
                      <span style={{ fontSize: 14 }}>{CLASS_EMOJI[cls]}</span>
                      <span>{CLASS_LABEL[cls]}</span>
                    </div>
                    <div className="tendency-score-bar-wrap">
                      <div className="tendency-score-bar" style={{ width: `${maxScore > 0 ? (score / maxScore) * 100 : 0}%`, background: CLASS_RESULTS[cls].color }} />
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
        <h1 className="tendency-title">챔피언 유형 추천 테스트</h1>
        <p className="tendency-subtitle">10개의 질문으로 나에게 딱 맞는 챔피언 클래스를 찾아보세요</p>
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
