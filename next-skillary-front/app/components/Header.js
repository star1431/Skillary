'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import Alert from './Alert';

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleToggleDropdown = () => {
    // TODO: 드롭다운 토글 로직 구현
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogin = () => {
    // TODO: 로그인 로직 구현
  };

  const handleSignup = () => {
    // TODO: 회원가입 로직 구현
  };

  const handleLogout = () => {
    // TODO: 로그아웃 로직 구현
    console.log('로그아웃');
  };

  const handleToggleAlert = () => {
    // TODO: 알림 토글 로직 구현
    setIsAlertOpen(!isAlertOpen);
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
    }
  };

  const handleCloseAlert = () => {
    // TODO: 알림 닫기 로직 구현
    setIsAlertOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-black hover:opacity-80 transition">
            Skillary
          </Link>
          <div className="flex items-center gap-8">
            <nav className="flex gap-6">
              <Link href="/contents" className="text-gray-700 hover:text-black transition">
                콘텐츠
              </Link>
              <Link href="/creators" className="text-gray-700 hover:text-black transition">
                크리에이터
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => handleToggleAlert()}
                  className="text-gray-700 hover:text-black transition relative"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {isAlertOpen && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </button>
                <Alert isOpen={isAlertOpen} onClose={handleCloseAlert} />
              </div>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => {
                    handleToggleDropdown();
                    if (isAlertOpen) {
                      setIsAlertOpen(false);
                    }
                  }}
                  className="text-gray-700 hover:text-black transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      href="/auth/login"
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm"
                    >
                      로그인
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm"
                    >
                      회원가입
                    </Link>
                    <div className="border-t border-gray-200 my-1"></div>
                    <Link
                      href="/auth/my-page"
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm"
                    >
                      마이페이지
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
