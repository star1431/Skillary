import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { ROUTES } from '../config/routes';

export function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('로그인 성공!');
      onNavigate(ROUTES.HOME);
    } catch (error) {
      toast.error('로그인 실패. 이메일과 비밀번호를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>로그인</CardTitle>
          <CardDescription>
            계정에 로그인하여 더 많은 기능을 이용하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  테스트 계정
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm bg-muted p-4 rounded-lg">
              <div>
                <strong>테스트 계정:</strong> test@test.com / 1234
              </div>
              <div>
                <strong>일반 사용자:</strong> user@example.com
              </div>
              <div>
                <strong>크리에이터:</strong> creator@example.com
              </div>
              <div>
                <strong>관리자:</strong> admin@example.com
              </div>
              <div className="text-muted-foreground text-xs mt-2">
                테스트 계정 외에는 비밀번호는 임의의 값을 입력하세요
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            계정이 없으신가요?{' '}
            <button
              onClick={() => onNavigate(ROUTES.SIGNUP)}
              className="text-primary hover:underline"
            >
              회원가입
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

