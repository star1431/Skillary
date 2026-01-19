"use client";

import { useState, useEffect } from 'react';
import { getSubscriptions, unsubscribe } from '@/api/subscriptions';
import Loading from '@/components/Loading';

// 컴포넌트 외부에서 관리하는 것이 렌더링 성능에 좋습니다.
const STATUS_MAP = {
  ACTIVE: {
    label: "이용 중",
    className: "bg-blue-50 text-blue-600",
    dateLabel: "다음 결제 예정일",
  },
  INACTIVE: {
    label: "해지 예약",
    className: "bg-orange-50 text-orange-600",
    dateLabel: "이용 종료 예정일",
  },
  CANCELED: {
    label: "기간 만료",
    className: "bg-gray-100 text-gray-500",
    dateLabel: "만료일",
  },
  FAILED: {
    label: "결제 실패",
    className: "bg-red-50 text-red-600",
    dateLabel: "결제 재시도 예정일",
  }
};

export default function MySubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMySubscriptions = async () => {
    try {
      setLoading(true);
      const response = await getSubscriptions(0, 10);
      setSubscriptions(response.content || []);
    } catch (error) {
      console.error("구독 플랜 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySubscriptions();
  }, []);

  const handleUnsubscribe = async (planId, planName) => {
    if (!confirm(`[${planName}] 구독을 해지하시겠습니까?\n해지 후에도 이번 결제 주기까지는 혜택이 유지됩니다.`)) return;

    try {
      setLoading(true);
      const success = await unsubscribe(planId);
      if (success) {
        alert('구독 해지가 완료되었습니다.');
        await fetchMySubscriptions();
      }
    } catch (error) {
      console.error("해지 중 오류 발생:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading loadingMessage='구독 내역을 불러오는 중입니다...' />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-gray-900">내 구독 관리</h1>
          <p className="text-gray-600 mt-2">현재 이용 중인 서비스와 구독 정보를 확인하세요.</p>
        </div>

        <div className="space-y-4">
          {subscriptions.length > 0 ? (
            subscriptions.map((sub) => {
              // ✅ 백엔드 Enum 값에 맞는 매핑 데이터 추출
              const statusConfig = STATUS_MAP[sub.status] || STATUS_MAP.CANCELED;

              return (
                <div key={sub.subscribeId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">{sub.creatorDisplayName}</h3>
                          {/* ✅ 상태별 뱃지 스타일/라벨 적용 */}
                          <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${statusConfig.className}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm">{sub.planName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">₩{sub.price?.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">/ 월결제</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center text-sm">
                      <div>
                        {/* ✅ 상태별 날짜 설명(Label) 적용 */}
                        <span className="text-gray-500">{statusConfig.dateLabel}: </span>
                        <span className="font-semibold text-gray-700">{sub.endAt}</span>
                      </div>
                      
                      {/* ✅ 이용 중(ACTIVE)일 때만 해지 버튼 노출 */}
                      {sub.status === 'ACTIVE' && (
                        <button 
                          onClick={() => handleUnsubscribe(sub.subscribeId, sub.planName)}
                          className="text-red-500 font-medium hover:text-red-700 transition"
                        >
                          구독 해지
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 text-gray-400 rounded-full mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">현재 구독 중인 플랜이 없습니다</h2>
              <p className="text-gray-500 mb-8">다양한 크리에이터를 구독하고 특별한 혜택을 누려보세요!</p>
              <button 
                onClick={() => window.location.href = '/creators'}
                className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition"
              >
                크리에이터 둘러보기
              </button>
            </div>
          )}
        </div>

        <div className="mt-10 p-5 bg-gray-100 rounded-2xl">
          <p className="text-xs text-gray-500 leading-relaxed">
            • 구독 해지 시, 이미 결제된 이번 달 혜택은 기간 종료일까지 유지됩니다.<br/>
            • 결제 수단 변경은 결제 설정 메뉴에서 가능합니다.<br/>
            • 환불 관련 문의는 고객센터를 이용해 주세요.
          </p>
        </div>

      </div>
    </div>
  );
}