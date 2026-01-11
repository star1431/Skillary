import { AppShell } from '@/creatorhub/components/layout/AppShell'
import { LoginPage } from '@/creatorhub/pages/LoginPage'

export default function Login() {
  return <AppShell>{(navigate) => <LoginPage onNavigate={navigate} />}</AppShell>
}


