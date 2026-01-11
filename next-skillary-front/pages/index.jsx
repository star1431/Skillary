import { AppShell } from '@/creatorhub/components/layout/AppShell'
import { HomePage } from '@/creatorhub/pages/HomePage'

export default function IndexPage() {
  return <AppShell>{(navigate) => <HomePage onNavigate={navigate} />}</AppShell>
}


