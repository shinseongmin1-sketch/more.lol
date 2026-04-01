import { getSession } from './auth'

const MAX = 5

function getKey(): string {
  const session = getSession()
  return `morelol_recent_${session ? session.id : 'guest'}`
}

export function getRecentSearches(): string[] {
  return JSON.parse(localStorage.getItem(getKey()) || '[]')
}

export function addRecentSearch(name: string): void {
  const key = getKey()
  const trimmed = name.trim()
  if (!trimmed) return
  const list = getRecentSearches().filter(s => s !== trimmed)
  list.unshift(trimmed)
  localStorage.setItem(key, JSON.stringify(list.slice(0, MAX)))
}

export function removeRecentSearch(name: string): void {
  const key = getKey()
  const list = getRecentSearches().filter(s => s !== name)
  localStorage.setItem(key, JSON.stringify(list))
}
