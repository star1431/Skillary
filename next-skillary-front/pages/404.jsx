import { AppShell } from '@/creatorhub/components/layout/AppShell'
import { NotFoundPage } from '@/creatorhub/pages/NotFoundPage'

export default function NotFound() {
  return <AppShell>{(navigate) => <NotFoundPage onNavigate={navigate} />}</AppShell>
}


