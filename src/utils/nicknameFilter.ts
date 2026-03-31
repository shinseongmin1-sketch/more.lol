// 금지어 목록 — 음란/혐오/사회적 이슈
const BANNED_WORDS: string[] = [
  // ── 음란/성적 ──────────────────────────────
  '섹스', '섹쓰', '씹', '보지', '자지', '보X', '자X', '보ㅈ', '자ㅈ',
  '보지년', '보지놈', '자지년', '성기', '음경', '음부', '음핵', '항문',
  '야동', '야한', '포르노', '포르', '야사', '야설', '야움짤', '원나잇',
  '성관계', '성교', '성행위', '사정', '오르가즘', '페니스', '버자이나',
  '딸딸이', '딸치기', '자위', '수간', '수음', '강간', '윤간', '성폭행',
  'sex', 'porn', 'porno', 'fuck', 'fck', 'fucker', 'fucking', 'f*ck',
  'bitch', 'b1tch', 'pussy', 'dick', 'cock', 'penis', 'vagina', 'anal',
  'nude', 'naked', 'boobs', 'tits', 'rape', 'masturbat',

  // ── 욕설/혐오 ──────────────────────────────
  '씨발', '씨팔', '시발', '시팔', 'ㅅㅂ', 'ㅆㅂ', '씨바', '씨빨',
  '개새끼', '개색끼', '개색히', 'ㄱㅅㄲ', '새끼', '새키',
  '미친놈', '미친년', '미친새끼', 'ㅁㅊ', '존나', '존네', 'ㅈㄴ',
  '병신', '벙신', 'ㅂㅅ', '장애인', '찐따', '정신병자', '미치광이',
  '창녀', '창X', '갈보', '화냥년', '걸레년', '걸레',
  '꺼져', '닥쳐', '뒤져', '뒤지다', '죽어', '죽창',
  'ass', 'asshole', 'bastard', 'cunt', 'whore', 'slut', 'nigger', 'nigga',
  'faggot', 'retard', 'idiot', 'moron', 'shit', 'sh1t', 'shitty',

  // ── 인종/민족 혐오 ──────────────────────────
  '짱깨', '짱개', '쪽발이', '쪽바리', '왜놈', '빨갱이',
  '흑형', '흑인새끼', '동남아새끼', '혼혈', '혼혈아',

  // ── 정치/사회적 이슈 (특정 인물·단체 비하) ──
  '윤석열', '이재명', '박근혜', '문재인', '김정은', '히틀러', '스탈린',
  '나치', 'nazi', '파시스트', 'fascist', 'isis', '탈레반', '알카에다',
  '한총련', '전교조', '민주당새끼', '국민의힘새끼',

  // ── 자살·자해 조장 ──────────────────────────
  '자살해', '죽어라', '뒤져라', '목매달아', '손목그어',

  // ── 스팸/사칭 ───────────────────────────────
  'admin', 'administrator', 'root', 'superuser', 'system',
  '관리자', '운영자', '운영진', '스태프', '모더레이터',
  'morelol', 'more.lol', 'morelolstaff', 'morelol관리자',
]

// 정규화: 대소문자, 공백, 특수문자, 숫자→문자 치환 제거
function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[0@]/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[4]/g, 'a')
    .replace(/[5$]/g, 's')
    .replace(/[\s\-_.]/g, '')
}

const ADMIN_IDS = ['ssm1909']

export function checkNickname(nickname: string, userId?: string): { ok: boolean; reason?: string } {
  if (userId && ADMIN_IDS.includes(userId)) return { ok: true }

  const normalized = normalize(nickname)

  for (const word of BANNED_WORDS) {
    if (normalized.includes(normalize(word))) {
      return { ok: false, reason: '사용할 수 없는 단어가 포함된 닉네임입니다.' }
    }
  }

  return { ok: true }
}
