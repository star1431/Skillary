'use client';

import Link from 'next/link';

export default function CreatorSettlementHeader({ currentPage, totalPages }) {
  return (
    <div className="mb-8">
      <Link
        href="/auth/my-page"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition mb-4"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        마이페이지로 돌아가기
      </Link>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">내 정산 내역</h1>
          <p className="text-gray-600">활동하신 콘텐츠에 대한 월별 정산 내역입니다.</p>
        </div>
        <div className="text-sm text-gray-500 font-medium">
          {totalPages > 0 ? `${currentPage + 1} / ${totalPages} 페이지` : ''}
        </div>
      </div>
    </div>
  );
}