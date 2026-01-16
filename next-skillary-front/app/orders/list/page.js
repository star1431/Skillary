'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { pagingOrder, restartOrder } from '@/api/payments';

export default function OrdersListPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFetched = useRef(false);

  const getStatusStyles = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-blue-100 text-blue-700';
      case 'PAID': return 'bg-green-100 text-green-700';
      case 'FAILED': return 'bg-red-100 text-red-700';
      case 'CANCELLED': return 'bg-gray-100 text-gray-700';
      case 'EXPIRED': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusName = (status) => {
    switch (status) {
      case 'PENDING': return '대기중';
      case 'PAID': return '지불 완료';
      case 'FAILED': return '결제 실패';
      case 'CANCELLED': return '결제 취소';
      case 'EXPIRED': return '만료됨';
      default: return '문의해주세요';
    }
  };

  const handleRestartOrder = async (orderId) => {
    const res = await restartOrder(orderId);
    if (res.planName)
      router.push(`/orders/plan?orderId=${orderId}`);
    else 
      router.push(`/orders/single?orderId=${orderId}`)
  }

  useEffect(() => {
    // 비동기 데이터를 가져오는 로직
    const fetchOrders = async () => {
      if (isFetched.current) return;

      try {
        const response = await pagingOrder(0, 10);
        setOrders(response.content || []);
      } catch (error) {
        console.error("주문 내역 로딩 실패:", error);
      } finally {
        setLoading(false);
        isFetched.current = true;
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="p-10 text-center">로딩 중...</div>;

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
              {orders.map((order, idx) => {
                return (
                  <div 
                    key={order.orderId} 
                    // 1. 클릭 핸들러 연결 및 커서 스타일 추가
                    onClick={() => handleRestartOrder(order.orderId)}
                    className="p-6 hover:bg-gray-50 transition cursor-pointer border-b last:border-b-0" 
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-black mb-2">{order.orderTitle}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                          <Link
                            href={`/creators/${order.creatorId}`}
                            // 2. 판매자 이름 클릭 시 전체 카드 클릭 이벤트가 실행되지 않도록 방지
                            onClick={(e) => e.stopPropagation()} 
                            className="text-gray-600 hover:text-black transition underline decoration-gray-300"
                          >
                            {order.sellerName}
                          </Link>
                          
                          {/* ... 나머지 아이콘 로직 생략 ... */}
                          {order.isPlan ? (
                            <span className="inline-flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              구독 플랜: {order.orderTitle}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              단건 결제: {order.orderTitle}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{order.createdAt}</div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-xl font-bold text-black mb-1">
                            ₩{order.amount}
                          </div>
                          {order.type === 'subscription' && (
                            <div className="text-xs text-gray-500">/월</div>
                          )}
                        </div>
                        {console.log('orderStatus', order.orderStatus)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles(order.orderStatus)}`}>
                          {getStatusName(order.orderStatus)}
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
