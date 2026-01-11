import { AppShell } from '@/creatorhub/components/layout/AppShell'
import { CreatorsListPage } from '@/creatorhub/pages/CreatorsListPage'

export default function Creators() {
  return <AppShell>{(navigate) => <CreatorsListPage onNavigate={navigate} />}</AppShell>
}


