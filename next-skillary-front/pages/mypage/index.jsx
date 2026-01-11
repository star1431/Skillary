import { AppShell } from '@/creatorhub/components/layout/AppShell'
import { MyPage } from '@/creatorhub/pages/MyPage'

export default function MyPageIndex() {
  return <AppShell>{(navigate) => <MyPage onNavigate={navigate} />}</AppShell>
}


