export interface Post {
  id: string
  title: string
  content: string
  category: string
  authorId: string
  authorNickname: string
  views: number
  likes: number
  dislikes: number
  images: string[]   // base64 data URLs
  createdAt: string
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  authorNickname: string
  content: string
  createdAt: string
}

const POSTS_KEY     = 'morelol_posts'
const COMMENTS_KEY  = 'morelol_comments'
const LIKES_KEY     = 'morelol_post_likes'    // { [postId]: userId[] }
const DISLIKES_KEY  = 'morelol_post_dislikes' // { [postId]: userId[] }

// ── Posts ──────────────────────────────────────────────

export function getPosts(): Post[] {
  return JSON.parse(localStorage.getItem(POSTS_KEY) || '[]')
}

export function getPostById(id: string): Post | null {
  return getPosts().find(p => p.id === id) ?? null
}

export function getPostsByUser(userId: string): Post[] {
  return getPosts().filter(p => p.authorId === userId)
}

export function savePosts(posts: Post[]) {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
}

export function addPost(post: Omit<Post, 'id' | 'views' | 'likes' | 'dislikes' | 'createdAt'>): Post {
  const posts = getPosts()
  const newPost: Post = {
    ...post,
    id: Date.now().toString(),
    views: 0,
    likes: 0,
    dislikes: 0,
    images: post.images ?? [],
    createdAt: new Date().toISOString(),
  }
  savePosts([newPost, ...posts])
  return newPost
}

export function updatePost(id: string, patch: Partial<Pick<Post, 'title' | 'content' | 'category' | 'images'>>): boolean {
  const posts = getPosts()
  const idx = posts.findIndex(p => p.id === id)
  if (idx === -1) return false
  posts[idx] = { ...posts[idx], ...patch }
  savePosts(posts)
  return true
}

export function deletePost(id: string): boolean {
  const posts = getPosts()
  const next = posts.filter(p => p.id !== id)
  if (next.length === posts.length) return false
  savePosts(next)
  // 관련 댓글도 삭제
  const all: Comment[] = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]')
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(all.filter(c => c.postId !== id)))
  return true
}

export function incrementViews(id: string) {
  const posts = getPosts()
  const idx = posts.findIndex(p => p.id === id)
  if (idx === -1) return
  posts[idx] = { ...posts[idx], views: posts[idx].views + 1 }
  savePosts(posts)
}

// ── Likes ──────────────────────────────────────────────

function getLikesMap(): Record<string, string[]> {
  return JSON.parse(localStorage.getItem(LIKES_KEY) || '{}')
}

export function isLikedByUser(postId: string, userId: string): boolean {
  return (getLikesMap()[postId] ?? []).includes(userId)
}

export function toggleLike(postId: string, userId: string): number {
  const posts   = getPosts()
  const map     = getLikesMap()
  const likers  = map[postId] ?? []
  const idx     = posts.findIndex(p => p.id === postId)
  if (idx === -1) return 0

  let next: number
  if (likers.includes(userId)) {
    map[postId]    = likers.filter(id => id !== userId)
    posts[idx]     = { ...posts[idx], likes: Math.max(0, posts[idx].likes - 1) }
    next           = posts[idx].likes
  } else {
    map[postId]    = [...likers, userId]
    posts[idx]     = { ...posts[idx], likes: posts[idx].likes + 1 }
    next           = posts[idx].likes
  }

  savePosts(posts)
  localStorage.setItem(LIKES_KEY, JSON.stringify(map))
  return next
}

// ── Dislikes ───────────────────────────────────────────

function getDislikesMap(): Record<string, string[]> {
  return JSON.parse(localStorage.getItem(DISLIKES_KEY) || '{}')
}

export function isDislikedByUser(postId: string, userId: string): boolean {
  return (getDislikesMap()[postId] ?? []).includes(userId)
}

export function toggleDislike(postId: string, userId: string): number {
  const posts    = getPosts()
  const map      = getDislikesMap()
  const dislikers = map[postId] ?? []
  const idx      = posts.findIndex(p => p.id === postId)
  if (idx === -1) return 0

  let next: number
  if (dislikers.includes(userId)) {
    map[postId]  = dislikers.filter(id => id !== userId)
    posts[idx]   = { ...posts[idx], dislikes: Math.max(0, (posts[idx].dislikes ?? 0) - 1) }
    next         = posts[idx].dislikes
  } else {
    map[postId]  = [...dislikers, userId]
    posts[idx]   = { ...posts[idx], dislikes: (posts[idx].dislikes ?? 0) + 1 }
    next         = posts[idx].dislikes
  }

  savePosts(posts)
  localStorage.setItem(DISLIKES_KEY, JSON.stringify(map))
  return next
}

// ── Comments ───────────────────────────────────────────

export function getComments(postId: string): Comment[] {
  const all: Comment[] = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]')
  return all.filter(c => c.postId === postId)
}

export function addComment(comment: Omit<Comment, 'id' | 'createdAt'>): Comment {
  const all: Comment[] = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]')
  const newComment: Comment = {
    ...comment,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(COMMENTS_KEY, JSON.stringify([...all, newComment]))
  return newComment
}

// ── Utils ──────────────────────────────────────────────

export function formatDate(iso: string): string {
  const d    = new Date(iso)
  const now  = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60)     return '방금 전'
  if (diff < 3600)   return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}시간 전`
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
