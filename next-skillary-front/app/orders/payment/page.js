'use client';

import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';

import { paymentOrder, retrieveOrder } from '@/api/payments';
import { confirmSinglePay } from '@/api/tossPayments';
import Loading from '@/components/Loading';
import CardFailPage from '@/components/CardFailPage';

import OrderHeader from '../components/OrderHeader';
import OrderSummary from '../components/OrderSummary';
import OrderFooter from '../components/OrderFooter';
import OrderDescriptionSection from '../components/OrderDescriptionSection';
import OrderPayExecution from '../components/OrderPayExecution';
import OrderLayout from '../components/OrderLayout';


export default function PaymentOrderPage() {
  const searchParams = useSearchParams();

  const orderId = searchParams.get('orderId');
  const contentId = searchParams.get('contentId');

  const { data: orderResponse, error, isLoading } = useSWR(
    (orderId || contentId) ? ['single-order', orderId, contentId] : null,
    async () => {
      if (orderId) return await retrieveOrder(orderId);
      if (contentId) return await paymentOrder(contentId);
      return null;
    }
  );

  if (isLoading) 
    return <Loading loadingMessage='주문 정보를 로딩중입니다...'/>

  if (!orderResponse)
    return <CardFailPage
        errorCode='404'
        errorMessage='NOT_FOUND'
        failUrl='/orders/list'
        failUrlDesc='주문 목록으로 돌아가기'/>

  const handlePayment = async () => {
    try {
      await confirmSinglePay(
        orderResponse.customerKey,
        orderResponse.orderId,
        orderResponse.contentTitle,
        orderResponse.price
      );
    } catch (e) {
      router.push(`/payments/fail?code=${e.code || 400}&message=${e.message}`);
    }
  };

  return (
      <>
        <OrderLayout
          orderHeader={ <OrderHeader /> }
          orderSummary={
            <OrderSummary
              title='싱글 콘텐츠'
              icon='📦'
              contentTitle='콘텐츠 제목'
              description='콘텐츠 설명'
              gradientColors='from-blue-400 to-purple-500'
            />
          }
          orderDescription={
            <OrderDescriptionSection
              planName={orderResponse.contentTitle}
              price={orderResponse.price}
            />
          }
          orderFooter={
            <OrderFooter
              subscriptionFee={orderResponse.price}
              totalAmount={orderResponse.price}
            />
          }
          orderPayExecution={
            <OrderPayExecution
              sectionTitle='주문 요약'
              planName={orderResponse.contentTitle}
              paymentCycle='단건 결제'
              totalAmount={orderResponse.price}
              onPaymentClick={handlePayment}
              isSticky={true}
            />
          }/>
        </>
  );
}
