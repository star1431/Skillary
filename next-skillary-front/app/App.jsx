import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/layout/Footer';
import { PageRouter } from './components/routing/PageRouter';
import { useNavigation } from './hooks/useNavigation';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const { currentRoute, navigate } = useNavigation('/');

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header onNavigate={navigate} />
        <main className="flex-1">
          <PageRouter currentRoute={currentRoute} onNavigate={navigate} />
        </main>
        <Footer onNavigate={navigate} />
      </div>
      <Toaster />
    </AuthProvider>
  );
}

