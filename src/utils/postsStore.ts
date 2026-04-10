const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

function h() {
  return {
    'Content-Type': 'application/json',
    apikey:        SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  }
}

export interface Post {
  id:              string
  title:           string
  content:         string
  category:        string
  authorId:        string
  authorNickname:  string
  views:           number
  likes:           number
  dislikes:        number
  images:          string[]
  createdAt:       string
}

export interface Comment {
  id:              string
  postId:          string
  authorId:        string
  authorNickname:  string
  content:         string
  createdAt:       string
}

interface DbPost {
  id:               string
  title:            string
  content?:         string
  category:         string
  author_id:        string
  author_nickname:  string
  views:            number
  likes:            number
  dislikes:         number
  images?:          string[]
  created_at:       string
}

interface DbComment {
  id:               string
  post_id:          string
  author_id:        string
  author_nickname:  string
  content:          string
  created_at:       string
}

function toPost(r: DbPost): Post {
  return {
    id:             r.id,
    title:          r.title,
    content:        r.content ?? '',
    category:       r.category,
    authorId:       r.author_id,
    authorNickname: r.author_nickname,
    views:          r.views,
    likes:          r.likes,
    dislikes:       r.dislikes,
    images:         r.images ?? [],
    createdAt:      r.created_at,
  }
}

function toComment(r: DbComment): Comment {
  return {
    id:             r.id,
    postId:         r.post_id,
    authorId:       r.author_id,
    authorNickname: r.author_nickname,
    content:        r.content,
    createdAt:      r.created_at,
  }
}

// ── Posts ──────────────────────────────────────────────

/** 목록용 (images 제외) */
export async function getPosts(): Promise<Post[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return []
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/community_posts` +
    `?select=id,title,category,author_id,author_nickname,views,likes,dislikes,created_at` +
    `&order=created_at.desc`,
    { headers: h() }
  ).catch(() => null)
  if (!res?.ok) return []
  const data: DbPost[] = await res.json()
  return data.map(r => toPost(r))
}

export async function getPostById(id: string): Promise<Post | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/community_posts?id=eq.${encodeURIComponent(id)}&limit=1`,
    { headers: h() }
  ).catch(() => null)
  if (!res?.ok) return null
  const [row]: DbPost[] = await res.json()
  return row ? toPost(row) : null
}

export async function getPostsByUser(userId: string): Promise<Post[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return []
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/community_posts` +
    `?author_id=eq.${encodeURIComponent(userId)}` +
    `&select=id,title,category,author_id,author_nickname,views,likes,dislikes,created_at` +
    `&order=created_at.desc`,
    { headers: h() }
  ).catch(() => null)
  if (!res?.ok) return []
  const data: DbPost[] = await res.json()
  return data.map(r => toPost(r))
}

export async function addPost(
  post: Omit<Post, 'id' | 'views' | 'likes' | 'dislikes' | 'createdAt'>
): Promise<Post | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null
  const row = {
    id:              Date.now().toString(),
    title:           post.title,
    content:         post.content,
    category:        post.category,
    author_id:       post.authorId,
    author_nickname: post.authorNickname,
    views:           0,
    likes:           0,
    dislikes:        0,
    images:          post.images ?? [],
    created_at:      new Date().toISOString(),
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/community_posts`, {
    method:  'POST',
    headers: { ...h(), Prefer: 'return=minimal' },
    body:    JSON.stringify(row),
  }).catch(() => null)
  if (!res?.ok) return null
  return toPost(row)
}

export async function updatePost(
  id: string,
  patch: Partial<Pick<Post, 'title' | 'content' | 'category' | 'images'>>
): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false
  const dbPatch: Record<string, unknown> = {}
  if (patch.title    !== undefined) dbPatch.title    = patch.title
  if (patch.content  !== undefined) dbPatch.content  = patch.content
  if (patch.category !== undefined) dbPatch.category = patch.category
  if (patch.images   !== undefined) dbPatch.images   = patch.images
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/community_posts?id=eq.${encodeURIComponent(id)}`,
    { method: 'PATCH', headers: { ...h(), Prefer: 'return=minimal' }, body: JSON.stringify(dbPatch) }
  ).catch(() => null)
  return !!(res?.ok)
}

export async function deletePost(id: string): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/community_posts?id=eq.${encodeURIComponent(id)}`,
    { method: 'DELETE', headers: h() }
  ).catch(() => null)
  return !!(res?.ok)
}

export async function incrementViews(id: string): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return
  await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_post_views`, {
    method:  'POST',
    headers: h(),
    body:    JSON.stringify({ post_id: id }),
  }).catch(() => {})
}

// ── Reactions ──────────────────────────────────────────

export async function isLikedByUser(postId: string, userId: string): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/community_post_reactions` +
    `?post_id=eq.${encodeURIComponent(postId)}&user_id=eq.${encodeURIComponent(userId)}&type=eq.like&limit=1`,
    { headers: h() }
  ).catch(() => null)
  if (!res?.ok) return false
  return (await res.json()).length > 0
}

export async function isDislikedByUser(postId: string, userId: string): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/community_post_reactions` +
    `?post_id=eq.${encodeURIComponent(postId)}&user_id=eq.${encodeURIComponent(userId)}&type=eq.dislike&limit=1`,
    { headers: h() }
  ).catch(() => null)
  if (!res?.ok) return false
  return (await res.json()).length > 0
}

export async function toggleLike(postId: string, userId: string): Promise<number> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return 0
  const [liked, post] = await Promise.all([isLikedByUser(postId, userId), getPostById(postId)])
  if (!post) return 0
  const base = SUPABASE_URL

  if (liked) {
    await fetch(
      `${base}/rest/v1/community_post_reactions?post_id=eq.${encodeURIComponent(postId)}&user_id=eq.${encodeURIComponent(userId)}&type=eq.like`,
      { method: 'DELETE', headers: h() }
    ).catch(() => {})
    const next = Math.max(0, post.likes - 1)
    await fetch(`${base}/rest/v1/community_posts?id=eq.${encodeURIComponent(postId)}`,
      { method: 'PATCH', headers: { ...h(), Prefer: 'return=minimal' }, body: JSON.stringify({ likes: next }) }
    ).catch(() => {})
    return next
  } else {
    await fetch(`${base}/rest/v1/community_post_reactions`, {
      method:  'POST',
      headers: { ...h(), Prefer: 'return=minimal' },
      body:    JSON.stringify({ post_id: postId, user_id: userId, type: 'like' }),
    }).catch(() => {})
    const next = post.likes + 1
    await fetch(`${base}/rest/v1/community_posts?id=eq.${encodeURIComponent(postId)}`,
      { method: 'PATCH', headers: { ...h(), Prefer: 'return=minimal' }, body: JSON.stringify({ likes: next }) }
    ).catch(() => {})
    return next
  }
}

export async function toggleDislike(postId: string, userId: string): Promise<number> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return 0
  const [disliked, post] = await Promise.all([isDislikedByUser(postId, userId), getPostById(postId)])
  if (!post) return 0
  const base = SUPABASE_URL

  if (disliked) {
    await fetch(
      `${base}/rest/v1/community_post_reactions?post_id=eq.${encodeURIComponent(postId)}&user_id=eq.${encodeURIComponent(userId)}&type=eq.dislike`,
      { method: 'DELETE', headers: h() }
    ).catch(() => {})
    const next = Math.max(0, (post.dislikes ?? 0) - 1)
    await fetch(`${base}/rest/v1/community_posts?id=eq.${encodeURIComponent(postId)}`,
      { method: 'PATCH', headers: { ...h(), Prefer: 'return=minimal' }, body: JSON.stringify({ dislikes: next }) }
    ).catch(() => {})
    return next
  } else {
    await fetch(`${base}/rest/v1/community_post_reactions`, {
      method:  'POST',
      headers: { ...h(), Prefer: 'return=minimal' },
      body:    JSON.stringify({ post_id: postId, user_id: userId, type: 'dislike' }),
    }).catch(() => {})
    const next = (post.dislikes ?? 0) + 1
    await fetch(`${base}/rest/v1/community_posts?id=eq.${encodeURIComponent(postId)}`,
      { method: 'PATCH', headers: { ...h(), Prefer: 'return=minimal' }, body: JSON.stringify({ dislikes: next }) }
    ).catch(() => {})
    return next
  }
}

// ── Comments ───────────────────────────────────────────

export async function getComments(postId: string): Promise<Comment[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return []
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/community_comments?post_id=eq.${encodeURIComponent(postId)}&order=created_at.asc`,
    { headers: h() }
  ).catch(() => null)
  if (!res?.ok) return []
  const data: DbComment[] = await res.json()
  return data.map(toComment)
}

export async function addComment(
  comment: Omit<Comment, 'id' | 'createdAt'>
): Promise<Comment | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null
  const row = {
    id:               Date.now().toString(),
    post_id:          comment.postId,
    author_id:        comment.authorId,
    author_nickname:  comment.authorNickname,
    content:          comment.content,
    created_at:       new Date().toISOString(),
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/community_comments`, {
    method:  'POST',
    headers: { ...h(), Prefer: 'return=minimal' },
    body:    JSON.stringify(row),
  }).catch(() => null)
  if (!res?.ok) return null
  return toComment(row)
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
