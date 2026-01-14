'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { completeSinglePay } from '@/api/payments';

export default function Success() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    // 쿼리 파라미터에서 값 추출
    const orderId = searchParams.get('orderId');
    const paymentKey = searchParams.get('paymentKey');
    const amount = searchParams.get('amount');
    const price = searchParams.get('price');


    useEffect(() => {
        const confirm = async () => {
            if (orderId && paymentKey && amount) {
                try {
                    await completeSinglePay(orderId, paymentKey, parseInt(amount));
                } catch (error) {
                    router.push('/payments/fail');
                } finally {
                    setIsLoading(false);
                }
            }
            if (paymentKey && orderId && price) {
                setIsLoading(false);
            }
        };
        confirm();
    }, [orderId, paymentKey, amount]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">결제 중입니다. 잠시만 기다려주세요.</p>
            </div>
        );
    }    

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
                        <span className="font-semibold">{amount || price} 원</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">주문 정보</span>
                        <span className="text-sm font-mono text-gray-800">{orderId}</span>
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