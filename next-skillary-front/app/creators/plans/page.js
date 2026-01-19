"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  pagingSubscriptionPlans,     // 크리에이터가 생성한 플랜 목록 조회 API
  deleteSubscriptionPlan,          // 플랜 삭제 API
} from '@/api/subscriptions'; 
import Loading from '@/components/Loading';

export default function Plans() {
  const [plans, setPlans] = useState([]); // 크리에이터가 만든 플랜 목록
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. 내가 만든 플랜 목록 불러오기
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await pagingSubscriptionPlans();
      // response 예시: [{ id: 1, name: '베이직', price: 5000, active: true, subscriberCount: 12 }, ...]
      setPlans(response || []);
    } catch (error) {
      console.error("플랜 목록 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // 2. 플랜 삭제 핸들러
  const handleDeletePlan = async (planId) => {
    if (!confirm("이 플랜을 삭제하시겠습니까? 기존 구독자가 있는 경우 주의가 필요합니다.")) return;

    try {
      setLoading(true);
      await deleteSubscriptionPlan(planId);
      alert('플랜이 삭제되었습니다.');
      fetchPlans();
    } catch (e) {
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 3. 신규 플랜 생성 페이지로 이동 (또는 모달 열기)
  const handleCreatePlan = () => {
    router('/plans/create');
  };

  if (loading) return <Loading loadingMessage='플랜 목록을 불러오는 중입니다...' />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* 헤더 영역 */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">구독 플랜 관리</h1>
            <p className="text-gray-600 mt-1">구독자들에게 제공할 멤버십 플랜을 설정하세요.</p>
          </div>
          {/* 플랜이 있을 때 상단에 표시될 생성 버튼 */}
          {plans.length > 0 && (
            <button 
              onClick={handleCreatePlan}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm"
            >
              새 플랜 추가
            </button>
          )}
        </div>

        {/* 플랜 리스트 영역 */}
        <div className="grid gap-4">
          {plans.length > 0 ? (
            plans.map((plan) => (
              <div key={plan.id} className="bg-white p-6 rounded-2xl border border-gray-200 flex justify-between items-center shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                    {plan.active ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">판매중</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">중단됨</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">
                    월 {plan.price.toLocaleString()}원 · 구독자 {plan.subscriberCount}명
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.location.href = `/plans/edit/${plan.id}`}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    수정
                  </button>
                  <button 
                    onClick={() => handleDeletePlan(plan.id)}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          ) : (
            /* 플랜이 하나도 없을 때 (Empty State) */
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-full mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">생성된 플랜이 없습니다</h2>
              <p className="text-gray-500 mb-8">첫 번째 구독 플랜을 만들고 수익 창출을 시작해보세요.</p>
              <button 
                onClick={handleCreatePlan}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
              >
                지금 바로 플랜 만들기
              </button>
            </div>
          )}
        </div>

        {/* 하단 팁 */}
        <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100">
          <h4 className="text-blue-800 font-bold mb-2 text-sm">💡 크리에이터 팁</h4>
          <ul className="text-blue-700 text-xs space-y-2 opacity-80">
            <li>• 플랜의 가격을 수정하면 기존 구독자들에게 영향을 줄 수 있습니다.</li>
            <li>• 혜택을 명확히 적을수록 구독 전환율이 높아집니다.</li>
            <li>• 플랜은 최대 5개까지 생성하는 것을 권장합니다.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}