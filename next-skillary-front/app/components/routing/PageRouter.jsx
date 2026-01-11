import { matchRoute } from '../../config/routes';

// Page imports
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { SignupPage } from '../../pages/SignupPage';
import { CategoriesPage } from '../../pages/CategoriesPage';
import { CreatorsListPage } from '../../pages/CreatorsListPage';
import { CreatorProfilePage } from '../../pages/CreatorProfilePage';
import { ContentDetailPage } from '../../pages/ContentDetailPage';
import { PaymentPage } from '../../pages/PaymentPage';
import { MyPage } from '../../pages/MyPage';
import { NotificationsPage } from '../../pages/NotificationsPage';
import { ContentEditorPage } from '../../pages/ContentEditorPage';
import { AdminPage } from '../../pages/AdminPage';
import { NotFoundPage } from '../../pages/NotFoundPage';

export function PageRouter({ currentRoute, onNavigate }) {
  // Combine path and search params for route matching
  const fullPath = currentRoute.path + (currentRoute.search || '');
  const { route, params } = matchRoute(fullPath);

  switch (route) {
    case 'home':
      return <HomePage onNavigate={onNavigate} />;
    
    case 'login':
      return <LoginPage onNavigate={onNavigate} />;
    
    case 'signup':
      return <SignupPage onNavigate={onNavigate} />;
    
    case 'categories':
      return <CategoriesPage onNavigate={onNavigate} initialCategory={params?.category} />;
    
    case 'creators':
      return <CreatorsListPage onNavigate={onNavigate} />;
    
    case 'creatorProfile':
      return <CreatorProfilePage creatorId={params.id} onNavigate={onNavigate} />;
    
    case 'contentDetail':
      return <ContentDetailPage contentId={params.id} onNavigate={onNavigate} />;
    
    case 'paymentSubscription':
      return (
        <PaymentPage
          type="subscription"
          planId={params?.planId}
          onNavigate={onNavigate}
        />
      );
    
    case 'paymentContent':
      return (
        <PaymentPage
          type="content"
          contentId={params?.contentId}
          onNavigate={onNavigate}
        />
      );
    
    case 'myPage':
    case 'myPayments':
      return <MyPage onNavigate={onNavigate} />;
    
    case 'notifications':
      return <NotificationsPage onNavigate={onNavigate} />;
    
    case 'contentNew':
      return <ContentEditorPage onNavigate={onNavigate} />;
    
    case 'contentEdit':
      return <ContentEditorPage contentId={params.id} onNavigate={onNavigate} />;
    
    case 'admin':
      return <AdminPage onNavigate={onNavigate} />;
    
    default:
      return <NotFoundPage onNavigate={onNavigate} />;
  }
}

