import { mockNotifications } from '@/creatorhub/utils/mockData'

export function listNotificationsForUser(userId) {
  if (!userId) return []
  return mockNotifications
    .filter((n) => n.userId === userId)
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getUnreadNotificationCount(userId) {
  if (!userId) return 0
  return mockNotifications.filter((n) => n.userId === userId && !n.isRead).length
}

export function markNotificationRead(notificationId) {
  const idx = mockNotifications.findIndex((n) => n.id === notificationId)
  if (idx === -1) return false
  mockNotifications[idx] = { ...mockNotifications[idx], isRead: true }
  return true
}

export function markAllNotificationsRead(userId) {
  if (!userId) return 0
  let changed = 0
  for (let i = 0; i < mockNotifications.length; i += 1) {
    const n = mockNotifications[i]
    if (n.userId === userId && !n.isRead) {
      mockNotifications[i] = { ...n, isRead: true }
      changed += 1
    }
  }
  return changed
}


