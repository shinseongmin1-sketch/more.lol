/**
 * 챔피언별 주 포지션 오버라이드
 *
 * getRoleFromTags() 태그 기반 자동 판별의 구조적 오류를 수동으로 보정
 *
 * 주요 오류 원인:
 *  1) Mage 체크 > Support 체크 순서 → Support+Mage 챔프가 미드로 오판 (나미, 소나, 잔나 등)
 *  2) Tank+Fighter → fighter fallback → 서포터가 탑으로 오판 (노틸러스, 블리츠, 레오나 등)
 *  3) Assassin+Fighter → fighter fallback → 미드/정글이 탑으로 오판 (제드, 야스오, 리신 등)
 *  4) Marksman 태그 우선 체크 → 정글/탑이 원딜로 오판 (그레이브즈, 티모 등)
 */
export const CHAMP_POSITION_OVERRIDE: Record<string, string> = {

  // ══════════════════════════════════════════════
  // 정글
  // ══════════════════════════════════════════════

  // Marksman 태그지만 정글 주포지션
  Graves:       '정글',
  Kindred:      '정글',

  // Fighter 태그지만 정글 주포지션 (fallback이 탑으로 오판)
  LeeSin:       '정글',
  Kayn:         '정글',
  Hecarim:      '정글',
  Vi:           '정글',
  JarvanIV:     '정글',
  Warwick:      '정글',
  Udyr:         '정글',
  RekSai:       '정글',
  Nocturne:     '정글',
  Belveth:      '정글',
  Briar:        '정글',
  Viego:        '정글',
  XinZhao:      '정글',
  MasterYi:     '정글',
  MonkeyKing:   '정글', // Wukong (Data Dragon ID)
  Volibear:     '정글',
  Skarner:      '정글',
  Trundle:      '정글',
  Naafiri:      '정글',
  Ekko:         '정글',
  Diana:        '정글',
  Elise:        '정글',
  Gragas:       '정글',
  Lillia:       '정글',

  // Assassin+Fighter → fighter fallback이 탑으로 오판
  Khazix:       '정글',
  Rengar:       '정글',

  // Assassin만 있어서 미드로 오판
  Shaco:        '정글',

  // Assassin+Mage → Assassin 체크가 미드로 오판
  Evelynn:      '정글',
  Nidalee:      '정글',

  // Tank 태그지만 정글 주포지션
  Amumu:        '정글',
  Sejuani:      '정글',
  Rammus:       '정글',
  Nunu:         '정글',
  Zac:          '정글',

  // Mage 태그지만 정글 주포지션
  Fiddlesticks: '정글',
  Karthus:      '정글',
  Taliyah:      '정글',

  // Support 태그지만 정글 주포지션
  Ivern:        '정글',


  // ══════════════════════════════════════════════
  // 미드
  // ══════════════════════════════════════════════

  // Mage+Tank → fighter/tank fallback이 탑으로 오판
  Galio:        '미드',

  // Assassin+Fighter → fighter fallback이 탑으로 오판
  Zed:          '미드',
  Talon:        '미드',
  Qiyana:       '미드',
  Akali:        '미드',
  Yasuo:        '미드',
  Yone:         '미드',
  Fizz:         '미드',

  // Mage+Fighter → fighter fallback이 탑으로 오판
  Sylas:        '미드',
  Ryze:         '미드',

  // Marksman+Mage → Marksman 체크가 원딜로 오판
  Corki:        '미드',


  // ══════════════════════════════════════════════
  // 탑
  // ══════════════════════════════════════════════

  // Marksman(+Assassin) 태그지만 탑 주포지션
  Teemo:        '탑',
  Quinn:        '탑',


  // ══════════════════════════════════════════════
  // 서포터
  // ══════════════════════════════════════════════

  // Support+Mage → Mage 체크가 먼저 적용되어 미드로 오판
  Nami:         '서포터',
  Soraka:       '서포터',
  Janna:        '서포터',
  Lulu:         '서포터',
  Sona:         '서포터',
  Karma:        '서포터',
  Morgana:      '서포터',
  Zilean:       '서포터',
  Lux:          '서포터',

  // Tank+Fighter → fighter fallback이 탑으로 오판
  Nautilus:     '서포터',
  Blitzcrank:   '서포터',
  Leona:        '서포터',
  Alistar:      '서포터',
  Rell:         '서포터',

  // Support+Tank → Tank 체크가 먼저 적용되어 탑으로 오판
  Braum:        '서포터',
  TahmKench:    '서포터',

  // Assassin(+Support) → Assassin 체크가 미드로 오판
  Pyke:         '서포터',

  // Support+Fighter → fighter fallback이 탑으로 오판
  Taric:        '서포터',

  // Mage 태그지만 서포터 주포지션 (Support 태그 없는 경우)
  Brand:        '서포터',
  Zyra:         '서포터',
  VelKoz:       '서포터',
  Swain:        '서포터',
  Hwei:         '서포터',
  Xerath:       '서포터',
  Seraphine:    '서포터',

  // Marksman+Support → Marksman 체크가 원딜로 오판
  Senna:        '서포터',
}

/**
 * 챔피언의 주 포지션 반환
 * - 오버라이드 맵에 있으면 우선 사용
 * - 없으면 태그 기반 자동 판별로 fallback
 */
export function getMainPosition(
  champId: string,
  tagBasedPosition: string,
): string {
  return CHAMP_POSITION_OVERRIDE[champId] ?? tagBasedPosition
}
