import { Bell, User } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { ROUTES } from '../config/routes';
import { USER_ROLES } from '../config/constants';

export function Header({ onNavigate }) {
  const { user, logout } = useAuth();

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <button
          onClick={() => onNavigate(ROUTES.HOME)}
          className="font-bold text-xl hover:opacity-80 transition-opacity"
        >
          CreatorHub
        </button>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 flex-1">
          <button
            onClick={() => onNavigate(ROUTES.CATEGORIES)}
            className="text-sm hover:text-primary transition-colors"
          >
            콘텐츠
          </button>
          <button
            onClick={() => onNavigate(ROUTES.CREATORS)}
            className="text-sm hover:text-primary transition-colors"
          >
            크리에이터
          </button>
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-2 ml-auto">
          {user ? (
            <>
              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate(ROUTES.MY_NOTIFICATIONS)}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  2
                </Badge>
              </Button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel asChild>
                    <button
                      onClick={() => onNavigate(ROUTES.MY_PAGE)}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 size-9 rounded-md w-full cursor-pointer"
                    >
                      <div className="text-left">
                        <div className="font-medium">{user.nickname}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </button>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onNavigate(ROUTES.MY_PAGE)}>
                    마이페이지
                  </DropdownMenuItem>
                  {user.role === USER_ROLES.ADMIN && (
                    <DropdownMenuItem onClick={() => onNavigate(ROUTES.ADMIN)}>
                      관리자 페이지
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>로그아웃</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => onNavigate(ROUTES.LOGIN)}>
                로그인
              </Button>
              <Button onClick={() => onNavigate(ROUTES.SIGNUP)}>회원가입</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

