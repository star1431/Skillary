'use client';

import { useState } from 'react';
import Link from 'next/link';
import { creators } from '../../creators/components/data';

export default function SettlementsListPage() {
  // TODO: 실제 정산 내역을 API에서 가져오기
  const [settlements] = useState([
    {
      id: 1,
      period: '2025년 1월',
      creatorName: '테크 인사이트',
      creatorId: 1,
      totalRevenue: 298000,
      platformFee: 29800,
      settlementAmount: 268200,
      status: '완료',
      settlementDate: '2025. 2. 5.'
    },
    {
      id: 2,
      period: '2024년 12월',
      creatorName: '테크 인사이트',
      creatorId: 1,
      totalRevenue: 245000,
      platformFee: 24500,
      settlementAmount: 220500,
      status: '완료',
      settlementDate: '2025. 1. 5.'
    },
    {
      id: 3,
      period: '2025년 1월',
      creatorName: '디자인 스튜디오',
      creatorId: 2,
      totalRevenue: 178000,
      platformFee: 17800,
      settlementAmount: 160200,
      status: '대기',
      settlementDate: '-'
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <Link
            href="/auth/my-page"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            뒤로 가기
          </Link>
          <h1 className="text-3xl font-bold text-black mb-2">정산 내역</h1>
          <p className="text-gray-600">크리에이터 정산 내역을 확인하세요</p>
        </div>

        {/* 정산 목록 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {settlements.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {settlements.map((settlement) => {
                const creator = creators.find(c => c.id === settlement.creatorId);
                return (
                  <div key={settlement.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-black">{settlement.period}</h3>
                            <Link
                              href={`/creators/${settlement.creatorId}`}
                              className="text-sm text-gray-600 hover:text-black transition"
                            >
                              {settlement.creatorName}
                            </Link>
                          </div>
                          <div className="text-sm text-gray-500">{settlement.settlementDate}</div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            settlement.status === '완료'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {settlement.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">총 매출</div>
                          <div className="text-lg font-semibold text-black">
                            ₩{settlement.totalRevenue.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">플랫폼 수수료 (10%)</div>
                          <div className="text-lg font-semibold text-gray-700">
                            ₩{settlement.platformFee.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">정산 금액</div>
                          <div className="text-xl font-bold text-black">
                            ₩{settlement.settlementAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-lg font-semibold text-black mb-2">정산 내역이 없습니다</h3>
              <p className="text-gray-500 text-sm">아직 정산된 내역이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
