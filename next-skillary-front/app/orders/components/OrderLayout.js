export default function OrderLayout({
    orderHeader,
    orderSummary,
    orderDescription,
    orderFooter,
    orderPayExecution
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 주문 상세 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 주문 헤더 */}
            {orderHeader}
            {/* 주문 상품 정보 */}
            {orderSummary}
            {/* 주문 정보 */}
            {orderDescription}
            {/* 결제 정보 */}
            {orderFooter}
          </div>

          {/* 오른쪽: 주문 요약 및 결제 버튼 */}
          <div className="lg:col-span-1">
            {orderPayExecution}
          </div>
        </div>
      </div>
    </div>
  );
}