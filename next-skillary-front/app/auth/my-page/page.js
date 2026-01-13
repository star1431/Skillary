'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MyPage() {
  const router = useRouter();
  // TODO: 실제 사용자 정보를 API에서 가져오기
  const [userInfo] = useState({
    name: '사용자',
    email: 'user@example.com',
    joinDate: '2024년 1월',
    subscriptionCount: 3,
    contentCount: 5,
    creatorId: 1 // TODO: 실제 사용자의 크리에이터 ID 가져오기
  });

  const handleCreateCreator = () => {
    router.push('/creators/create');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">마이페이지</h1>
          <p className="text-gray-600">내 정보와 활동을 확인하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 프로필 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 프로필 카드 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">프로필 정보</h2>
                <button
                  onClick={() => handleCreateCreator()}
                  className="px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition text-sm whitespace-nowrap"
                >
                  크리에이터 생성
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl">
                    👤
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-black mb-1">{userInfo.name}</h3>
                    <p className="text-gray-600">{userInfo.email}</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">가입일</span>
                    <span className="text-black font-medium">{userInfo.joinDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 구독 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">구독 정보</h2>
                <Link
                  href="/creators"
                  className="text-sm text-gray-600 hover:text-black transition"
                >
                  더 보기 →
                </Link>
              </div>
              <div className="text-center py-8">
                <div className="text-4xl font-bold text-black mb-2">{userInfo.subscriptionCount}</div>
                <p className="text-gray-600">구독 중인 크리에이터</p>
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 빠른 메뉴 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-black mb-4">빠른 메뉴</h3>
              <div className="space-y-2">
                <Link
                  href="/orders/list"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  주문 내역
                </Link>
                <Link
                  href="/payments/list"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  결제 내역
                </Link>
                <Link
                  href="/settlements/list"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  정산 내역
                </Link>
                <Link
                  href="/auth/my-page/setting"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  프로필 설정
                </Link>
              </div>
            </div>

            {/* 통계 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-black mb-4">활동 통계</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">이번 달 구독</span>
                    <span className="text-sm font-semibold text-black">2개</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">이번 달 결제</span>
                    <span className="text-sm font-semibold text-black">₩29,800</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">이번 달 생성</span>
                    <span className="text-sm font-semibold text-black">3개</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
