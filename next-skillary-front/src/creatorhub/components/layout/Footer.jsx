import { APP_CONFIG } from '../../config/constants';
import { ROUTES } from '../../config/routes';
import Link from 'next/link';

export function Footer({ onNavigate }) {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">{APP_CONFIG.NAME}</h3>
            <p className="text-sm text-muted-foreground">
              {APP_CONFIG.DESCRIPTION}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">서비스</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={ROUTES.CATEGORIES}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  콘텐츠 탐색
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.CREATORS}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  크리에이터
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">회사</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>회사 소개</li>
              <li>이용약관</li>
              <li>개인정보처리방침</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">고객지원</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>FAQ</li>
              <li>문의하기</li>
              <li>공지사항</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          {APP_CONFIG.COPYRIGHT}
        </div>
      </div>
    </footer>
  );
}

