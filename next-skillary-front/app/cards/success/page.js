'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createCard } from '@/api/payments';

export default function Success() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [paymentResult, setPaymentResult] = useState(null);

    // 쿼리 파라미터에서 값 추출
    const authKey = searchParams.get('authKey');
    const customerKey = searchParams.get('customerKey');

    useEffect(() => {
        // 렌더링이 끝난 후(마운트된 후) 실행됩니다.
        if (authKey && customerKey) {
            // 1. 여기서 서버로 빌링키 발급 요청을 보내거나
            // 2. 다른 페이지로 리다이렉트합니다.
            console.log("인증 성공:", { authKey, customerKey });
        
            // 예: 3초 뒤에 카드 리스트로 이동
            const timer = setTimeout(() => {
                router.replace('/cards/list'); 
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [authKey, customerKey, router]);


    useEffect(() => {
        const confirm = async () => {
            if (!authKey || !customerKey ) return;

            try {
                const response = await createCard(
                    customerKey,
                    authKey
                );

                setPaymentResult(response);
            } catch (error) {
                console.error('결제 승인 실패:', error);

                router.push('/payments/fail'); 
            } finally {
                setIsLoading(false);
            }
        };

        confirm();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">카드 등록중입니다. 잠시만 기다려주세요.</p>
            </div>
        );
    }
}