export default function OrderFooter({
  sectionTitle = '결제 정보',
  subscriptionFee = 0,
  subscriptionFeeLabel = '구독료',
  totalAmount = 0,
  totalAmountLabel = '총 결제금액',
  additionalFees = [] // 추가 항목들 (할인, 세금 등)
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-black mb-4">{sectionTitle}</h2>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{subscriptionFeeLabel}</span>
          <span className="text-black">₩{subscriptionFee.toLocaleString()}</span>
        </div>
        
        {/* 추가 항목들 (할인, 세금 등) */}
        {additionalFees.map((fee, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-gray-600">{fee.label}</span>
            <span className={fee.isNegative ? "text-red-500" : "text-black"}>
              {fee.isNegative ? '-' : ''}₩{Math.abs(fee.amount).toLocaleString()}
            </span>
          </div>
        ))}
        
        <div className="border-t border-gray-200 pt-3 flex justify-between">
          <span className="font-semibold text-black">{totalAmountLabel}</span>
          <span className="text-xl font-bold text-black">₩{totalAmount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}