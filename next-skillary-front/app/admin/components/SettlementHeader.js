'use client';

export default function SettlementHeader({ currentPage, totalPages }) {
  return (
    <div className="mb-8 flex justify-between items-end">
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">전체 정산 실행 기록</h1>
        <p className="text-gray-600">시스템에서 실행된 월별 정산 배치 작업 목록입니다.</p>
      </div>
      <div className="text-sm text-gray-500 font-medium">
        총 {totalPages} 페이지 중 {currentPage + 1} 페이지
      </div>
    </div>
  );
}