"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { billingAuth, pagingCard, getCustomerKey } from '@/api/payments';

export default function CardListPage() {
  const [tossPayments, setTossPayments] = useState(null);
  const clientKey = 'test_ck_yL0qZ4G1VO11Mw99NZLv8oWb2MQY';

  useEffect(() => {
    console.log("cards", cards);
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

  // 토스페이먼츠 빌링 인증 실행 함수
  const handleAddCard = async () => {
    try {
      const customerKey = await getCustomerKey('email@email.com');
      billingAuth(customerKey);
    } catch (error) {
      console.error("카드 등록 중 오류:", error);
    }
  };


  const [cards, setCards] = useState([]); // 실제 데이터 배열
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 비동기 데이터를 가져오는 로직
    const fetchPayments = async () => {
      try {
        const response = await pagingCard(0, 10);
        // Spring Page 객체 구조에서는 response.content 안에 데이터 배열이 들어있습니다.
        setCards(response.content || []);
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
      <div className="max-w-3xl mx-auto px-4 py-12">
        
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <Link
            href="/auth/my-page"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            마이페이지로 돌아가기
          </Link>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-black tracking-tight">결제 수단 관리</h1>
              <p className="text-gray-500 mt-1">구독 서비스에 사용할 카드를 등록하세요.</p>
            </div>
          </div>
        </div>

        {/* 카드 리스트 / 등록 버튼 */}
        <div className="space-y-4">
          {cards.length > 0 ? (
            <>
              {cards.map((card, idx) => (
                <div 
                  key={idx}
                  className={`relative overflow-hidden bg-white border-2 rounded-2xl p-6 transition-all ${
                    card.isDefault ? 'border-black shadow-md' : 'border-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center text-[10px] text-white font-bold uppercase">
                        {card.cardName}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">**** **** **** ****</span>
                          {card.isDefault && (
                            <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded-full font-bold">DEFAULT</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mt-1">등록일: {card.expiryDate}</p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-red-500 transition">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              
              {/* 추가 등록 버튼 (목록이 있을 때 소형 버튼) */}
              <button 
                onClick={handleAddCard}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 font-medium hover:border-gray-400 hover:text-gray-700 transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                새 카드 등록하기
              </button>
            </>
          ) : (
            /* 빈 상태 (Empty State) */
            <button 
              onClick={handleAddCard}
              className="w-full bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center hover:border-black hover:bg-gray-50 transition-all group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">💳</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">등록된 결제 수단이 없습니다</h3>
              <p className="text-gray-500 mb-8">안전한 결제를 위해 카드를 먼저 등록해 주세요.</p>
              <span className="inline-flex items-center px-8 py-3 bg-black text-white rounded-full font-bold shadow-lg hover:bg-gray-800 transition">
                카드 등록 시작하기
              </span>
            </button>
          )}
        </div>

        {/* 하단 안내문 */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            꼭 확인해 주세요!
          </h4>
          <ul className="text-xs text-gray-500 space-y-2 leading-relaxed">
            <li>• 본인 명의의 신용/체크카드만 등록이 가능합니다.</li>
            <li>• 등록된 기본 결제 수단은 정기 구독 갱신 시 자동으로 사용됩니다.</li>
            <li>• 카드 정보는 토스페이먼츠를 통해 안전하게 암호화되어 관리됩니다.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}