'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

export default function TossPayment({ customerKey, onClose }) {
  const tossPaymentsRef = useRef(null);

  useEffect(() => {
    // 토스 페이먼츠 스크립트가 로드된 후 초기화
    if (typeof window !== 'undefined' && window.TossPayments) {
      const tossPayments = window.TossPayments("test_ck_yL0qZ4G1VO11Mw99NZLv8oWb2MQY");
      tossPaymentsRef.current = tossPayments;
      
      // 결제창 초기화
      const payment = tossPayments.payment({ customerKey });
      
      // TODO: 결제창 열기 등의 로직 구현
      console.log('토스 페이먼츠 초기화 완료', { customerKey });
    }
  }, [customerKey]);

  return (
    <>
      <Script
        src="https://js.tosspayments.com/v2/standard"
        strategy="lazyOnload"
        onLoad={() => {
          if (typeof window !== 'undefined' && window.TossPayments) {
            const tossPayments = window.TossPayments("test_ck_yL0qZ4G1VO11Mw99NZLv8oWb2MQY");
            tossPaymentsRef.current = tossPayments;
            
            // 결제창 초기화
            const payment = tossPayments.payment({ customerKey });
            
            console.log('토스 페이먼츠 초기화 완료', { customerKey });
          }
        }}
      />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">토스 페이먼츠 결제</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">토스 페이먼츠 결제를 진행합니다.</p>
          <p className="text-sm text-gray-500">Customer Key: {customerKey}</p>
        </div>
      </div>
    </>
  );
}
