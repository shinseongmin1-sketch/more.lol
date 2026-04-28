import { useState, useEffect } from 'react'
import './TendencyTestPage.css'
import { CHAMP_KO_TO_ID } from '../utils/champIdMap'

type Mood = 'burst' | 'sustained' | 'teamfight' | 'support' | 'duel' | 'chill'
interface ScoreMap { burst: number; sustained: number; teamfight: number; support: number; duel: number; chill: number }
interface Option { text: string; scores: ScoreMap }
interface Question { question: string; options: Option[] }

function s(burst: number, sustained: number, teamfight: number, support: number, duel: number, chill: number): ScoreMap {
  return { burst, sustained, teamfight, support, duel, chill }
}

const QUESTIONS: Question[] = [
  {
    question: "오늘 기분은 어때?",
    options: [
      { text: "개운하고 에너지가 넘친다 — 뭔가 터뜨리고 싶다", scores: s(3,0,1,0,2,0) },
      { text: "안정적이고 차분하다 — 집중해서 잘할 것 같다", scores: s(0,3,1,0,0,0) },
      { text: "스트레스를 한방에 날려버리고 싶다", scores: s(2,0,2,0,2,0) },
      { text: "가볍게 즐기며 부담 없이 하고 싶다", scores: s(0,0,0,1,0,3) },
    ]
  },
  {
    question: "오늘 집중력은?",
    options: [
      { text: "매우 좋다 — 어떤 챔피언도 잘할 수 있을 것 같다", scores: s(2,2,1,0,2,0) },
      { text: "보통이다 — 익숙한 챔피언이 편할 것 같다", scores: s(0,1,1,1,0,2) },
      { text: "조금 흐리다 — 쉬운 챔피언이 좋겠다", scores: s(0,0,1,2,0,3) },
    ]
  },
  {
    question: "오늘 어떤 방식으로 이기고 싶어?",
    options: [
      { text: "혼자 캐리해서 압도적으로 이기고 싶다", scores: s(2,1,0,0,3,0) },
      { text: "팀과 함께 한타로 화끈하게 이기고 싶다", scores: s(0,0,3,2,0,0) },
      { text: "안정적으로 운영해서 차분히 이기고 싶다", scores: s(0,3,0,1,0,1) },
      { text: "뭐든 상관없다, 그냥 재밌게 하고 싶다", scores: s(0,0,1,1,0,3) },
    ]
  },
  {
    question: "오늘 어떤 스킬을 더 사용하고 싶어?",
    options: [
      { text: "콤보 연계! 폭발적인 스킬 연속", scores: s(3,0,0,0,1,0) },
      { text: "기본 공격 위주로 안정적으로", scores: s(0,3,0,0,1,0) },
      { text: "CC기로 적을 묶고 팀원이 딜하도록", scores: s(0,0,2,2,0,0) },
      { text: "힐, 쉴드로 팀원을 살리는 스킬", scores: s(0,0,1,3,0,0) },
    ]
  },
  {
    question: "오늘 어떤 결과가 나오면 제일 뿌듯할 것 같아?",
    options: [
      { text: "적 딜러를 한 방에 처치하는 폭발적인 킬", scores: s(3,0,0,0,1,0) },
      { text: "한타 딜량 1위 + 팀 승리", scores: s(0,3,1,0,0,0) },
      { text: "내 이니시로 한타를 열고 팀이 이겼을 때", scores: s(0,0,3,1,0,0) },
      { text: "아슬아슬하게 팀원 살리고 역전했을 때", scores: s(0,0,0,3,0,0) },
    ]
  },
  {
    question: "오늘 상대하고 싶은 상황은?",
    options: [
      { text: "1:1 솔로킬을 딸 수 있는 상황", scores: s(1,0,0,0,3,0) },
      { text: "5:5 전원 참여 한타", scores: s(0,1,3,1,0,0) },
      { text: "그냥 조용히 파밍하고 싶다", scores: s(0,2,0,0,0,3) },
      { text: "팀원과 2:2, 3:3 소규모 싸움", scores: s(1,0,1,1,1,0) },
    ]
  },
]

interface MoodData {
  name: string; color: string; bgGradient: string; emoji: string
  description: string
  champs: Array<{ name: string; reason: string }>
}

const MOOD_RESULTS: Record<Mood, MoodData> = {
  burst: {
    name: '버스트 딜러 기분', color: '#e74c3c', emoji: '💥',
    bgGradient: 'linear-gradient(135deg, #922b21 0%, #e74c3c 100%)',
    description: '오늘은 적을 순식간에 처치하는 폭발적인 플레이가 어울립니다. 스킬 콤보가 완벽하게 맞아 적이 녹아내리는 순간의 쾌감을 즐겨보세요!',
    champs: [
      { name: '제드', reason: '쉐도우 콤보로 원딜을 한 방에 처치하는 최고의 암살자' },
      { name: '카타리나', reason: '리셋 연속으로 팀 전체를 요리하는 최강 스노우볼' },
      { name: '신드라', reason: '유성 콤보 한 방으로 어떤 챔피언도 기절시키는 마법사' },
    ]
  },
  sustained: {
    name: '지속 딜러 기분', color: '#e67e22', emoji: '🎯',
    bgGradient: 'linear-gradient(135deg, #9c4a0c 0%, #e67e22 100%)',
    description: '오늘은 안정적으로 지속 딜을 넣는 플레이가 어울립니다. 흔들리지 않는 포지션과 꾸준한 기본 공격으로 한타 딜량 1위를 노려보세요!',
    champs: [
      { name: '징크스', reason: '로켓 스택 후 후반 한타에서 폭발적인 딜량을 자랑하는 원딜' },
      { name: '케이틀린', reason: '긴 사거리와 안정적인 CS로 라인전부터 한타까지 전부 강함' },
      { name: '트리스타나', reason: '후반 점프 딜이 폭발적으로 강해지는 성장형 원딜' },
    ]
  },
  teamfight: {
    name: '한타 중심 기분', color: '#27ae60', emoji: '⚔️',
    bgGradient: 'linear-gradient(135deg, #1a6b3c 0%, #27ae60 100%)',
    description: '오늘은 팀과 함께 화끈한 한타를 즐기는 플레이가 어울립니다. 이니시에이팅 또는 광역 스킬로 한타 MVP를 狙아보세요!',
    champs: [
      { name: '아무무', reason: '밴시의 제물 + 광역 궁으로 5명을 묶는 최강의 이니시에이터' },
      { name: '말파이트', reason: '아이템 완성 후 광역 궁 한 방으로 게임을 뒤집는 한타왕' },
      { name: '오리아나', reason: '완벽한 볼 콤보로 여러 명을 동시에 날리는 한타 마법사' },
    ]
  },
  support: {
    name: '팀원 케어 기분', color: '#3498db', emoji: '💚',
    bgGradient: 'linear-gradient(135deg, #1a5276 0%, #3498db 100%)',
    description: '오늘은 팀원을 지키고 보조하는 플레이가 어울립니다. 아슬아슬한 순간에 팀원을 살려내는 역전의 기쁨을 누려보세요!',
    champs: [
      { name: '나미', reason: '연속 폴리모프와 힐로 원딜을 완벽하게 보호하는 서포터' },
      { name: '룰루', reason: '위협받는 순간마다 실드와 폴리모프로 팀원을 살리는 최강 보조' },
      { name: '소라카', reason: '전 맵 힐로 원거리에서도 팀원을 살릴 수 있는 유일무이한 서포터' },
    ]
  },
  duel: {
    name: '1대1 결투 기분', color: '#8e44ad', emoji: '🗡️',
    bgGradient: 'linear-gradient(135deg, #5b2c6f 0%, #8e44ad 100%)',
    description: '오늘은 1:1 솔로킬로 상대를 압도하는 플레이가 어울립니다. 라인전에서 솔로킬을 따내고 스노우볼 굴리는 재미를 즐겨보세요!',
    champs: [
      { name: '피오라', reason: '4개의 급소를 공략해 어떤 탱커도 잡아버리는 1:1의 정점' },
      { name: '다리우스', reason: '라인전에서 출혈로 상대를 처처하고 스노우볼 굴리는 탑의 군주' },
      { name: '야스오', reason: '칸막이 + 공속으로 상대를 압도하는 0.5비용 특화 챔피언' },
    ]
  },
  chill: {
    name: '편안한 플레이 기분', color: '#16a085', emoji: '😌',
    bgGradient: 'linear-gradient(135deg, #0b5345 0%, #16a085 100%)',
    description: '오늘은 부담 없이 편안하게 즐기는 플레이가 어울립니다. 쉽고 직관적인 챔피언으로 게임 자체를 즐겨보세요!',
    champs: [
      { name: '가렌', reason: '스핀으로 쉽게 딜하고 W로 버티는 가장 직관적인 탑라이너' },
      { name: '애쉬', reason: '화살 맞추기만 해도 시야와 CC까지 해결되는 쉬운 원딜' },
      { name: '말자하', reason: '버튼 하나로 상대를 억제하고 딜까지 쉽게 하는 미드의 편안함' },
    ]
  },
}

export default function DailyChampPage() {
  const [step, setStep] = useState<number | 'result'>(0)
  const [scores, setScores] = useState<ScoreMap>({ burst: 0, sustained: 0, teamfight: 0, support: 0, duel: 0, chill: 0 })
  const [selected, setSelected] = useState<number | null>(null)
  const [ddVersion, setDdVersion] = useState('')

  useEffect(() => {
    fetch('https://ddragon.leagueoflegends.com/api/versions.json')
      .then(r => r.json())
      .then((v: string[]) => setDdVersion(v[0]))
      .catch(() => {})
  }, [])

  const handleNext = () => {
    if (selected === null) return
    const option = QUESTIONS[step as number].options[selected]
    const newScores = { ...scores }
    for (const m of Object.keys(option.scores) as Mood[]) {
      newScores[m] += option.scores[m]
    }
    setScores(newScores)
    setSelected(null)
    const next = (step as number) + 1
    setStep(next >= QUESTIONS.length ? 'result' : next)
  }

  const handleRetry = () => {
    setStep(0)
    setScores({ burst: 0, sustained: 0, teamfight: 0, support: 0, duel: 0, chill: 0 })
    setSelected(null)
  }

  if (step === 'result') {
    const topMood = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]) as Mood
    const result = MOOD_RESULTS[topMood]

    return (
      <div className="tendency-page">
        <div className="tendency-result">
          <div className="tendency-result-header" style={{ background: result.bgGradient }}>
            <div className="tendency-result-icon" style={{ fontSize: 52, lineHeight: 1 }}>{result.emoji}</div>
            <div className="tendency-result-lane-label">오늘의 기분</div>
            <div className="tendency-result-name">{result.name}</div>
          </div>
          <div className="tendency-result-body">
            <p className="tendency-result-desc">{result.description}</p>

            <div className="tendency-result-section">
              <h3 className="tendency-section-title tendency-tips-title">오늘 추천 챔피언</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                {result.champs.map((champ, i) => {
                  const champId = CHAMP_KO_TO_ID[champ.name]
                  const loadingImg = champId
                    ? `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champId}_0.jpg`
                    : null
                  return (
                    <div key={i} style={{
                      background: result.color + '10',
                      border: `1px solid ${result.color}35`,
                      borderRadius: 3,
                      display: 'flex', alignItems: 'stretch', overflow: 'hidden',
                    }}>
                      {/* 왼쪽 로딩 스크린 이미지 */}
                      <div style={{ width: 72, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                        {loadingImg ? (
                          <img
                            src={loadingImg}
                            alt={champ.name}
                            style={{
                              width: '100%', height: '100%',
                              objectFit: 'cover', objectPosition: 'top center',
                              display: 'block',
                            }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: result.color + '25' }} />
                        )}
                        {/* 순서 뱃지 */}
                        <span style={{
                          position: 'absolute', top: 6, left: 6,
                          background: result.color, color: '#fff',
                          width: 20, height: 20, borderRadius: 2,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 800, lineHeight: 1,
                        }}>{i + 1}</span>
                        {/* 우측 그라디언트 페이드 */}
                        <div style={{
                          position: 'absolute', top: 0, right: 0, bottom: 0, width: 24,
                          background: `linear-gradient(to right, transparent, ${result.color}18)`,
                          pointerEvents: 'none',
                        }} />
                      </div>
                      {/* 오른쪽 텍스트 */}
                      <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {ddVersion && champId && (
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/${ddVersion}/img/champion/${champId}.png`}
                              alt={champ.name}
                              style={{ width: 24, height: 24, borderRadius: 2, objectFit: 'cover', flexShrink: 0 }}
                            />
                          )}
                          <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{champ.name}</span>
                        </div>
                        <p style={{ fontSize: 12, color: '#8a96aa', margin: 0, lineHeight: 1.65 }}>{champ.reason}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{
              marginTop: 24, padding: '14px 16px',
              background: 'var(--bg-page, rgba(0,0,0,0.04))',
              borderRadius: 12, border: '1px solid var(--border-color)',
              fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, textAlign: 'center',
            }}>
              오늘 기분에 딱 맞는 챔피언으로 좋은 플레이 하세요!
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
        <h1 className="tendency-title">오늘의 챔피언 추천</h1>
        <p className="tendency-subtitle">지금 기분과 상태에 딱 맞는 오늘의 챔피언을 찾아드립니다</p>
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
