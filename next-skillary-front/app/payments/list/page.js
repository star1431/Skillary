'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { pagingPayments } from '@/api/payments';
import PaymentStatusBadge from '../components/PaymentStatusBadge';
import Loading from '@/components/Loading';

export default function PaymentsListPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 비동기 데이터를 가져오는 로직
    const fetchPayments = async () => {
      try {
        const response = await pagingPayments(0, 10);
        setPayments(response.content || []); 
      } catch (error) {
        console.error("결제 내역 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) return <Loading loadingMessage='결제 정보 목록 로딩중입니다...'/>;

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
                      <PaymentStatusBadge status={payment.creditStatus}/>
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