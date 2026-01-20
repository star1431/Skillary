'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function SubscriptionPlanModal({ 
  isOpen, 
  subscriptionPlans, 
  onClose
}) {
  const router = useRouter();
  const modalRef = useRef(null);

  // 모달 외부 클릭 처리
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSelectPlan = (plan) => {
    // 구독 플랜 선택 시 주문 페이지로 이동
    onClose();
    router.push(`/orders/billing?planId=${plan.planId}`);
  };

  if (!isOpen || !subscriptionPlans || subscriptionPlans.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8">
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-black mb-2">구독 플랜 선택</h2>
              <p className="text-gray-600">크리에이터가 제공하는 구독 플랜을 선택하세요</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 구독 플랜 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.planId}
                className={`bg-white border-2 rounded-lg p-6 transition ${
                  plan.isSubscribed 
                    ? 'border-green-300' 
                    : 'border-gray-200 hover:border-black'
                }`}
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-black mb-2">{plan.planName}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-black">{plan.price.toLocaleString()}</span>
                    <span className="text-gray-600">원</span>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-700">{plan.description}</p>
                </div>

                {plan.isSubscribed ? (
                  <button
                    disabled
                    className="w-full bg-gray-100 text-gray-400 py-3 rounded-lg font-semibold cursor-not-allowed"
                  >
                    구독중
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
                  >
                    구독하기
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

