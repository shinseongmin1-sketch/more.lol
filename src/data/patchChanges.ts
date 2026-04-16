/**
 * 26.8 패치 변경 챔피언 목록
 * Data Dragon champId 기준
 */

export type PatchChangeType = 'buff' | 'nerf' | 'adjust'

export interface PatchChange {
  type: PatchChangeType
  label: string   // 드롭다운 표시 텍스트
  color: string   // 배지 색상
  bg: string      // 카드 배경 틴트
  border: string  // 카드 테두리
}

export const PATCH_META = {
  buff:   { label: '26.8 상향', color: '#16a34a', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.35)'  },
  nerf:   { label: '26.8 하향', color: '#dc2626', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.35)'  },
  adjust: { label: '26.8 조정', color: '#d97706', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.35)' },
} satisfies Record<PatchChangeType, Omit<PatchChange, 'type'>>

/** 26.8 패치 변경 챔피언 (champId → 변경 타입) */
export const PATCH_268: Record<string, PatchChangeType> = {
  // ── 상향 ──
  Hwei:    'buff',
  Lillia:  'buff',
  Lucian:  'buff',
  Yuumi:   'buff',

  // ── 하향 ──
  DrMundo:   'nerf',
  Karma:     'nerf',
  Mel:       'nerf',
  TahmKench: 'nerf',

  // ── 조정 ──
  Zilean: 'adjust',
  Zyra:   'adjust',
}

export function getPatchChange(champId: string): (PatchChange & { type: PatchChangeType }) | null {
  const type = PATCH_268[champId]
  if (!type) return null
  return { type, ...PATCH_META[type] }
}
