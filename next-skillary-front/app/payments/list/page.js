'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { pagingPayments } from '@/api/payments';

export default function PaymentsListPage() {
  /*
		byte paymentId,
		String creatorName,
		String productName,
		int credit,
		String creditStatus,
		String creditMethod,
		LocalDateTime paidAt
  */

  const [payments, setPayments] = useState([]); // 실제 데이터 배열
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 비동기 데이터를 가져오는 로직
    const fetchPayments = async () => {
      try {
        const response = await pagingPayments(0, 10);
        // Spring Page 객체 구조에서는 response.content 안에 데이터 배열이 들어있습니다.
        setPayments(response.content || []); 
      } catch (error) {
        console.error("결제 내역 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) return <div className="p-10 text-center">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 부분 생략 (동일) */}
        <div className="mb-8">
          <Link href="/auth/my-page" className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition mb-4">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
             뒤로 가기
          </Link>
          <h1 className="text-3xl font-bold text-black mb-2">결제 내역</h1>
        </div>

        {/* 결제 목록 영역 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {payments && payments.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {/* response.content 내용을 순회 */}
              {payments.map((payment) => (
                <div key={payment.paymentId} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      {/* DTO 필드명 확인: productName 혹은 planName */}
                      <h3 className="text-lg font-semibold text-black mb-2">
                        {payment.productName || payment.planName}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                        <span>{payment.creatorName}</span>
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-gray-100 rounded">
                           {payment.creditMethod}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {/* 날짜 포맷팅 로직 추가 가능 */}
                        <span>{new Date(payment.paidAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xl font-bold text-black mb-1">
                          ₩{payment.credit?.toLocaleString()}
                        </div>
                      </div>

                      {/* 상태 뱃지 */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold tracking-tight border shadow-sm transition-colors ${
                          payment.creditStatus === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : payment.creditStatus === 'READY'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : payment.creditStatus === 'CANCELED'
                            ? 'bg-slate-100 text-slate-600 border-slate-300'
                            : payment.creditStatus === 'REFUNDED'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            payment.creditStatus === 'PAID' ? 'bg-emerald-500' :
                            payment.creditStatus === 'READY' ? 'bg-blue-500' :
                            payment.creditStatus === 'CANCELED' ? 'bg-slate-400' :
                            'bg-amber-500'
                          }`} />
                          
                          {payment.creditStatus === 'PAID' && '지불 완료'}
                          {payment.creditStatus === 'READY' && '결제 대기'}
                          {payment.creditStatus === 'CANCELED' && '철회됨'}
                          {payment.creditStatus === 'REFUNDED' && '환불 완료'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              결제 내역이 존재하지 않습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
