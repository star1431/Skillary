import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { ROUTES } from '../config/routes';

export function SignupPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const { signup } = useAuth();

  const handleSendVerificationCode = async () => {
    if (!email) {
      toast.error('이메일을 입력해주세요.');
      return;
    }

    setIsVerifying(true);
    try {
      // TODO: 실제 SMTP 이메일 전송 API 호출
      // await sendVerificationEmail(email);
      toast.success('인증 코드가 이메일로 전송되었습니다.');
      setIsEmailSent(true);
    } catch (error) {
      toast.error('인증 코드 전송에 실패했습니다.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      toast.error('인증 코드를 입력해주세요.');
      return;
    }

    setIsVerifying(true);
    try {
      // TODO: 실제 인증 코드 검증 API 호출
      // await verifyEmailCode(email, verificationCode);
      toast.success('이메일 인증이 완료되었습니다.');
      setIsEmailVerified(true);
    } catch (error) {
      toast.error('인증 코드가 올바르지 않습니다.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailVerified) {
      toast.error('이메일 인증을 완료해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      await signup(email, password, nickname);
      toast.success('회원가입 성공!');
      onNavigate(ROUTES.HOME);
    } catch (error) {
      toast.error('회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>회원가입</CardTitle>
          <CardDescription>
            새 계정을 만들어 Skillary를 시작하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setIsEmailSent(false);
                    setIsEmailVerified(false);
                    setVerificationCode('');
                  }}
                  disabled={isEmailVerified}
                  required
                  className="flex-1"
                />
                {!isEmailVerified && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendVerificationCode}
                    disabled={isVerifying || !email}
                  >
                    {isEmailSent ? '재전송' : '인증코드 전송'}
                  </Button>
                )}
              </div>
            </div>
            {isEmailSent && !isEmailVerified && (
              <div className="space-y-2">
                <Label htmlFor="verificationCode">인증 코드</Label>
                <div className="flex gap-2">
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="인증 코드를 입력하세요"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={isVerifying || !verificationCode}
                  >
                    {isVerifying ? '인증 중...' : '인증'}
                  </Button>
                </div>
              </div>
            )}
            {isEmailVerified && (
              <div className="text-sm text-green-600">
                ✓ 이메일 인증이 완료되었습니다.
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                type="text"
                placeholder="닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '가입 중...' : '회원가입'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            이미 계정이 있으신가요?{' '}
            <button
              onClick={() => onNavigate(ROUTES.LOGIN)}
              className="text-primary hover:underline"
            >
              로그인
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

