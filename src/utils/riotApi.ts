const API_KEY = 'RGAPI-d45464a9-6def-494b-98d4-6a0d5967f2ef'

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
  const res = await fetch(url, { headers: { 'X-Riot-Token': API_KEY } })
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

export async function getMatchIds(puuid: string, count = 20) {
  return riotFetch(`/riot-asia/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`)
}

export async function getMatch(matchId: string) {
  return riotFetch(`/riot-asia/lol/match/v5/matches/${matchId}`)
}

// Data Dragon (CDN, no API key needed)
let _version: string | null = null
let _champMap: Record<string, { name: string; id: string }> | null = null

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

export function champIconUrl(version: string, champId: string) {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champId}.png`
}

export function itemIconUrl(version: string, itemId: number) {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${itemId}.png`
}

export function profileIconUrl(version: string, iconId: number) {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${iconId}.png`
}
