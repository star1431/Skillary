'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, use, useEffect, useRef } from 'react';
import { creators } from '../components/data';
import PopularCard from '../../components/PopularCard';
import { getContentsByCreator } from '../../api/contents';

export default function CreatorProfilePage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const modalRef = useRef(null);
  const creator = creators.find(item => item.id === parseInt(id));

  // TODO: 실제 사용자가 크리에이터 소유자인지 확인 (임시로 creatorId가 1인 경우 소유자로 가정)
  const isOwner = creator && creator.id === 1; // 임시: 실제로는 인증 정보에서 확인

  if (!creator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">크리에이터를 찾을 수 없습니다</h1>
          <Link href="/creators" className="text-blue-600 hover:underline">
            크리에이터 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const [creatorContents, setCreatorContents] = useState([]);
  const [loadingContents, setLoadingContents] = useState(true);

  // 크리에이터의 콘텐츠 로드
  useEffect(() => {
    async function loadCreatorContents() {
      if (!creator) return;
      
      setLoadingContents(true);
      try {
        const data = await getContentsByCreator(creator.id, 0, 20);
        const apiContents = data.content || [];
        setCreatorContents(apiContents);
      } catch (err) {
        console.error('크리에이터 콘텐츠 로드 실패:', err);
        setCreatorContents([]);
      } finally {
        setLoadingContents(false);
      }
    }
    loadCreatorContents();
  }, [creator]);

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}. ${month}. ${day}.`;
  };

  // 가격 포맷팅
  const formatPrice = (price) => {
    if (!price) return null;
    return `₩${price.toLocaleString()}`;
  };

  // 배지 타입 결정
  const getBadgeInfo = (content) => {
    if (content.planId) {
      return { type: 'badge', text: '구독자 전용' };
    } else if (content.price) {
      return { type: 'price', text: formatPrice(content.price) };
    } else {
      return { type: 'badge', text: '무료' };
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsSubscriptionModalOpen(false);
      }
    };

    if (isSubscriptionModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isSubscriptionModalOpen]);

  const handleSubscribe = () => {
    setIsSubscriptionModalOpen(true);
    const order = requestPaymentOrder();
    console.log(order);
  };

  const handleSelectPlan = (plan) => {
    // 구독 플랜 선택 시 주문 페이지로 이동
    setIsSubscriptionModalOpen(false);
    router.push(`/orders?creatorId=${order.orderId}&price=${price}&planName=${order.planName}`);
  };

  const handleCreateContent = () => {
    // 컨텐츠 생성 페이지로 이동
    router.push(`/creators/${creator.id}/create`);
  };

  const handleEditProfile = () => {
    // 크리에이터 프로필 수정 페이지로 이동
    router.push(`/creators/${creator.id}/update`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 배너 섹션 */}
      <div className={`bg-gradient-to-br ${creator.gradientFrom} ${creator.gradientTo} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* 수정 버튼 (소유자일 때만 표시) */}
          {isOwner && (
            <div className="absolute top-4 right-4">
              <button
                onClick={() => handleEditProfile()}
                className="px-4 py-2 bg-white bg-opacity-90 text-black rounded-lg font-semibold hover:bg-opacity-100 transition text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                수정
              </button>
            </div>
          )}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            {/* 프로필 이미지 */}
            <div className="flex-shrink-0">
              <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full bg-white shadow-xl flex items-center justify-center text-6xl md:text-7xl border-4 border-white`}>
                {creator.emoji}
              </div>
            </div>

            {/* 크리에이터 정보 */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{creator.name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <span className="inline-block bg-white bg-opacity-90 text-gray-700 text-sm px-4 py-1.5 rounded-full font-medium">
                  {creator.category}
                </span>
                <span className="text-white text-sm opacity-90">{creator.joinedDate} 가입</span>
              </div>
              
              {/* 통계 정보 */}
              <div className="flex items-center justify-center md:justify-start gap-6 mb-6">
                <div>
                  <div className="text-2xl font-bold text-white">{creator.subscribers}</div>
                  <div className="text-sm text-white opacity-80">구독자</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{creator.contentsCount}개</div>
                  <div className="text-sm text-white opacity-80">콘텐츠</div>
                </div>
              </div>

              {/* 구독 버튼 및 나의 플랜 버튼 */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <button
                  onClick={() => handleSubscribe()}
                  className={`px-6 py-3 rounded-lg font-semibold transition ${
                    isSubscribed
                      ? 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  {isSubscribed ? '구독 중' : '구독하기'}
                </button>

                <button
                  onClick={() => router.push('/creators/plans')}
                  className="px-6 py-3 rounded-lg font-semibold bg-black bg-opacity-30 text-white border border-white border-opacity-30 hover:bg-opacity-40 transition"
                >
                  나의 플랜
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 소개 섹션 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-700 leading-relaxed text-center md:text-left">
            {creator.bio}
          </p>
        </div>
      </div>

      {/* 콘텐츠 섹션 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-black mb-1">컨텐츠</h2>
            <p className="text-gray-500 text-sm">{creatorContents.length}개의 컨텐츠</p>
          </div>
          <button
            onClick={() => handleCreateContent()}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            컨텐츠 생성
          </button>
        </div>

        {loadingContents ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black"></div>
          </div>
        ) : creatorContents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {creatorContents.map((content) => {
              const badgeInfo = getBadgeInfo(content);
              return (
                <PopularCard
                  key={content.contentId}
                  id={content.contentId}
                  title={content.title}
                  description={content.description}
                  author={content.creatorName}
                  profileImageUrl={content.profileImageUrl}
                  date={formatDate(content.createdAt)}
                  badge={badgeInfo.text}
                  badgeType={badgeInfo.type}
                  price={badgeInfo.type === 'price' ? badgeInfo.text : null}
                  thumbnailUrl={content.thumbnailUrl}
                  category={content.category}
                  viewCount={content.viewCount || 0}
                  likeCount={content.likeCount || 0}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-50 mb-4">
              <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">아직 컨텐츠가 없습니다</h3>
            <p className="text-gray-500 text-sm">곧 새로운 컨텐츠가 업로드될 예정입니다.</p>
          </div>
        )}
      </div>

      {/* 구독 플랜 모달 */}
      {isSubscriptionModalOpen && creator.subscriptionPlans && creator.subscriptionPlans.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8">
              {/* 모달 헤더 */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-black mb-2">구독 플랜 선택</h2>
                  <p className="text-gray-600">크리에이터가 제공하는 구독 플랜을 선택하세요</p>
                </div>
                <button
                  onClick={() => setIsSubscriptionModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 구독 플랜 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {creator.subscriptionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-black transition cursor-pointer"
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-black mb-2">{plan.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-black">{plan.price.toLocaleString()}</span>
                        <span className="text-gray-600">원</span>
                        <span className="text-gray-500 text-sm">/{plan.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
                    >
                      구독하기
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
