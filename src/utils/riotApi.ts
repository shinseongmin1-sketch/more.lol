export const QUEUE_LABELS: Record<number, string> = {
  420: '솔로랭크',
  440: '자유랭크',
  450: 'ARAM',
  430: '일반',
  400: '일반',
  900: 'URF',
  1020: '원칙',
  1400: '궁극기 주문서',
  1700: '아레나',
}

async function riotFetch(url: string) {
  let res: Response

  if (import.meta.env.DEV) {
    // 개발 환경: Vite proxy가 CORS 처리, API 키는 env var에서
    const devKey = import.meta.env.VITE_RIOT_API_KEY ?? ''
    res = await fetch(url, { headers: { 'X-Riot-Token': devKey } })
  } else {
    // 프로덕션: /api/riot 서버리스 프록시 사용 (API 키 서버에서 처리)
    let riotUrl: string
    if (url.startsWith('/riot-kr/')) {
      riotUrl = 'https://kr.api.riotgames.com' + url.slice('/riot-kr'.length)
    } else if (url.startsWith('/riot-asia/')) {
      riotUrl = 'https://asia.api.riotgames.com' + url.slice('/riot-asia'.length)
    } else {
      riotUrl = url
    }
    res = await fetch(`/api/riot?url=${encodeURIComponent(riotUrl)}`)
  }

  if (!res.ok) throw new Error(String(res.status))
  return res.json()
}

export async function getAccount(gameName: string, tagLine: string) {
  return riotFetch(
    `/riot-asia/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  )
}

export async function getSummonerByPuuid(puuid: string) {
  return riotFetch(`/riot-kr/lol/summoner/v4/summoners/by-puuid/${puuid}`)
}

export async function getRankedInfo(puuid: string) {
  return riotFetch(`/riot-kr/lol/league/v4/entries/by-puuid/${puuid}`)
}

export async function getMatchIds(puuid: string, count = 100, start = 0) {
  return riotFetch(`/riot-asia/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`)
}

// 전체 매치 ID 페이지네이션으로 가져오기 (최대 maxTotal개)
export async function getAllMatchIds(puuid: string, maxTotal = 1000): Promise<string[]> {
  const PAGE = 100
  const allIds: string[] = []
  let start = 0
  while (allIds.length < maxTotal) {
    const ids: string[] = await riotFetch(
      `/riot-asia/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${PAGE}`
    )
    if (!ids || ids.length === 0) break
    allIds.push(...ids)
    if (ids.length < PAGE) break
    start += PAGE
    // rate limit 방지: 페이지 사이 짧은 딜레이
    await new Promise(r => setTimeout(r, 200))
  }
  return allIds.slice(0, maxTotal)
}

export async function getMatch(matchId: string) {
  return riotFetch(`/riot-asia/lol/match/v5/matches/${matchId}`)
}

// Data Dragon (CDN, no API key needed)
let _version: string | null = null
let _champMap: Record<string, { name: string; id: string }> | null = null
let _spellMap: Record<string, { id: string; name: string }> | null = null
let _runeMap: Record<number, { icon: string; name: string }> | null = null

export async function getDDVersion(): Promise<string> {
  if (_version) return _version
  const versions: string[] = await fetch('https://ddragon.leagueoflegends.com/api/versions.json').then(r => r.json())
  _version = versions[0]
  return _version!
}

export async function getChampMap(): Promise<Record<string, { name: string; id: string }>> {
  if (_champMap) return _champMap
  const version = await getDDVersion()
  const data = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/champion.json`
  ).then(r => r.json())
  _champMap = {}
  for (const champ of Object.values(data.data) as any[]) {
    _champMap![String(champ.key)] = { name: champ.name, id: champ.id }
  }
  return _champMap!
}

export async function getSpellMap(): Promise<Record<string, { id: string; name: string }>> {
  if (_spellMap) return _spellMap
  const version = await getDDVersion()
  const data = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/summoner.json`).then(r => r.json()) as any
  _spellMap = {}
  for (const spell of Object.values(data.data) as any[]) {
    _spellMap![String(spell.key)] = { id: spell.id, name: spell.name }
  }
  return _spellMap!
}

export async function getRuneMap(): Promise<Record<number, { icon: string; name: string }>> {
  if (_runeMap) return _runeMap
  const version = await getDDVersion()
  const data = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/runesReforged.json`).then(r => r.json()) as any[]
  _runeMap = {}
  for (const tree of data) {
    _runeMap![tree.id] = { icon: tree.icon, name: tree.name }
    for (const slot of tree.slots) {
      for (const rune of slot.runes) {
        _runeMap![rune.id] = { icon: rune.icon, name: rune.name }
      }
    }
  }
  return _runeMap!
}

export function spellIconUrl(version: string, spellId: string) {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spellId}.png`
}

export function runeIconUrl(icon: string) {
  return `https://ddragon.leagueoflegends.com/cdn/img/${icon}`
}

export function champIconUrl(version: string, champId: string) {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champId}.png`
}

export function itemIconUrl(version: string, itemId: number) {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${itemId}.png`
}

export function profileIconUrl(version: string, iconId: number) {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${iconId}.png`
}

export async function getLiveGame(summonerId: string) {
  return riotFetch(`/riot-kr/lol/spectator/v5/active-games/by-summoner/${encodeURIComponent(summonerId)}`)
}
