const key = (userId: string) => `avatar_${userId}`

// more.lol 사이트 전용 마스코트 아이콘 (귀여운 왕관 캐릭터)
const MASCOT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <radialGradient id="bg" cx="40%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#b197fc"/>
      <stop offset="100%" stop-color="#3d2a8a"/>
    </radialGradient>
    <linearGradient id="face" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffe4cc"/>
      <stop offset="100%" stop-color="#ffd0a8"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="60" fill="url(#bg)"/>
  <circle cx="18" cy="24" r="2" fill="white" opacity="0.65"/>
  <circle cx="99" cy="19" r="1.4" fill="white" opacity="0.5"/>
  <circle cx="13" cy="76" r="1.6" fill="white" opacity="0.4"/>
  <circle cx="106" cy="82" r="2" fill="white" opacity="0.45"/>
  <circle cx="95" cy="95" r="1.2" fill="white" opacity="0.35"/>
  <circle cx="22" cy="93" r="1.4" fill="white" opacity="0.4"/>
  <path d="M33 55 L41 67 L60 56 L79 67 L87 55 L81 64 L39 64 Z" fill="#FFD700"/>
  <path d="M41 61 Q60 55 79 61" stroke="rgba(255,255,255,0.38)" stroke-width="1.8" fill="none"/>
  <circle cx="60" cy="53" r="4.5" fill="#FF85C0"/>
  <circle cx="36" cy="51" r="3.2" fill="#FF85C0"/>
  <circle cx="84" cy="51" r="3.2" fill="#FF85C0"/>
  <circle cx="60" cy="53" r="2" fill="#ff4fa3"/>
  <circle cx="36" cy="51" r="1.3" fill="#ff4fa3"/>
  <circle cx="84" cy="51" r="1.3" fill="#ff4fa3"/>
  <circle cx="60" cy="79" r="25" fill="url(#face)"/>
  <ellipse cx="50.5" cy="76" rx="6.2" ry="6.8" fill="#1a0d4e"/>
  <ellipse cx="48.2" cy="73.2" rx="2.6" ry="2.8" fill="white"/>
  <circle cx="53.8" cy="77.8" r="1.3" fill="white" opacity="0.55"/>
  <ellipse cx="69.5" cy="76" rx="6.2" ry="6.8" fill="#1a0d4e"/>
  <ellipse cx="67.2" cy="73.2" rx="2.6" ry="2.8" fill="white"/>
  <circle cx="72.8" cy="77.8" r="1.3" fill="white" opacity="0.55"/>
  <path d="M51 85.5 Q60 94.5 69 85.5" stroke="#1a0d4e" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <ellipse cx="43" cy="84" rx="7" ry="4.2" fill="#ffaec9" opacity="0.48"/>
  <ellipse cx="77" cy="84" rx="7" ry="4.2" fill="#ffaec9" opacity="0.48"/>
  <path d="M104 10 L105.8 15.5 L111.5 15.5 L107 18.8 L108.8 24.3 L104 21 L99.2 24.3 L101 18.8 L96.5 15.5 L102.2 15.5 Z" fill="#FFD700" opacity="0.75" transform="scale(0.55) translate(85, 5)"/>
  <path d="M104 10 L105.8 15.5 L111.5 15.5 L107 18.8 L108.8 24.3 L104 21 L99.2 24.3 L101 18.8 L96.5 15.5 L102.2 15.5 Z" fill="#FFD700" opacity="0.6" transform="scale(0.42) translate(-15, 100)"/>
</svg>`

export const SITE_MASCOT_AVATAR = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(MASCOT_SVG)}`

export function isSiteMascotAvatar(dataUrl: string | null): boolean {
  return dataUrl === SITE_MASCOT_AVATAR
}

export function getAvatar(userId: string): string | null {
  return localStorage.getItem(key(userId))
}

export function saveAvatar(userId: string, dataUrl: string): void {
  localStorage.setItem(key(userId), dataUrl)
}

export function removeAvatar(userId: string): void {
  localStorage.removeItem(key(userId))
}

// 이미지 파일 → 정사각형 크롭 후 base64
export function resizeToSquare(file: File, size = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = ev => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width  = size
        canvas.height = size
        const ctx = canvas.getContext('2d')!
        const min = Math.min(img.width, img.height)
        const sx  = (img.width  - min) / 2
        const sy  = (img.height - min) / 2
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.88))
      }
      img.src = ev.target!.result as string
    }
    reader.readAsDataURL(file)
  })
}
