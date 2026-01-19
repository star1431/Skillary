'use client';

import { useRouter } from 'next/navigation';

export default function CreatorSettlementTable({ settlements }) {
  const router = useRouter();

  if (settlements.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-20 text-center">
        <div className="text-5xl mb-4">💰</div>
        <p className="text-gray-500 font-medium">아직 정산 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">정산 번호</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">대상 기간</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">내 정산 금액</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {settlements.map((item) => (
              <tr 
                key={item.runId} 
                onClick={() => router.push(`/settlements/${item.runId}`)} // 클릭 시 이동
                className="hover:bg-gray-50 transition-colors cursor-pointer" // 커서 스타일 추가
              >
                <td className="px-6 py-4 text-sm text-gray-500">#{item.runId}</td>
                <td className="px-6 py-4 text-sm font-medium text-black">
                  {item.startAt} ~ {item.endAt}
                </td>
                <td className="px-6 py-4 text-lg font-bold text-black">
                  ₩{item.totalAmount.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    item.isSettled ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.isSettled ? '지급 완료' : '정산 대기'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}