interface LogoProps {
  size?: number
  id?: string
}

export default function Logo({ size = 32, id = 'logo' }: LogoProps) {
  const gId = `${id}-g`
  const sId = `${id}-s`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, display: 'block' }}
    >
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id={sId} x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 배경 */}
      <rect width="40" height="40" rx="11" fill={`url(#${gId})`} />
      {/* 상단 글래스 하이라이트 */}
      <rect width="40" height="22" rx="11" fill={`url(#${sId})`} />

      {/* M 레터 */}
      <path
        d="M9 27V13L20 21L31 13V27"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 하단 그래프 바 3개 — 상승 추세 */}
      <rect x="9"  y="30" width="4" height="3" rx="1.5" fill="white" fillOpacity="0.55" />
      <rect x="18" y="29" width="4" height="4" rx="1.5" fill="white" fillOpacity="0.75" />
      <rect x="27" y="28" width="4" height="5" rx="1.5" fill="white" fillOpacity="0.95" />
    </svg>
  )
}
