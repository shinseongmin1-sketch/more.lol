export interface Inquiry {
  id: string
  name: string
  email: string
  type: string
  content: string
  createdAt: string
}

const KEY = 'morelol_inquiries'

export function getInquiries(): Inquiry[] {
  return JSON.parse(localStorage.getItem(KEY) || '[]')
}

export function addInquiry(data: Omit<Inquiry, 'id' | 'createdAt'>): Inquiry {
  const all = getInquiries()
  const item: Inquiry = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() }
  localStorage.setItem(KEY, JSON.stringify([item, ...all]))
  return item
}

export function deleteInquiry(id: string) {
  const all = getInquiries().filter(i => i.id !== id)
  localStorage.setItem(KEY, JSON.stringify(all))
}
