"use client";

import { useState, useEffect } from 'react';
import { pagingCard, getCustomerKey, withdrawCard } from '@/api/payments';
import { registerCard } from '@/api/tossPayments';
import CardFooter from '../components/CardFooter';
import CardList from '../components/CardList';
import CardHeader from '../components/CardHeader';
import CardAddButton from '../components/CardAddButton';
import Loading from '@/components/Loading';


export default function CardListPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await pagingCard(0, 10);
      setCards(response.content || []);
    } catch (error) {
      console.log("결제 내역 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleWithdrawCard = async (cardId) => {
    try {
      setLoading(true);
      const res = await withdrawCard(cardId);
      if (res) alert('삭제 완료');
      else alert('삭제 실패');
    } catch (e) {
      console.log(e.message);
    } finally {
      fetchCards();
    }
  }

  // 토스페이먼츠 빌링 인증 실행 함수
  const handleRegisterCard = async () => {
    try {
      const customerKey = await getCustomerKey('email@email.com');
      await registerCard(customerKey);
    } catch (error) {
      console.log("카드 등록 중 오류:", error);
    } finally {
      fetchCards();
    }
  };

  if (loading) return <Loading loadingMessage='카드 목록 로딩중입니다...'/>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* 헤더 섹션 */}
        <CardHeader/>

        {/* 카드 리스트 / 등록 버튼 */}
        <div className="space-y-4">
          {cards.length > 0 ? (
            <>
              <CardList cards={cards} handleWithdrawCard={handleWithdrawCard}/>

              {/* 추가 등록 버튼 (목록이 있을 때 소형 버튼) */}
              <button 
                onClick={handleRegisterCard}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 font-medium hover:border-gray-400 hover:text-gray-700 transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                새 카드 등록하기
              </button>
            </>
          ) :
          /* 빈 상태 (Empty State) */
          <CardAddButton handleRegisterCard={handleRegisterCard}/>}
        </div>

        {/* 하단 안내문 */}
        <CardFooter/>

      </div>
    </div>
  );
}