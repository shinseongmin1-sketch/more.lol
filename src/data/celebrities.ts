export type CelebrityType = 'pro' | 'streamer'

export interface Celebrity {
  account: string
  displayName: string
  type: CelebrityType
  team?: string
}

const CELEBRITY_MAP: Record<string, Celebrity> = {
  // T1
  '페이커':     { account: 'Hide on bush#KR1',  displayName: '페이커',   type: 'pro', team: 'T1' },
  'faker':      { account: 'Hide on bush#KR1',  displayName: '페이커',   type: 'pro', team: 'T1' },
  '이상혁':     { account: 'Hide on bush#KR1',  displayName: '페이커',   type: 'pro', team: 'T1' },
  '구마유시':   { account: 'T1 Gumayusi#KR1',  displayName: '구마유시', type: 'pro', team: 'T1' },
  'gumayusi':   { account: 'T1 Gumayusi#KR1',  displayName: '구마유시', type: 'pro', team: 'T1' },
  '케리아':     { account: 'T1 Keria#KR1',      displayName: '케리아',   type: 'pro', team: 'T1' },
  'keria':      { account: 'T1 Keria#KR1',      displayName: '케리아',   type: 'pro', team: 'T1' },
  '오너':       { account: 'T1 Oner#KR1',       displayName: '오너',     type: 'pro', team: 'T1' },
  'oner':       { account: 'T1 Oner#KR1',       displayName: '오너',     type: 'pro', team: 'T1' },
  '제우스':     { account: 'T1 Zeus#KR1',       displayName: '제우스',   type: 'pro', team: 'T1' },
  'zeus':       { account: 'T1 Zeus#KR1',       displayName: '제우스',   type: 'pro', team: 'T1' },
  // Gen.G
  '초비':       { account: 'Gen G Chovy#KR1',  displayName: '초비',     type: 'pro', team: 'Gen.G' },
  'chovy':      { account: 'Gen G Chovy#KR1',  displayName: '초비',     type: 'pro', team: 'Gen.G' },
  '룰러':       { account: 'Gen G Ruler#KR1',  displayName: '룰러',     type: 'pro', team: 'Gen.G' },
  'ruler':      { account: 'Gen G Ruler#KR1',  displayName: '룰러',     type: 'pro', team: 'Gen.G' },
  '캐니언':     { account: 'Gen G Canyon#KR1', displayName: '캐니언',   type: 'pro', team: 'Gen.G' },
  'canyon':     { account: 'Gen G Canyon#KR1', displayName: '캐니언',   type: 'pro', team: 'Gen.G' },
  '피즈':       { account: 'Gen G Peyz#KR1',   displayName: '피즈',     type: 'pro', team: 'Gen.G' },
  'peyz':       { account: 'Gen G Peyz#KR1',   displayName: '피즈',     type: 'pro', team: 'Gen.G' },
  '도란':       { account: 'Gen G Doran#KR1',  displayName: '도란',     type: 'pro', team: 'Gen.G' },
  'doran':      { account: 'Gen G Doran#KR1',  displayName: '도란',     type: 'pro', team: 'Gen.G' },
  '레헨즈':     { account: 'Gen G Lehends#KR1', displayName: '레헨즈',  type: 'pro', team: 'Gen.G' },
  'lehends':    { account: 'Gen G Lehends#KR1', displayName: '레헨즈',  type: 'pro', team: 'Gen.G' },
  '피넛':       { account: 'Gen G Peanut#KR1', displayName: '피넛',     type: 'pro', team: 'Gen.G' },
  'peanut':     { account: 'Gen G Peanut#KR1', displayName: '피넛',     type: 'pro', team: 'Gen.G' },
  // Dplus Kia
  '쇼메이커':   { account: 'DK ShowMaker#KR1', displayName: '쇼메이커', type: 'pro', team: 'Dplus Kia' },
  'showmaker':  { account: 'DK ShowMaker#KR1', displayName: '쇼메이커', type: 'pro', team: 'Dplus Kia' },
  '베릴':       { account: 'Beryl#KR1',         displayName: '베릴',     type: 'pro', team: 'Dplus Kia' },
  'beryl':      { account: 'Beryl#KR1',         displayName: '베릴',     type: 'pro', team: 'Dplus Kia' },
  // KT Rolster
  '비디디':     { account: 'KT Bdd#KR1',        displayName: '비디디',   type: 'pro', team: 'KT' },
  'bdd':        { account: 'KT Bdd#KR1',        displayName: '비디디',   type: 'pro', team: 'KT' },
  // FA / retired
  '데프트':     { account: 'DRX Deft#KR1',      displayName: '데프트',   type: 'pro' },
  'deft':       { account: 'DRX Deft#KR1',      displayName: '데프트',   type: 'pro' },
  '너구리':     { account: 'Nuguri#KR1',         displayName: '너구리',   type: 'pro' },
  'nuguri':     { account: 'Nuguri#KR1',         displayName: '너구리',   type: 'pro' },
  '클리드':     { account: 'Clid#KR1',           displayName: '클리드',   type: 'pro' },
  'clid':       { account: 'Clid#KR1',           displayName: '클리드',   type: 'pro' },
  // Streamers / BJ
  '풍월량':     { account: '풍월량#KR1',     displayName: '풍월량',   type: 'streamer' },
  '감스트':     { account: '감동스타#KR1',   displayName: '감스트',   type: 'streamer' },
  '우왁굳':     { account: '우왁굳#KR1',     displayName: '우왁굳',   type: 'streamer' },
  '침착맨':     { account: '침착맨#KR1',     displayName: '침착맨',   type: 'streamer' },
  '이루리':     { account: '이루리#KR1',     displayName: '이루리',   type: 'streamer' },
  '악어':       { account: '악어#KR1',       displayName: '악어',     type: 'streamer' },
  '따효니':     { account: '따효니#KR1',     displayName: '따효니',   type: 'streamer' },
  '룩삼':       { account: '룩삼#KR1',       displayName: '룩삼',     type: 'streamer' },
  '랄로':       { account: '랄로#KR1',       displayName: '랄로',     type: 'streamer' },
}

export function findCelebrity(input: string): Celebrity | null {
  const key = input.trim().toLowerCase()
  return CELEBRITY_MAP[key] ?? null
}

export function searchCelebrities(input: string): Celebrity[] {
  if (!input.trim()) return []
  const key = input.trim().toLowerCase()
  const seen = new Set<string>()
  const results: Celebrity[] = []
  for (const [alias, celeb] of Object.entries(CELEBRITY_MAP)) {
    if (alias.startsWith(key) || celeb.displayName.toLowerCase().startsWith(key)) {
      if (!seen.has(celeb.account)) {
        seen.add(celeb.account)
        results.push(celeb)
      }
    }
  }
  return results
}
