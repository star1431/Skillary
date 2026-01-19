"use client";

import Link from 'next/link';

export default function CardFailPage({
  errorCode = 'UNKNOWN',
  errorMessage = '알 수 없는 오류로 인해 작업이 거부되었습니다.',
  failUrl = '/',
  failUrlDesc = 'failUrlDesc 설명을 작성해주세요'
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8 text-center">

          {/* 실패 아이콘 */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          {/* 타이틀 */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h1>
          
          {/* 내용 */}
          <p className="text-gray-500 mb-8 text-sm">오류 페이지</p>

          {/* 에러 상세 박스 */}
          <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left border border-gray-100">
            <div className="mb-3">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">에러 코드</span>
              <p className="text-sm font-mono text-red-600 font-semibold">{errorCode}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">상세 사유</span>
              <p className="text-sm text-gray-700 leading-relaxed">
                {errorMessage}
              </p>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.back()}
              className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all active:scale-[0.98]"
            >
              다시 시도하기
            </button>
            <Link
              href={failUrl}
              className="w-full bg-white text-gray-500 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all border border-gray-200"
            >
              {failUrlDesc}
            </Link>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            도움이 필요하시면 고객센터로 문의해 주세요.
          </p>
        </div>
      </div>
    </div>
  );
}