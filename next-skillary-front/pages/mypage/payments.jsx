import { AppShell } from '@/creatorhub/components/layout/AppShell'
import { MyPage } from '@/creatorhub/pages/MyPage'

export default function MyPayments() {
  return <AppShell>{(navigate) => <MyPage onNavigate={navigate} />}</AppShell>
}


