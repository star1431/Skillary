"use client";

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { billingAuth } from '@/api/payments';

export default function CardRegisterPage() {

    const [tossPayments, setTossPayments] = useState(null);
    const clientKey = 'test_ck_yL0qZ4G1VO11Mw99NZLv8oWb2MQY';

    useEffect(() => {
        // 스크립트가 로드되었는지 확인 후 객체 생성
        if (window.TossPayments) {
            setTossPayments(window.TossPayments(clientKey));
        } else {
            // 혹시라도 로드가 늦어질 경우를 대비해 스크립트 태그의 이벤트를 감시할 수도 있습니다. 
            const script = document.querySelector('script[src*="tosspayments"]');
            if (script) {
                script.addEventListener('load', () => {
                    setTossPayments(window.TossPayments(clientKey));
                });
            }
        }
    }, []);

    useEffect(() => {
        billingAuth();
    }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8">
          {/* 뒤로 가기 */}
          <Link href="/auth/my-page" className="text-gray-400 hover:text-black transition flex items-center gap-1 text-sm mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            돌아가기
          </Link>

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4">
              <span className="text-3xl">💳</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">결제 카드 등록</h1>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              한 번 등록하면 다음부터는<br />
              비밀번호만으로 간편하게 구독할 수 있어요.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-[11px] text-gray-400 font-medium">TossPayments 보안 결제 시스템 적용</span>
          </div>
        </div>
      </div>
    </div>
  );
}