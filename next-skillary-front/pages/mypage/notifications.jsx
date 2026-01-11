import { AppShell } from '@/creatorhub/components/layout/AppShell'
import { NotificationsPage } from '@/creatorhub/pages/NotificationsPage'

export default function MyNotifications() {
  return <AppShell>{(navigate) => <NotificationsPage onNavigate={navigate} />}</AppShell>
}


