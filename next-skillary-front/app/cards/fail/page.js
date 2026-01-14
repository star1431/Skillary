"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CardFailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">카드 등록 실패</h1>
          <p className="text-gray-500 mb-8 text-sm">
            카드 정보를 등록하는 중 문제가 발생했습니다.
          </p>

          <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left border border-gray-100">
            <div className="mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">에러 코드</span>
              <p className="text-sm font-mono text-red-600 font-semibold">{errorCode || 'UNKNOWN_ERROR'}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">상세 사유</span>
              <p className="text-sm text-gray-700 leading-relaxed">
                {errorMessage || '알 수 없는 오류가 발생했습니다. 다시 시도해 주세요.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/cards/register')}
              className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all active:scale-95"
            >
              다시 시도하기
            </button>
            <Link
              href="/auth/my-page"
              className="w-full bg-white text-gray-500 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all border border-gray-200 block"
            >
              마이페이지로 이동
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