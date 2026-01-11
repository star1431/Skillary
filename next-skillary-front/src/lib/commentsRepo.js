const STORAGE_KEY = 'skillary:comments:v1'
export const COMMENTS_CHANGED_EVENT = 'skillary:comments-changed'

/**
 * @typedef {Object} Comment
 * @property {string} id
 * @property {string} contentId
 * @property {string} userId
 * @property {string} authorName
 * @property {string} body
 * @property {string} createdAt
 * @property {string|null} [parentId]
 * @property {string[]} [likedByUserIds]
 */

/** @type {Comment[]} */
let memoryStore = []

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function normalizeComment(raw) {
  if (!raw || typeof raw !== 'object') return null
  const c = /** @type {any} */ (raw)
  if (!c.id || !c.contentId || !c.userId || !c.body || !c.createdAt) return null
  return {
    id: String(c.id),
    contentId: String(c.contentId),
    userId: String(c.userId),
    authorName: (c.authorName ? String(c.authorName) : '익명').trim() || '익명',
    body: String(c.body),
    createdAt: String(c.createdAt),
    parentId: c.parentId == null ? null : String(c.parentId),
    likedByUserIds: Array.isArray(c.likedByUserIds)
      ? c.likedByUserIds.map((x) => String(x))
      : [],
  }
}

function readAll() {
  if (!canUseLocalStorage()) return memoryStore.slice()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeComment).filter(Boolean)
  } catch {
    return []
  }
}

function writeAll(next) {
  if (!canUseLocalStorage()) {
    memoryStore = next.slice()
    return
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    // 같은 탭에서는 storage 이벤트가 안 떠서 커스텀 이벤트로 UI 갱신 트리거
    window.dispatchEvent(new Event(COMMENTS_CHANGED_EVENT))
  } catch {
    // ignore
  }
}

export function subscribeCommentsChanged(handler) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(COMMENTS_CHANGED_EVENT, handler)
  return () => window.removeEventListener(COMMENTS_CHANGED_EVENT, handler)
}

export function listCommentsByContent(contentId, { order = 'asc' } = {}) {
  if (!contentId) return []
  const dir = order === 'desc' ? -1 : 1
  return readAll()
    .filter((c) => c && c.contentId === contentId)
    .sort((a, b) => (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir)
}

export function getCommentCountByContent(contentId) {
  if (!contentId) return 0
  return readAll().filter((c) => c && c.contentId === contentId).length
}

export function addComment({ contentId, userId, authorName, body, parentId = null }) {
  const trimmed = (body || '').trim()
  if (!contentId || !userId || !trimmed) return null

  const comment = {
    id: `comment-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    contentId,
    userId,
    authorName: (authorName || '익명').trim() || '익명',
    body: trimmed,
    createdAt: new Date().toISOString(),
    parentId: parentId ? String(parentId) : null,
    likedByUserIds: [],
  }

  const all = readAll()
  const next = [...all, comment]
  writeAll(next)
  return comment
}

export function deleteComment(commentId) {
  if (!commentId) return false
  const all = readAll()
  // 부모 삭제 시 답글도 함께 삭제(중첩 답글까지)
  const toDelete = new Set([commentId])
  let changed = true
  while (changed) {
    changed = false
    for (const c of all) {
      if (c?.parentId && toDelete.has(c.parentId) && !toDelete.has(c.id)) {
        toDelete.add(c.id)
        changed = true
      }
    }
  }

  const next = all.filter((c) => c && !toDelete.has(c.id))
  writeAll(next)
  return next.length !== all.length
}

export function toggleCommentLike(commentId, userId) {
  if (!commentId || !userId) return { ok: false, liked: false }
  const all = readAll()
  const idx = all.findIndex((c) => c && c.id === commentId)
  if (idx < 0) return { ok: false, liked: false }

  const c = all[idx]
  const set = new Set(Array.isArray(c.likedByUserIds) ? c.likedByUserIds : [])
  let liked
  if (set.has(userId)) {
    set.delete(userId)
    liked = false
  } else {
    set.add(userId)
    liked = true
  }
  const updated = { ...c, likedByUserIds: Array.from(set) }
  const next = all.slice()
  next[idx] = updated
  writeAll(next)
  return { ok: true, liked }
}


