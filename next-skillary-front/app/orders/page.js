'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { popularContents } from '../components/popularContentsData';
import { creators } from '../creators/components/data';
import TossPayment from './components/toss/TossPayment';

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const contentId = searchParams.get('contentId');
  const creatorId = searchParams.get('creatorId');
  const planId = searchParams.get('planId');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showTossPayment, setShowTossPayment] = useState(false);
  const modalRef = useRef(null);
  
  // 구독 플랜 정보 가져오기
  const creator = creatorId ? creators.find(item => item.id === parseInt(creatorId)) : null;
  const selectedPlan = creator && planId ? creator.subscriptionPlans?.find(plan => plan.id === parseInt(planId)) : null;
  
  // 콘텐츠 정보 가져오기
  const content = contentId 
    ? popularContents.find(item => item.id === parseInt(contentId))
    : null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsPaymentModalOpen(false);
      }
    };

    if (isPaymentModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isPaymentModalOpen]);

  // 구독 플랜 또는 콘텐츠가 없으면 에러 표시
  if (!selectedPlan && !content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">주문 정보를 찾을 수 없습니다</h1>
          <Link href="/creators" className="text-blue-600 hover:underline">
            크리에이터 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 구독 플랜 정보
  const orderPrice = selectedPlan ? selectedPlan.price : (content?.price ? parseInt(content.price.replace(/[^0-9]/g, '')) : 9900);
  const orderTitle = selectedPlan ? `${creator?.name} - ${selectedPlan.name} 구독` : content?.title;
  const orderDescription = selectedPlan ? `${selectedPlan.name} 플랜으로 모든 컨텐츠를 무제한 이용하세요` : content?.description;

  const handlePayment = () => {
    // TODO: 결제 로직 구현
    setIsPaymentModalOpen(true);
  };

  const handleSelectPaymentMethod = (method) => {
    // TODO: 선택한 결제 수단으로 결제 진행
    setSelectedPaymentMethod(method);
    console.log('결제 수단 선택:', method);
  };

  const handleConfirmPayment = () => {
    // TODO: 최종 결제 확인 로직 구현
    console.log('결제 확인:', selectedPaymentMethod);
    
    // 토스 페이먼츠 선택 시 토스 결제 컴포넌트 표시
    if (selectedPaymentMethod === 'toss') {
      setIsPaymentModalOpen(false);
      setShowTossPayment(true);
    } else {
      // 다른 결제 수단 처리
      console.log('다른 결제 수단:', selectedPaymentMethod);
    }
  };

  // customerKey 생성 (실제로는 서버에서 생성하거나 사용자 정보로 생성)
  const generateCustomerKey = () => {
    // UUID 형식의 고유 키 생성 (간단한 예시)
    return `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const paymentMethods = [
    {
      id: 'toss',
      name: '토스 페이먼츠',
      description: '간편하고 안전한 결제',
      icon: '💳',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'kakao',
      name: '카카오페이',
      description: '카카오페이로 간편 결제',
      icon: '💛',
      color: 'from-yellow-400 to-yellow-500'
    },
    {
      id: 'naver',
      name: '네이버페이',
      description: '네이버페이로 안전 결제',
      icon: '🟢',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'card',
      name: '신용카드',
      description: '신용/체크카드 결제',
      icon: '💳',
      color: 'from-gray-600 to-gray-700'
    },
    {
      id: 'bank',
      name: '계좌이체',
      description: '실시간 계좌이체',
      icon: '🏦',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">주문 정보</h1>
          <p className="text-gray-600">주문 내용을 확인하고 결제를 진행해주세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 주문 상세 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 크리에이터/콘텐츠 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-black mb-4">
                {selectedPlan ? '구독 크리에이터' : '구독 콘텐츠'}
              </h2>
              <div className="flex gap-4">
                {selectedPlan ? (
                  <>
                    <div className={`w-24 h-24 rounded-lg bg-gradient-to-br ${creator?.gradientFrom} ${creator?.gradientTo} flex items-center justify-center flex-shrink-0`}>
                      <div className="text-4xl">{creator?.emoji}</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-black mb-2">{creator?.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{creator?.category}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{creator?.description}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`w-24 h-24 rounded-lg bg-gradient-to-br ${content.gradientFrom} ${content.gradientTo} flex items-center justify-center flex-shrink-0`}>
                      <div className="text-4xl">{content.emoji}</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-black mb-2">{content.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                        <span className="text-sm text-gray-600">{content.author}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{content.description}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 구독 플랜 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-black mb-4">구독 플랜</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-black mb-1">
                      {selectedPlan ? selectedPlan.name : '월 구독'}
                    </h3>
                    <p className="text-sm text-gray-600">매월 자동 갱신</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-black">₩{orderPrice.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">/{selectedPlan?.period || '월'}</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  {selectedPlan ? (
                    selectedPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>모든 콘텐츠 무제한 이용</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>신규 콘텐츠 자동 업데이트</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>언제든지 구독 취소 가능</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 결제 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-black mb-4">결제 정보</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">구독료</span>
                  <span className="text-black">₩{orderPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">할인</span>
                  <span className="text-black">₩0</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-semibold text-black">총 결제금액</span>
                  <span className="text-xl font-bold text-black">₩{orderPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 주문 요약 및 결제 버튼 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold text-black mb-4">주문 요약</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">구독 플랜</p>
                  <p className="font-semibold text-black">{selectedPlan ? selectedPlan.name : '월 구독'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">결제 주기</p>
                  <p className="font-semibold text-black">매월 자동 결제</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">다음 결제일</p>
                  <p className="font-semibold text-black">다음 달 오늘</p>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">총 금액</span>
                    <span className="text-2xl font-bold text-black">₩{orderPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500">매월 동일 금액이 자동으로 결제됩니다</p>
                </div>
              </div>
              <button
                onClick={() => handlePayment()}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition mb-4"
              >
                결제하기
              </button>
              <Link
                href={selectedPlan ? `/creators/${creator?.id}` : `/contents/${content?.id}`}
                className="block w-full text-center py-2 text-gray-600 hover:text-black transition text-sm"
              >
                취소
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 결제 수단 선택 모달 */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">결제 수단 선택</h2>
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleSelectPaymentMethod(method.id)}
                    className={`w-full p-4 rounded-lg border-2 transition text-left ${
                      selectedPaymentMethod === method.id
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-black mb-1">{method.name}</h3>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                      {selectedPaymentMethod === method.id && (
                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  취소
                </button>
                <button
                  onClick={() => handleConfirmPayment()}
                  disabled={!selectedPaymentMethod}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
                    selectedPaymentMethod
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  결제하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 토스 페이먼츠 결제 컴포넌트 */}
      {showTossPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <TossPayment
              customerKey={generateCustomerKey()}
              onClose={() => setShowTossPayment(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
