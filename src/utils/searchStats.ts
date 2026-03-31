const todayKey = () => `morelol_searches_${new Date().toISOString().slice(0, 10)}`
const CHAMP_KEY = 'morelol_analyzed_champions'
const EVENT = 'morelol:stats'

export function incrementSummonerSearch(): number {
  const key = todayKey()
  const next = (parseInt(localStorage.getItem(key) || '0', 10)) + 1
  localStorage.setItem(key, String(next))
  window.dispatchEvent(new CustomEvent(EVENT))
  return next
}

export function getTodaySummonerCount(): number {
  return parseInt(localStorage.getItem(todayKey()) || '0', 10)
}

export function incrementChampionAnalysis(championName: string): void {
  const list: string[] = JSON.parse(localStorage.getItem(CHAMP_KEY) || '[]')
  if (!list.includes(championName)) {
    list.push(championName)
    localStorage.setItem(CHAMP_KEY, JSON.stringify(list))
    window.dispatchEvent(new CustomEvent(EVENT))
  }
}

export function getAnalyzedChampionCount(): number {
  return JSON.parse(localStorage.getItem(CHAMP_KEY) || '[]').length
}

export function onStatsChange(cb: () => void): () => void {
  window.addEventListener(EVENT, cb)
  return () => window.removeEventListener(EVENT, cb)
}
