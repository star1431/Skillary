'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PaymentsListPage() {
  // TODO: 실제 결제 내역을 API에서 가져오기
  const [payments] = useState([
    {
      id: 1,
      contentTitle: 'React 19 새로운 기능 완벽 가이드',
      creatorName: '테크 인사이트',
      planName: '프리미엄',
      amount: 19900,
      paymentDate: '2025. 1. 10.',
      paymentMethod: '토스 페이먼츠',
      status: '완료',
      type: 'subscription'
    },
    {
      id: 2,
      contentTitle: 'TypeScript 고급 패턴: 타입 안전성 극대화',
      creatorName: '테크 인사이트',
      planName: '베이직',
      amount: 9900,
      paymentDate: '2025. 1. 5.',
      paymentMethod: '카카오페이',
      status: '완료',
      type: 'subscription'
    },
    {
      id: 3,
      contentTitle: '시스템 아키텍처 설계 실전 케이스',
      creatorName: '테크 인사이트',
      amount: 5000,
      paymentDate: '2025. 1. 3.',
      paymentMethod: '신용카드',
      status: '완료',
      type: 'one-time'
    },
    {
      id: 4,
      contentTitle: 'UI/UX 디자인 시스템 구축하기',
      creatorName: '디자인 스튜디오',
      planName: '프로',
      amount: 14900,
      paymentDate: '2025. 1. 1.',
      paymentMethod: '네이버페이',
      status: '취소',
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
          <h1 className="text-3xl font-bold text-black mb-2">결제 내역</h1>
          <p className="text-gray-600">모든 결제 내역을 확인하세요</p>
        </div>

        {/* 결제 목록 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {payments.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <div key={payment.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-black mb-2">{payment.contentTitle}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                        <span>{payment.creatorName}</span>
                        {payment.type === 'subscription' && payment.planName && (
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {payment.planName} 플랜
                          </span>
                        )}
                        {payment.type === 'one-time' && (
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            단건 결제
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{payment.paymentDate}</span>
                        <span>•</span>
                        <span>{payment.paymentMethod}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xl font-bold text-black mb-1">
                          ₩{payment.amount.toLocaleString()}
                        </div>
                        {payment.type === 'subscription' && (
                          <div className="text-xs text-gray-500">/월</div>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          payment.status === '완료'
                            ? 'bg-green-100 text-green-700'
                            : payment.status === '취소'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">💳</div>
              <h3 className="text-lg font-semibold text-black mb-2">결제 내역이 없습니다</h3>
              <p className="text-gray-500 text-sm">아직 결제한 내역이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
