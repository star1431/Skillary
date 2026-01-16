'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import { confirmBillingPay, planOrder, restartOrder } from '@/api/payments';

export default function BillingOrderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get('orderId');
  const planId = searchParams.get('planId');

  const { data: orderResponse, error, isLoading } = useSWR(
    (!orderId && !planId) ? null : ['plan-order', orderId, planId],

    async () => {
      if (orderId) return await restartOrder(orderId)
      if (planId) return await planOrder(planId);
      return null;
    }
  )

  if (isLoading) return <div className="p-10 text-center">로딩 중...</div>;

  // 구독 플랜 또는 콘텐츠가 없으면 에러 표시
  if (!orderResponse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">주문 정보를 찾을 수 없습니다</h1>
          <Link href="/creators" className="text-blue-600 hover:underline">
            크리에이터 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    try {
      const result = await confirmBillingPay(
        orderResponse.customerKey,
        orderResponse.orderId,
        orderResponse.planName,
        orderResponse.price
      );
      console.log('result', result);
      setOrderResponse(null);
      const paymentKey = result.paymentKey;
      const orderId = result.orderId;
      const price = result.amount;
      router.push(`/payments/success?paymentKey=${paymentKey}&orderId=${orderId}&price=${price}`);
    } catch (e) {
      if (e.code && e.code === "USER_CANCEL")
        console.log("사용자가 결제창을 닫음");

      router.push('/payments/fail');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">주문 정보</h1>
          <p className="text-gray-600">주문 내용을 확인하고 결제를 진행해주세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 주문 상세 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 크리에이터/콘텐츠 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-black mb-4">'구독 콘텐츠'</h2>
              <div className="flex gap-4">
                <div className={`w-24 h-24 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0`}>
                  <div className="text-4xl">채워야함1</div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-black mb-2">채워야함2</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">채워야함3</p>
                </div>
              </div>
            </div>

            {/* 구독 플랜 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-black mb-4">구독 플랜</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-black mb-1">
                      채워야함11111
                    </h3>
                    <p className="text-sm text-gray-600">매월 자동 갱신</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-black">₩ 채워야함8</p>
                    <p className="text-xs text-gray-500">채워야함9</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>모든 콘텐츠 무제한 이용</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>신규 콘텐츠 자동 업데이트</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>언제든지 구독 취소 가능</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 결제 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-black mb-4">결제 정보</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">구독료</span>
                  <span className="text-black">₩채워야함3</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-semibold text-black">총 결제금액</span>
                  <span className="text-xl font-bold text-black">₩채워야함4</span>
                </div>
              </div>
            </div>
          </div>

          {/* 주문 요약 및 결제 버튼 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold text-black mb-4">주문 요약</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">구독 플랜</p>
                  <p className="font-semibold text-black">채워야함5</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">결제 주기</p>
                  <p className="font-semibold text-black">매월 자동 결제</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">다음 결제일</p>
                  <p className="font-semibold text-black">다음 달 오늘</p>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">총 금액</span>
                    <span className="text-2xl font-bold text-black">₩{orderResponse.price}</span>
                  </div>
                  <p className="text-xs text-gray-500">매월 동일 금액이 자동으로 결제됩니다</p>
                </div>
              </div>
              <button
                onClick={handlePayment}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition mb-4"
              >
                결제하기
              </button>
              <Link
                href={`/order/plan`}
                className="block w-full text-center py-2 text-gray-600 hover:text-black transition text-sm"
              >
                취소
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
