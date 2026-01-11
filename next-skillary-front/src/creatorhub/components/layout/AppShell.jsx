import { AuthProvider } from '../../context/AuthContext'
import { Header } from '../Header'
import { Footer } from './Footer'
import { Toaster } from '../ui/sonner'
import { useNextNavigation } from '../../hooks/useNextNavigation'

export function AppShell({ children }) {
  const { navigate } = useNextNavigation()

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header onNavigate={navigate} />
        <main className="flex-1">{typeof children === 'function' ? children(navigate) : children}</main>
        <Footer onNavigate={navigate} />
      </div>
      <Toaster />
    </AuthProvider>
  )
}


