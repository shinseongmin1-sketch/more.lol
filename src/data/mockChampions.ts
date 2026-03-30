export interface Champion {
  id: number
  name: string
  korName: string
  tier: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D'
  winRate: number
  pickRate: number
  banRate: number
  kda: number
  avgKills: number
  avgDeaths: number
  avgAssists: number
  dmgDealt: number
  dmgTaken: number
  pentaKills: number
  games: number
  iconColor: string
  position?: string
}

export const mockChampions: Champion[] = [
  { id: 1, name: 'Yone', korName: '요네', tier: 'S+', winRate: 56.8, pickRate: 18.2, banRate: 32.1, kda: 4.2, avgKills: 9.1, avgDeaths: 4.2, avgAssists: 7.8, dmgDealt: 28420, dmgTaken: 15200, pentaKills: 1243, games: 48201, iconColor: '#4a90e2', position: '미드' },
  { id: 2, name: 'Jinx', korName: '진', tier: 'S+', winRate: 55.4, pickRate: 16.8, banRate: 12.3, kda: 3.9, avgKills: 10.2, avgDeaths: 5.1, avgAssists: 7.2, dmgDealt: 31200, dmgTaken: 11800, pentaKills: 2109, games: 44391, iconColor: '#ff6b9d', position: '원딜' },
  { id: 3, name: 'Lux', korName: '럭스', tier: 'S', winRate: 54.1, pickRate: 14.5, banRate: 8.7, kda: 4.1, avgKills: 7.3, avgDeaths: 4.2, avgAssists: 12.1, dmgDealt: 24800, dmgTaken: 9200, pentaKills: 412, games: 38420, iconColor: '#ffd43b', position: '미드' },
  { id: 4, name: 'Ziggs', korName: '직스', tier: 'S', winRate: 53.7, pickRate: 12.1, banRate: 5.4, kda: 3.8, avgKills: 8.4, avgDeaths: 5.2, avgAssists: 10.3, dmgDealt: 26100, dmgTaken: 10400, pentaKills: 698, games: 32100, iconColor: '#ff8c42', position: '미드' },
  { id: 5, name: 'Seraphine', korName: '세라핀', tier: 'S', winRate: 53.2, pickRate: 11.8, banRate: 4.2, kda: 4.5, avgKills: 5.2, avgDeaths: 3.8, avgAssists: 16.4, dmgDealt: 18200, dmgTaken: 8900, pentaKills: 89, games: 31200, iconColor: '#ff69b4', position: '서포터' },
  { id: 6, name: 'Xerath', korName: '제라스', tier: 'A', winRate: 52.8, pickRate: 9.4, banRate: 3.1, kda: 3.7, avgKills: 7.8, avgDeaths: 5.1, avgAssists: 11.2, dmgDealt: 27300, dmgTaken: 9800, pentaKills: 521, games: 24800, iconColor: '#9b59b6', position: '미드' },
  { id: 7, name: 'Ezreal', korName: '이즈리얼', tier: 'A', winRate: 52.1, pickRate: 13.2, banRate: 2.8, kda: 3.5, avgKills: 8.9, avgDeaths: 6.1, avgAssists: 8.4, dmgDealt: 25400, dmgTaken: 10200, pentaKills: 784, games: 34900, iconColor: '#3498db', position: '원딜' },
  { id: 8, name: 'Miss Fortune', korName: '미스 포츈', tier: 'A', winRate: 51.9, pickRate: 10.8, banRate: 3.4, kda: 3.6, avgKills: 9.4, avgDeaths: 6.2, avgAssists: 9.1, dmgDealt: 27800, dmgTaken: 11100, pentaKills: 1872, games: 28500, iconColor: '#e74c3c', position: '원딜' },
  { id: 9, name: 'Ashe', korName: '애쉬', tier: 'A', winRate: 51.4, pickRate: 8.7, banRate: 1.2, kda: 3.3, avgKills: 8.1, avgDeaths: 6.4, avgAssists: 11.8, dmgDealt: 22100, dmgTaken: 12400, pentaKills: 432, games: 23100, iconColor: '#74c0fc', position: '원딜' },
  { id: 10, name: 'Veigar', korName: '베이가', tier: 'A', winRate: 51.2, pickRate: 7.9, banRate: 2.1, kda: 3.4, avgKills: 7.6, avgDeaths: 5.4, avgAssists: 9.8, dmgDealt: 29800, dmgTaken: 9600, pentaKills: 634, games: 20900, iconColor: '#a29bfe', position: '미드' },
  { id: 11, name: 'Sona', korName: '소나', tier: 'B', winRate: 50.8, pickRate: 6.2, banRate: 1.8, kda: 4.8, avgKills: 3.8, avgDeaths: 3.9, avgAssists: 19.2, dmgDealt: 14200, dmgTaken: 8400, pentaKills: 12, games: 16400, iconColor: '#fd79a8', position: '서포터' },
  { id: 12, name: 'Brand', korName: '브랜드', tier: 'B', winRate: 50.4, pickRate: 8.1, banRate: 4.8, kda: 3.2, avgKills: 8.9, avgDeaths: 6.8, avgAssists: 11.4, dmgDealt: 26800, dmgTaken: 12800, pentaKills: 892, games: 21400, iconColor: '#e17055', position: '서포터' },
  { id: 13, name: 'Caitlyn', korName: '케이틀린', tier: 'B', winRate: 50.1, pickRate: 7.4, banRate: 2.3, kda: 3.1, avgKills: 8.2, avgDeaths: 6.5, avgAssists: 7.9, dmgDealt: 22400, dmgTaken: 10800, pentaKills: 543, games: 19600, iconColor: '#00b894', position: '원딜' },
  { id: 14, name: 'Yasuo', korName: '야스오', tier: 'B', winRate: 49.8, pickRate: 14.2, banRate: 28.4, kda: 2.9, avgKills: 9.8, avgDeaths: 8.4, avgAssists: 6.2, dmgDealt: 24100, dmgTaken: 18900, pentaKills: 1456, games: 37500, iconColor: '#55efc4', position: '미드' },
  { id: 15, name: 'Garen', korName: '가렌', tier: 'C', winRate: 48.9, pickRate: 5.8, banRate: 1.1, kda: 2.8, avgKills: 8.4, avgDeaths: 7.2, avgAssists: 5.8, dmgDealt: 21800, dmgTaken: 22400, pentaKills: 234, games: 15300, iconColor: '#fdcb6e', position: '탑' },
  { id: 16, name: 'Teemo', korName: '티모', tier: 'C', winRate: 48.2, pickRate: 6.4, banRate: 8.9, kda: 2.6, avgKills: 7.1, avgDeaths: 7.8, avgAssists: 6.4, dmgDealt: 19200, dmgTaken: 14200, pentaKills: 187, games: 16900, iconColor: '#b2bec3', position: '탑' },
  { id: 17, name: 'Tryndamere', korName: '트린다미어', tier: 'C', winRate: 47.8, pickRate: 4.2, banRate: 6.2, kda: 2.4, avgKills: 9.2, avgDeaths: 9.1, avgAssists: 4.2, dmgDealt: 23200, dmgTaken: 19800, pentaKills: 892, games: 11100, iconColor: '#d63031', position: '탑' },
  { id: 18, name: 'Amumu', korName: '아무무', tier: 'D', winRate: 46.4, pickRate: 3.8, banRate: 1.4, kda: 2.2, avgKills: 5.4, avgDeaths: 8.9, avgAssists: 14.2, dmgDealt: 16800, dmgTaken: 24100, pentaKills: 128, games: 10100, iconColor: '#6c5ce7', position: '정글' },
]

export const tierColors: Record<string, string> = {
  'S+': '#ff6b6b',
  'S': '#ffa94d',
  'A': '#ffd43b',
  'B': '#69db7c',
  'C': '#74c0fc',
  'D': '#a8a8b3',
}
