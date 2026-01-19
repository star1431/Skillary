"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  pagingSubscriptionPlans,
  deleteSubscriptionPlan,
} from '@/api/subscriptions'; 
import Loading from '@/components/Loading';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await pagingSubscriptionPlans();
      // 백엔드 Page 객체 대응 (content가 있으면 사용, 없으면 전체 사용)
      const data = response.content || response;
      setPlans(data || []);
    } catch (error) {
      console.error("플랜 목록 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDeletePlan = async (planId) => {
    if (!confirm("이 플랜을 삭제하시겠습니까?")) return;
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

  const handleCreatePlan = () => {
    // router는 함수가 아니라 객체이므로 .push()를 사용해야 합니다.
    router.push('/subscriptions/plans/create'); 
  };

  if (loading) return <Loading loadingMessage='플랜 목록을 불러오는 중입니다...' />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">구독 플랜 관리</h1>
            <p className="text-gray-600 mt-1">구독자들에게 제공할 멤버십 플랜을 설정하세요.</p>
          </div>
          {plans.length > 0 && (
            <button 
              onClick={handleCreatePlan}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm"
            >
              새 플랜 추가
            </button>
          )}
        </div>

        <div className="grid gap-4">
          {plans.length > 0 ? (
            plans.map((plan) => (
              <div key={plan.planId} className="bg-white p-6 rounded-2xl border border-gray-200 flex justify-between items-center shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {/* 변수명이 DTO와 동일하게 isActive인지 확인 필요 (보통 JSON 변환 시 isActive) */}
                    <h3 className="text-lg font-bold text-gray-900">{plan.planName}</h3>
                    
                    {/* ✅ isActive 상태 태그 추가 */}
                    {plan.isActive ? (
                      <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-bold">
                        판매 중
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-red-50 text-red-500 text-xs rounded-full font-bold">
                        중단됨
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">
                    월 {plan.price?.toLocaleString()}원
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDeletePlan(plan.planId)}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          ) : (
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