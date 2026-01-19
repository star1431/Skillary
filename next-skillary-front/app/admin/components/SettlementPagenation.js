'use client';

export default function SettlementPagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex justify-center gap-2">
      <button
        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
        disabled={currentPage === 0}
        className="px-4 py-2 border rounded-md bg-white text-sm disabled:opacity-50 transition-opacity hover:bg-gray-50"
      >
        이전
      </button>
      <button
        onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
        disabled={currentPage === totalPages - 1}
        className="px-4 py-2 border rounded-md bg-white text-sm disabled:opacity-50 transition-opacity hover:bg-gray-50"
      >
        다음
      </button>
    </div>
  );
}