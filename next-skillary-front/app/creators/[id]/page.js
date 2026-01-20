'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, use, useEffect, useRef } from 'react';
import { getContentsByCreator } from '../../api/contents';
import { getCreatorDetail } from '../../api/creator';
import { getCurrentUser } from '../../api/users';
import { apiGetMyCreator } from '../../api/my-page';
import { getSubscriptions } from '../../api/subscriptions';
import { getSubscriptionPlan } from '../../api/subscriptions';
import { unsubscribe } from '../../api/subscriptions';
import CreatorBanner from './components/CreatorBanner';
import CreatorIntroduction from './components/CreatorIntroduction';
import CreatorContents from './components/CreatorContents';
import SubscriptionPlanModal from './components/SubscriptionPlanModal';

export default function CreatorProfilePage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [planModal, setPlanModal] = useState(false);
  const [creator, setCreator] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentCreator, setCurrentCreator] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [creatorContents, setCreatorContents] = useState([]);
  const [loadingContents, setLoadingContents] = useState(true);

  // 크리에이터 정보 및 인증 정보 로드
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // 크리에이터 상세 정보 로드
        const creatorData = await getCreatorDetail(parseInt(id));
        setCreator(creatorData);

        // 현재 사용자 정보 로드 (로그인 상태 확인)
        try {
          const userData = await getCurrentUser();
          setCurrentUser(userData);

          // 현재 크리에이터 정보 로드 (본인인지 확인)
          try {
            const myCreatorData = await apiGetMyCreator();
            setCurrentCreator(myCreatorData);
            setIsOwner(myCreatorData && myCreatorData.creatorId === creatorData.creatorId);

            // 구독 상태 및 플랜
            if (!isOwner) {
              try {
                // 구독 목록
                const subscriptions = await getSubscriptions(0, 100);
                const subscribedPlans = subscriptions.content || [];
                
                // 해당 크리에이터의 플랜에 구독 중인지 확인
                const hasActiveSubscription = subscribedPlans.some(
                  (sub) => sub.creatorDisplayName === creatorData.displayName && sub.status === 'ACTIVE'
                );
                setIsSubscribed(hasActiveSubscription);

                // 구독 플랜 로드
                if (creatorData.planIds && creatorData.planIds.length > 0) {
                  // 각 planId로 플랜 정보 가져오기
                  const planPromises = creatorData.planIds.map(async (planId) => {
                    try {
                      const plan = await getSubscriptionPlan(planId);
                      // 해당 플랜의 구독 상태 확인 (planName과 creatorDisplayName으로 매칭)
                      const subscription = subscribedPlans.find(
                        (sub) => sub.planName === plan.planName && 
                                 sub.creatorDisplayName === creatorData.displayName && 
                                 sub.status === 'ACTIVE'
                      );
                      return {
                        ...plan,
                        isSubscribed: !!subscription,
                        subscribeId: subscription?.subscribeId
                      };
                    } catch (err) {
                      console.error(`플랜 ${planId} 로드 실패:`, err);
                      return null;
                    }
                  });
                  const plans = await Promise.all(planPromises);
                  // null이 아닌 플랜만 필터링
                  setSubscriptionPlans(plans.filter(plan => plan !== null));
                } else {
                  setSubscriptionPlans([]);
                }
              } catch (err) {
                console.error('구독 상태 확인 실패:', err);
                setSubscriptionPlans([]);
              }
            } else {
              setSubscriptionPlans([]);
            }
          } catch (err) {
            // 크리에이터가 아닌 경우 (정상)
            console.log('현재 사용자는 크리에이터가 아닙니다.');
          }
        } catch (err) {
          // 로그인하지 않은 경우 (정상)
          console.log('로그인하지 않은 사용자입니다.');
        }
      } catch (err) {
        console.error('크리에이터 정보 로드 실패:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  // 크리에이터의 콘텐츠 로드
  useEffect(() => {
    async function loadCreatorContents() {
      if (!creator) return;
      
      setLoadingContents(true);
      try {
        const data = await getContentsByCreator(creator.creatorId, 0, 20);
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


  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black"></div>
      </div>
    );
  }

  // 크리에이터를 찾을 수 없을 때
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

  const handleSubscribe = () => {
    // 비로그인 사용자 체크
    if (!currentUser) {
      const confirmLogin = window.confirm('로그인이 필요합니다.\n로그인 화면으로 이동하시겠습니까?');
      if (confirmLogin) {
        router.push('/auth/login');
      }
      return;
    }

    if (subscriptionPlans.length > 0) {
      setPlanModal(true);
    } else {
      alert('구독 가능한 플랜이 없습니다.');
    }
  };


  const handleCreateContent = () => {
    // 컨텐츠 생성 페이지로 이동
    router.push(`/creators/${creator.creatorId}/create`);
  };

  const handleEditProfile = () => {
    // 크리에이터 프로필 수정 페이지로 이동
    router.push('/auth/my-page/setting');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 배너 섹션 */}
      <CreatorBanner
        creator={creator}
        isOwner={isOwner}
        currentUser={currentUser}
        isSubscribed={isSubscribed}
        contentsCount={creatorContents.length}
        onSubscribe={handleSubscribe}
        onEditProfile={handleEditProfile}
        hasSubscriptionPlans={subscriptionPlans.length > 0}
      />

      {/* 소개 섹션 */}
      <CreatorIntroduction introduction={creator.introduction} />

      {/* 콘텐츠 섹션 */}
      <CreatorContents
        creator={creator}
        creatorContents={creatorContents}
        loadingContents={loadingContents}
        isOwner={isOwner}
        onCreateContent={handleCreateContent}
        formatDate={formatDate}
        getBadgeInfo={getBadgeInfo}
      />

      {/* 구독 플랜 모달 */}
      <SubscriptionPlanModal
        isOpen={planModal}
        subscriptionPlans={subscriptionPlans}
        onClose={() => setPlanModal(false)}
      />
    </div>
  );
}
