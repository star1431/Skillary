// CreatorSettlementTable.js (예시)
export default function CreatorSettlementTable({ settlements }) {
  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">기간</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 금액</th>
            
            {/* 1. 헤더 추가 */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">플랫폼 수수료</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">실 수령액(Net)</th>
            
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">정산 상태</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {settlements.map((item) => (
            <tr key={item.creatorSettlementId}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.startAt} ~ {item.endAt}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.totalAmount.toLocaleString()}원
              </td>
              
              {/* 2. 데이터 셀 추가 - DTO 필드명에 맞춤 */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">
                -{item.platformFee.toLocaleString()}원
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                {item.netAmount.toLocaleString()}원
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.isSettled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {item.isSettled ? '정산 완료' : '정산 대기'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}