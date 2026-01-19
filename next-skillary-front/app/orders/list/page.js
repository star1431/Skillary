'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { pagingOrders } from '@/api/payments';
import OrderList from '../components/OrderList';

export default function OrdersListPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFetched = useRef(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (isFetched.current) return;

      try {
        const response = await pagingOrders(0, 10);
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
              <OrderList orders={orders} />
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
