'use client';

export default function SettlementTable({ settlementRuns }) {
  if (settlementRuns.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-20 text-center">
        <p className="text-gray-500">실행된 정산 기록이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">ID</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">정산 기간</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">총 정산액</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-900">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {settlementRuns.map((run) => (
              <tr key={run.runId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-500">#{run.runId}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-black">
                    {run.startAt} ~ {run.endAt}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-black">
                  ₩{run.totalAmount.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      run.isSettled
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {run.isSettled ? '지급 완료' : '정산 준비'}
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