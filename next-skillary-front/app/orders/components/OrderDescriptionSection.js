export default function OrderDescriptionSection({
  sectionTitle = '구독 플랜',
  planName = '베이직 플랜',
  renewalText = '매월 자동 갱신',
  price = 0,
  priceSubtext = '월 요금',
  benefits = [
    '모든 콘텐츠 무제한 이용',
    '신규 콘텐츠 자동 업데이트',
    '언제든지 구독 취소 가능'
  ]
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-black mb-4">{sectionTitle}</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold text-black mb-1">
              {planName}
            </h3>
            <p className="text-sm text-gray-600">{renewalText}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-black">₩ {price.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{priceSubtext}</p>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4 space-y-2">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}