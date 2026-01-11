import { AppShell } from '@/creatorhub/components/layout/AppShell'
import { AdminPage } from '@/creatorhub/pages/AdminPage'

export default function Admin() {
  return <AppShell>{(navigate) => <AdminPage onNavigate={navigate} />}</AppShell>
}


