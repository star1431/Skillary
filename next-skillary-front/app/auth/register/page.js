'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function RegisterPage() {
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5분 = 300초
  const [isVerified, setIsVerified] = useState(false);

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

  const handleSendCode = () => {
    // TODO: 인증코드 전송 로직 구현
    setIsCodeSent(true);
    setTimeLeft(300);
  };

  const handleResendCode = () => {
    // TODO: 인증코드 재전송 로직 구현
    setTimeLeft(300);
  };

  const handleVerifyCode = () => {
    // TODO: 인증코드 확인 로직 구현
    setIsVerified(true);
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

          {/* 이메일 회원가입 */}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  id="email"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="이메일을 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => handleSendCode()}
                  className="px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition whitespace-nowrap"
                >
                  전송
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
                      maxLength={6}
                      disabled={isVerified}
                      className={`w-full px-4 py-2 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                        isVerified ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="인증코드를 입력하세요"
                    />
                    {!isVerified && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                        {formatTime(timeLeft)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleVerifyCode()}
                    disabled={isVerified}
                    className={`px-4 py-2 bg-black text-white rounded-lg font-semibold transition whitespace-nowrap ${
                      isVerified ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-gray-800'
                    }`}
                  >
                    확인
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResendCode()}
                    disabled={isVerified}
                    className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                      isVerified 
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인
              </label>
              <input
                type="password"
                id="passwordConfirm"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="비밀번호를 다시 입력하세요"
              />
            </div>
            <button className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition">
              회원가입
            </button>
          </div>

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
