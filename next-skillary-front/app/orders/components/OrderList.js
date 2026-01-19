'use client';

import { retrieveOrder } from '@/api/payments';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OrderList({ orders }) {
    const router = useRouter();

    const handleRestartOrder = async (orderId) => {
        const res = await retrieveOrder(orderId);
        if (res.planName)
            router.push(`/orders/billing?orderId=${orderId}`);
        else 
            router.push(`/orders/payment?orderId=${orderId}`)
    }

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

    return <>
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
                        <div className="text-xl font-bold text-black mb-1">₩{order.amount}</div>
                        {order.type === 'subscription' && <div className="text-xs text-gray-500">/월</div>}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles(order.orderStatus)}`}>
                        {order.orderStatus}
                    </span>
                </div>
            </div>
            </div>
        );
    })}</>
}