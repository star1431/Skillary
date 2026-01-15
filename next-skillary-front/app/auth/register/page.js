'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [verificationCodeInput, setVerificationCodeInput] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [nickname, setNickname] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5분 = 300초
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
  const nicknamePattern = /^[가-힣a-zA-Z0-9_]+$/;
    const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const passwordPattern = /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};:'",.<>/?`~|]+$/;

    useEffect(() => {
        if (isCodeSent && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isCodeSent, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSendCode = async () => {
        setError('');
        if (!email) {
            setError('이메일을 입력해주세요.');
            return;
        }
        // 이메일이 완전히 입력되었는지 확인 (.com까지 포함)
        if (!emailPattern.test(email)) {
            setError('이메일 주소를 끝까지 입력해주세요. (예: example@gmail.com)');
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/auth/send-confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email}),
            });
            if (!response.ok) {
                const errorMessage = response.headers.get('X-Error-Message');
                throw new Error(errorMessage || '인증 코드 발송에 실패했습니다.');
            }
            setIsCodeSent(true);
            setTimeLeft(300);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        setError('');
        // 이메일이 완전히 입력되었는지 확인 (.com까지 포함)
        if (!emailPattern.test(email)) {
            setError('이메일 주소를 끝까지 입력해주세요. (예: example@gmail.com)');
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/auth/send-confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email}),
            });
            if (!response.ok) {
                const errorMessage = response.headers.get('X-Error-Message');
                throw new Error(errorMessage || '인증 코드 재발송에 실패했습니다.');
            }
            setTimeLeft(300);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        setError('');
        if (!verificationCodeInput) {
            setError('인증 코드를 입력해주세요.');
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/auth/send-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, code: verificationCodeInput}),
            });
            if (!response.ok) {
                throw new Error('인증 코드가 올바르지 않습니다.');
            }
            setIsVerified(true);
            setTimeLeft(0);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNaverRegister = () => {
        // TODO: Naver OAuth 회원가입 로직 구현
        console.log('Naver 회원가입');
    };

    const handleGoogleRegister = () => {
        // TODO: Google OAuth 회원가입 로직 구현
        console.log('Google 회원가입');
    };

    const handleKakaoRegister = () => {
        // TODO: Kakao OAuth 회원가입 로직 구현
        console.log('Kakao 회원가입');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== passwordConfirm) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }
        if (!passwordPattern.test(password)) {
            setError('비밀번호는 영문, 숫자, 특수문자만 사용할 수 있습니다.');
            return;
        }
        if (!isVerified) {
            setError('이메일 인증을 완료해주세요.');
            return;
        }
        if (!nickname || nickname.trim().length === 0) {
            setError('닉네임을 입력해주세요.');
            return;
        }
        // 닉네임 앞뒤 공백 체크
        if (nickname !== nickname.trim()) {
            setError('닉네임 앞뒤에 공백을 사용할 수 없습니다.');
            return;
        }
        if (nickname.trim().length < 4) {
            setError('닉네임은 4자 이상이어야 합니다.');
            return;
        }
        if (nickname.trim().length > 12) {
            setError('닉네임은 12자 이하여야 합니다.');
            return;
        }
        if (!nicknamePattern.test(nickname)) {
            setError('닉네임은 한글/영문/숫자/밑줄(_)만 사용할 수 있습니다.');
            return;
        }
        setIsLoading(true);
        try {
            const nicknameCheckResponse = await fetch(
                `http://localhost:8080/api/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`,
            );
            if (!nicknameCheckResponse.ok) {
                const errorMessage = nicknameCheckResponse.headers.get('X-Error-Message');
                throw new Error(errorMessage || '닉네임 중복 확인에 실패했습니다.');
            }
            const nicknameCheckData = await nicknameCheckResponse.json();
            if (!nicknameCheckData.available) {
                setError('이미 사용 중인 닉네임입니다.');
                return;
            }
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({email, password, nickname}),
            });
            if (!response.ok) {
                const errorMessage = response.headers.get('X-Error-Message');
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorMessage || errorData.message || '회원가입에 실패했습니다.');
            }
            router.push('/auth/login');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm w-full">
        {/* 회원가입 카드 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* 로고 및 제목 */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <h1 className="text-3xl font-bold text-black">Skillary</h1>
            </Link>
            <h2 className="text-2xl font-bold text-black mb-2">회원가입</h2>
            <p className="text-gray-600">소셜 계정으로 간편하게 가입하세요</p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* 이메일 회원가입 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isCodeSent}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="이메일을 입력하세요"
                  required
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isCodeSent || isLoading}
                  className="px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? '전송 중...' : '전송'}
                </button>
              </div>
            </div>

            {isCodeSent && (
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                  인증코드
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      id="verificationCode"
                      value={verificationCodeInput}
                      onChange={(e) => setVerificationCodeInput(e.target.value)}
                      maxLength={6}
                      disabled={isVerified}
                      className={`w-full px-4 py-2 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                        isVerified ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="인증코드"
                      required
                    />
                    {!isVerified && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                        {formatTime(timeLeft)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={isVerified || isLoading}
                    className={`px-4 py-2 bg-black text-white rounded-lg font-semibold transition whitespace-nowrap ${
                      isVerified || isLoading ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-gray-800'
                    }`}
                  >
                    {isLoading ? '확인 중...' : '확인'}
                  </button>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isVerified || isLoading}
                    className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                      isVerified || isLoading
                        ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    재전송
                  </button>
                </div>
                 {isVerified && (
                   <div className="mt-3 mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                     <p className="text-sm text-green-700">인증되었습니다.</p>
                   </div>
                 )}
              </div>
            )}

            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                닉네임
              </label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => {
                  const value = e.target.value;
                  // 앞뒤 공백 제거 (실시간)
                  if (value !== value.trim() && value.trim().length > 0) {
                    setNickname(value.trim());
                  } else {
                    setNickname(value);
                  }
                }}
                onBlur={(e) => {
                  // 포커스 해제 시 앞뒤 공백 제거
                  setNickname(e.target.value.trim());
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="닉네임을 입력하세요"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인
              </label>
              <input
                type="password"
                id="passwordConfirm"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={!isVerified || isLoading}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? '처리 중...' : '회원가입'}
            </button>
          </form>

          {/* 구분선 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          {/* 로그인 링크 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link href="/auth/login" className="text-black font-semibold hover:underline">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
