const key = (userId: string) => `avatar_${userId}`

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
