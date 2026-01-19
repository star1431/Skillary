'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { completePayment } from '@/api/payments';
import Loading from '@/components/Loading';

export default function Success() {
const searchParams = useSearchParams();
    const router = useRouter();
    const [paymentResult, setPaymentResult] = useState(null);
    const called = useRef(false);

    const orderId = searchParams.get('orderId');
    const paymentKey = searchParams.get('paymentKey');
    const amount = searchParams.get('amount');
    const price = searchParams.get('price');

    useEffect(() => {
        // 1. 빌링 페이: 이미 결제가 완료되어 price가 넘어온 경우
        if (price) {
            setPaymentResult({
                paymentKey: paymentKey,
                orderId: orderId,
                amount: price // 화면 하단에 보여줄 금액
            });
            return; // API 호출 없이 종료
        }

        // 2. 싱글 페이: 아직 승인 전이라 백엔드 호출이 필요한 경우
        const confirm = async () => {
            if (called.current) return;
            called.current = true;

            try {
                const result = await completePayment(orderId, paymentKey, amount);
                setPaymentResult(result);
            } catch (e) {
                router.push(`/payments/fail?message=${e.message}`);
            }
        };

        if (orderId && paymentKey) {
            confirm();
        }
    }, [orderId, paymentKey, amount, price, router]);

    // 로딩 화면 (paymentResult가 채워지기 전까지 노출)
    if (!paymentResult)
        return <Loading loadingMessage = '결제 정보를 확인 중입니다...'/>

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="mb-6 flex justify-center">
                    <div className="rounded-full bg-green-100 p-3">
                        <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">결제가 완료되었습니다!</h1>
                <p className="text-gray-600 mb-8">주문해주셔서 감사합니다. 결제 상세 정보는 다음과 같습니다.</p>

                <div className="space-y-4 text-left border-t border-b py-6 mb-8">
                    <div className="flex justify-between">
                        <span className="text-gray-500">결제 금액</span>
                        <span className="font-semibold">{paymentResult.price || paymentResult.amount} 원</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">주문 정보</span>
                        <span className="text-sm font-mono text-gray-800">{paymentResult.paymentKey}</span>
                    </div>
                </div>

                <button
                    onClick={() => router.push('/')}
                    className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
                >
                    홈으로 돌아가기
                </button>
            </div>
        </main>
    );
}