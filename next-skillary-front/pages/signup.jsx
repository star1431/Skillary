import { AppShell } from '@/creatorhub/components/layout/AppShell'
import { SignupPage } from '@/creatorhub/pages/SignupPage'

export default function Signup() {
  return <AppShell>{(navigate) => <SignupPage onNavigate={navigate} />}</AppShell>
}


