'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSettlementDetail } from '@/api/settlements';
import Loading from '@/components/Loading';
import CardFailPage from '@/components/CardFailPage'; // 경로에 맞춰 임포트

export default function SettlementDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // 에러 상태 관리

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getSettlementDetail(id);
        setDetail(data);
      } catch (err) {
        console.error('상세 정보 로드 실패:', err);
        // 에러 객체를 상태에 저장
        setError({
          code: err.status || 'FETCH_ERROR',
          message: err.message || '정산 정보를 불러오는 중 서버 응답이 없습니다.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  // 1. 로딩 중일 때
  if (isLoading) {
    return <Loading loadingMessage="정산 상세 정보를 가져오고 있습니다..." />;
  }

  // 2. 에러 발생 시 (CardFailPage 활용)
  if (error) {
    return (
      <CardFailPage 
        errorCode={error.code}
        errorMessage={error.message}
        failUrl="/settlements"
        failUrlDesc="목록으로 돌아가기"
      />
    );
  }

  // 3. 데이터가 정상적일 때
  if (!detail) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-black mb-6 flex items-center gap-2">
          ← 뒤로 가기
        </button>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold mb-6 font-sans text-black">정산 상세 내역</h1>
          
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-50">
              <span className="text-gray-500">정산 번호</span>
              <span className="font-medium text-black">#{detail.runId}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-50">
              <span className="text-gray-500">정산 기간</span>
              <span className="font-medium text-black">{detail.startAt} ~ {detail.endAt}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-50">
              <span className="text-gray-500">상태</span>
              <span className={`font-semibold ${detail.isSettled ? 'text-green-600' : 'text-yellow-600'}`}>
                {detail.isSettled ? '지급 완료' : '정산 대기'}
              </span>
            </div>
            <div className="flex justify-between py-6 pt-8">
              <span className="text-lg font-semibold text-black">최종 정산 금액</span>
              <span className="text-2xl font-bold text-blue-600">₩{detail.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}