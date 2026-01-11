import { ROUTES } from '../config/routes';

export function NotFoundPage({ onNavigate }) {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-6">
        요청하신 페이지를 찾을 수 없습니다.
      </p>
      <button
        onClick={() => onNavigate(ROUTES.HOME)}
        className="text-primary hover:underline"
      >
        홈으로 돌아가기
      </button>
    </div>
  );
}

