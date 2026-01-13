'use client';

import { useState } from 'react';
import Link from 'next/link';
import { creators } from '../../creators/components/data';

export default function OrdersListPage() {
  // TODO: 실제 주문 내역을 API에서 가져오기
  const [orders] = useState([
    {
      id: 1,
      contentTitle: 'React 19 새로운 기능 완벽 가이드',
      creatorName: '테크 인사이트',
      creatorId: 1,
      planName: '프리미엄',
      price: 19900,
      orderDate: '2025. 1. 10.',
      status: '활성',
      type: 'subscription'
    },
    {
      id: 2,
      contentTitle: 'TypeScript 고급 패턴: 타입 안전성 극대화',
      creatorName: '테크 인사이트',
      creatorId: 1,
      planName: '베이직',
      price: 9900,
      orderDate: '2025. 1. 5.',
      status: '활성',
      type: 'subscription'
    },
    {
      id: 3,
      contentTitle: '시스템 아키텍처 설계 실전 케이스',
      creatorName: '테크 인사이트',
      creatorId: 1,
      price: 5000,
      orderDate: '2025. 1. 3.',
      status: '완료',
      type: 'one-time'
    },
    {
      id: 4,
      contentTitle: 'UI/UX 디자인 시스템 구축하기',
      creatorName: '디자인 스튜디오',
      creatorId: 2,
      planName: '프로',
      price: 14900,
      orderDate: '2025. 1. 2.',
      status: '활성',
      type: 'subscription'
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
          <h1 className="text-3xl font-bold text-black mb-2">주문 내역</h1>
          <p className="text-gray-600">모든 주문 내역을 확인하세요</p>
        </div>

        {/* 주문 목록 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {orders.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => {
                const creator = creators.find(c => c.id === order.creatorId);
                return (
                  <div key={order.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-black mb-2">{order.contentTitle}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                          <Link
                            href={`/creators/${order.creatorId}`}
                            className="text-gray-600 hover:text-black transition"
                          >
                            {order.creatorName}
                          </Link>
                          {order.type === 'subscription' && order.planName && (
                            <span className="inline-flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              구독 플랜: {order.planName}
                            </span>
                          )}
                          {order.type === 'one-time' && (
                            <span className="inline-flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              단건 결제
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{order.orderDate}</div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-xl font-bold text-black mb-1">
                            ₩{order.price.toLocaleString()}
                          </div>
                          {order.type === 'subscription' && (
                            <div className="text-xs text-gray-500">/월</div>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === '활성'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-black mb-2">주문 내역이 없습니다</h3>
              <p className="text-gray-500 text-sm">아직 주문한 내역이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
