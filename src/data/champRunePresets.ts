import type { RunePreset } from './garenBuild'
import type { RoleName } from './buildTemplates'

const S = { adaptive: 5008, atkSpd: 5005, abilHaste: 5007, armor: 5002, magicRes: 5003, health: 5001 }

export const ROLE_PRESETS: Record<RoleName, RunePreset[]> = {

  fighter: [
    { name: '정복자',   keystoneId: 8010, primaryTreeId: 8000, secondaryTreeId: 8400,
      selectedRunes: new Set([8010, 9111, 9104, 8299, 8473, 8242]), statShardSelected: [S.adaptive, S.armor, S.health] },
    { name: '철갑 수호', keystoneId: 8437, primaryTreeId: 8400, secondaryTreeId: 8000,
      selectedRunes: new Set([8437, 8446, 8473, 8451, 9111, 8299]), statShardSelected: [S.adaptive, S.armor, S.health] },
    { name: '집중 공격', keystoneId: 8008, primaryTreeId: 8000, secondaryTreeId: 8400,
      selectedRunes: new Set([8008, 9101, 9104, 8014, 8446, 8451]), statShardSelected: [S.adaptive, S.armor, S.health] },
  ],

  tank: [
    { name: '철갑 수호', keystoneId: 8437, primaryTreeId: 8400, secondaryTreeId: 8000,
      selectedRunes: new Set([8437, 8446, 8444, 8451, 9111, 9104]), statShardSelected: [S.abilHaste, S.armor, S.health] },
    { name: '여진',     keystoneId: 8439, primaryTreeId: 8400, secondaryTreeId: 8300,
      selectedRunes: new Set([8439, 8463, 8473, 9927, 8345, 8347]), statShardSelected: [S.abilHaste, S.armor, S.health] },
    { name: '정복자',   keystoneId: 8010, primaryTreeId: 8000, secondaryTreeId: 8400,
      selectedRunes: new Set([8010, 9111, 9104, 8299, 8473, 8451]), statShardSelected: [S.adaptive, S.armor, S.health] },
  ],

  mage: [
    { name: '비전 혜성', keystoneId: 8229, primaryTreeId: 8200, secondaryTreeId: 8300,
      selectedRunes: new Set([8229, 8226, 8210, 8237, 8345, 8347]), statShardSelected: [S.adaptive, S.adaptive, S.health] },
    { name: '서약의 정령', keystoneId: 8214, primaryTreeId: 8200, secondaryTreeId: 8300,
      selectedRunes: new Set([8214, 8226, 8210, 8237, 8345, 8347]), statShardSelected: [S.adaptive, S.adaptive, S.health] },
    { name: '선빵 필살', keystoneId: 8369, primaryTreeId: 8300, secondaryTreeId: 8200,
      selectedRunes: new Set([8369, 8304, 8347, 8345, 8210, 8236]), statShardSelected: [S.adaptive, S.adaptive, S.health] },
  ],

  assassin: [
    { name: '감전',       keystoneId: 8112, primaryTreeId: 8100, secondaryTreeId: 8000,
      selectedRunes: new Set([8112, 8143, 8135, 8105, 9111, 9104]), statShardSelected: [S.adaptive, S.adaptive, S.health] },
    { name: '어둠의 수확', keystoneId: 8128, primaryTreeId: 8100, secondaryTreeId: 8200,
      selectedRunes: new Set([8128, 8143, 8135, 8105, 8210, 8237]), statShardSelected: [S.adaptive, S.adaptive, S.health] },
    { name: '칼날비',     keystoneId: 9923, primaryTreeId: 8100, secondaryTreeId: 8000,
      selectedRunes: new Set([9923, 8139, 8135, 8105, 9111, 8014]), statShardSelected: [S.atkSpd, S.adaptive, S.health] },
  ],

  marksman: [
    { name: '치명적 속도', keystoneId: 8005, primaryTreeId: 8000, secondaryTreeId: 8100,
      selectedRunes: new Set([8005, 9111, 9104, 8014, 8126, 8135]), statShardSelected: [S.atkSpd, S.adaptive, S.health] },
    { name: '집중 공격', keystoneId: 8008, primaryTreeId: 8000, secondaryTreeId: 8200,
      selectedRunes: new Set([8008, 9101, 9104, 8014, 8233, 8236]), statShardSelected: [S.atkSpd, S.adaptive, S.health] },
    { name: '함대 발놀림', keystoneId: 8021, primaryTreeId: 8000, secondaryTreeId: 8100,
      selectedRunes: new Set([8021, 9101, 9103, 8014, 8139, 8135]), statShardSelected: [S.atkSpd, S.adaptive, S.health] },
  ],

  supportEnchant: [
    { name: '서약의 정령', keystoneId: 8214, primaryTreeId: 8200, secondaryTreeId: 8300,
      selectedRunes: new Set([8214, 8226, 8210, 8237, 8345, 8347]), statShardSelected: [S.abilHaste, S.adaptive, S.health] },
    { name: '비전 혜성', keystoneId: 8229, primaryTreeId: 8200, secondaryTreeId: 8300,
      selectedRunes: new Set([8229, 8226, 8210, 8237, 8345, 8347]), statShardSelected: [S.abilHaste, S.adaptive, S.health] },
    { name: '빙결 강화', keystoneId: 8351, primaryTreeId: 8300, secondaryTreeId: 8200,
      selectedRunes: new Set([8351, 8304, 8347, 8345, 8210, 8234]), statShardSelected: [S.abilHaste, S.adaptive, S.health] },
  ],

  supportTank: [
    { name: '여진',     keystoneId: 8439, primaryTreeId: 8400, secondaryTreeId: 8300,
      selectedRunes: new Set([8439, 8463, 8473, 9927, 8345, 8347]), statShardSelected: [S.abilHaste, S.armor, S.health] },
    { name: '수호자',   keystoneId: 8465, primaryTreeId: 8400, secondaryTreeId: 8300,
      selectedRunes: new Set([8465, 8446, 8473, 9927, 8345, 8347]), statShardSelected: [S.abilHaste, S.armor, S.health] },
    { name: '철갑 수호', keystoneId: 8437, primaryTreeId: 8400, secondaryTreeId: 8000,
      selectedRunes: new Set([8437, 8446, 8473, 8451, 9111, 8299]), statShardSelected: [S.abilHaste, S.armor, S.health] },
  ],

  jungler: [
    { name: '정복자',     keystoneId: 8010, primaryTreeId: 8000, secondaryTreeId: 8400,
      selectedRunes: new Set([8010, 9111, 9104, 8299, 8473, 8451]), statShardSelected: [S.adaptive, S.armor, S.health] },
    { name: '감전',       keystoneId: 8112, primaryTreeId: 8100, secondaryTreeId: 8000,
      selectedRunes: new Set([8112, 8143, 8135, 8105, 9111, 9104]), statShardSelected: [S.adaptive, S.adaptive, S.health] },
    { name: '어둠의 수확', keystoneId: 8128, primaryTreeId: 8100, secondaryTreeId: 8000,
      selectedRunes: new Set([8128, 8143, 8135, 8105, 9111, 8014]), statShardSelected: [S.adaptive, S.adaptive, S.health] },
  ],
}

export const ROLE_SUMMONERS: Record<RoleName, { id: string; name: string }[]> = {
  fighter:        [{ id: 'SummonerTeleport', name: '순간이동' }, { id: 'SummonerFlash', name: '점멸' }],
  tank:           [{ id: 'SummonerTeleport', name: '순간이동' }, { id: 'SummonerFlash', name: '점멸' }],
  mage:           [{ id: 'SummonerDot',      name: '점화' },    { id: 'SummonerFlash', name: '점멸' }],
  assassin:       [{ id: 'SummonerDot',      name: '점화' },    { id: 'SummonerFlash', name: '점멸' }],
  marksman:       [{ id: 'SummonerHeal',     name: '회복' },    { id: 'SummonerFlash', name: '점멸' }],
  supportEnchant: [{ id: 'SummonerExhaust',  name: '탈진' },    { id: 'SummonerFlash', name: '점멸' }],
  supportTank:    [{ id: 'SummonerExhaust',  name: '탈진' },    { id: 'SummonerFlash', name: '점멸' }],
  jungler:        [{ id: 'SummonerSmite',    name: '강타' },    { id: 'SummonerFlash', name: '점멸' }],
}

export const ROLE_POSITION: Record<RoleName, string> = {
  fighter: '탑', tank: '탑', mage: '미드', assassin: '미드',
  marksman: '원딜', supportEnchant: '서포터', supportTank: '서포터',
  jungler: '정글',
}
