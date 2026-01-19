import Link from "next/link";

export default function OrderPayExecution({
  sectionTitle = '주문 요약',
  planName = '베이직 플랜',
  paymentCycle = '매월 자동 결제',
  paymentCycleLabel = '결제 주기',
  nextPaymentDate = '다음 달 오늘',
  nextPaymentDateLabel = '다음 결제일',
  totalAmount = 0,
  totalAmountLabel = '총 금액',
  recurringNotice = '매월 동일 금액이 자동으로 결제됩니다',
  paymentButtonText = '결제하기',
  cancelButtonText = '취소',
  cancelLink = '/order/plan',
  onPaymentClick,
  isSticky = true
}) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${isSticky ? 'sticky top-8' : ''}`}>
      <h2 className="text-xl font-bold text-black mb-4">{sectionTitle}</h2>
      <div className="space-y-4 mb-6">
        <div>
          <p className="text-sm text-gray-600 mb-1">구독 플랜</p>
          <p className="font-semibold text-black">{planName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">{paymentCycleLabel}</p>
          <p className="font-semibold text-black">{paymentCycle}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">{nextPaymentDateLabel}</p>
          <p className="font-semibold text-black">{nextPaymentDate}</p>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">{totalAmountLabel}</span>
            <span className="text-2xl font-bold text-black">₩{totalAmount}</span>
          </div>
          <p className="text-xs text-gray-500">{recurringNotice}</p>
        </div>
      </div>
      <button
        onClick={onPaymentClick}
        className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition mb-4"
      >
        {paymentButtonText}
      </button>
      <Link
        href={cancelLink}
        className="block w-full text-center py-2 text-gray-600 hover:text-black transition text-sm"
      >
        {cancelButtonText}
      </Link>
    </div>
  );
}