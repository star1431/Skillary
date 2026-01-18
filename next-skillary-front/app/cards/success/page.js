'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createCard } from '@/api/payments';
import Loading from '@/components/Loading'

export default function Success() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const authKey = searchParams.get('authKey');
    const customerKey = searchParams.get('customerKey');

    useEffect(() => {
        const registerCard = async () => {
            if (!authKey || !customerKey) return;
            try {
                await createCard(customerKey, authKey);
                router.replace('/cards/list');
            } catch (error) {
                router.push(`/payments/fail?code=${400}&errorMsg=${'등록 실패'}`);
            }
        };

        registerCard();
    }, [authKey, customerKey]);

    return <Loading loadingMessage='카드 등록중입니다. 잠시만 기다려주세요.'/>
}