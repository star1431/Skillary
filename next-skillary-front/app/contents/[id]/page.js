'use client';

import Link from 'next/link';
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getContent, deleteContent, getDeletePreview } from '@/api/contents';
import { getCurrentUser } from '@/api/users';
import { getSubscriptionPlan } from '@/api/subscriptions';
import { formatDate } from '@/utils/formatUtils';
import ContentHead from './components/ContentHead';
import ContentBody from './components/ContentBody';
import CommentSection from './components/CommentSection';


export default function ContentDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  
  // 현재 사용자 정보 (토큰 기반 인증)
  const [currentUserId, setCurrentUserId] = useState(null); // 로그인한 사용자 ID (null이면 비로그인)

  // 콘텐츠 상세 정보 로드
  useEffect(() => {
    async function loadContent() {
      const contentId = parseInt(id);
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getContent(contentId);
        setContent(data);
      } catch (err) {
        console.error('콘텐츠 로드 실패:', err);
        setError('콘텐츠를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, [id]);

  // 현재 사용자 정보 가져오기
  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const userInfo = await getCurrentUser();
        if (userInfo) {
          setCurrentUserId(userInfo.userId);
        }
      } catch (err) {
        // 인증 정보 가져오기 실패 시 비로그인 상태로 처리
        setCurrentUserId(null);
      }
    }
    loadCurrentUser();
  }, []);

  // 구독 플랜 정보 가져오기
  useEffect(() => {
    async function loadSubscriptionPlan() {
      if (content?.planId) {
        try {
          const plan = await getSubscriptionPlan(content.planId);
          setSubscriptionPlan(plan);
        } catch (err) {
          console.error('구독 플랜 정보 로드 실패:', err);
          setSubscriptionPlan(null);
        }
      }
    }
    loadSubscriptionPlan();
  }, [content?.planId]);

  // 로그인 여부 확인
  const isLoggedIn = currentUserId !== null;
  
  // 크리에이터 본인 여부 확인 (백엔드에서 isOwner로 반환)
  const isOwner = content?.isOwner || false;
  
  // 구매/구독 여부 (백엔드에서 반환)
  const isPurchased = content?.isPurchased || false;
  const isSubscribed = content?.isSubscribed || false;
  
  // 유료 콘텐츠 여부
  const isPaidContent = content?.planId || content?.price;
  
  // 콘텐츠 사용 권한 (본문 / 댓글)
  // - 무료 : 비로그인도 허용
  // - 구독 : 작성자 + 구독자
  // - 단건 : 작성자 + 결제자
  const canViewContent = isOwner || 
                         !isPaidContent || 
                         (isLoggedIn && content?.planId && isSubscribed) || 
                         (isLoggedIn && content?.price && isPurchased);

  const canComment = isOwner || 
                     (isLoggedIn && (
                       !isPaidContent || 
                       (content?.planId && isSubscribed) || 
                       (content?.price && isPurchased)
                     ));

  // 수정 페이지로 이동
  const handleEdit = () => {
    if (content && content.creatorId) {
      router.push(`/creators/${content.creatorId}/create?edit=true&contentId=${id}`);
    }
  };

  // 콘텐츠 삭제
  const handleDelete = async () => {
    if (!confirm('콘텐츠를 삭제하시겠습니까?')) return;

    try {
      const contentId = parseInt(id);
      
      // 삭제 전에 결제 여부 및 삭제 예정일 확인
      console.log('[GET] 삭제 예정 정보 조회:', contentId);
      const preview = await getDeletePreview(contentId);
      console.log('[GET] 삭제 예정 정보:', preview);
      
      // 결제한 사용자가 있는 경우
      if (preview.hasPaidUsers && preview.deletedAt) {
        const formattedDate = formatDate(preview.deletedAt);
        const confirmMessage = `결제 이용한 사용자가 있습니다.\n삭제 예정일 : ${formattedDate}\n삭제 진행하겠습니까?`;
        
        if (!confirm(confirmMessage)) return;
      }

      // 삭제 실행 (서비스 단에서 삭제 요청 시점에 deletedAt 계산)
      console.log('[DELETE] 콘텐츠 삭제:', contentId);
      await deleteContent(contentId);
      console.log('[DELETE] 콘텐츠 삭제 완료');
      
      // 삭제 후 콘텐츠 정보 다시 조회하여 상태 확인
      const updatedContent = await getContent(contentId);
      console.log('[GET] 삭제 후 콘텐츠 정보:', updatedContent);
      
      if (updatedContent.deletedAt) {
        // 삭제 예정으로 설정된 경우
        setContent(updatedContent);
        alert('콘텐츠가 삭제 예정으로 설정되었습니다.');
      } else {
        // 즉시 삭제된 경우
        router.push('/contents');
      }
    } catch (err) {
      console.error('[DELETE] 콘텐츠 삭제 실패:', err);
      alert('콘텐츠 삭제에 실패했습니다.');
    }
  };

  // 배지 정보 계산
  const badgeInfo = content?.planId 
    ? { type: 'badge', text: '구독자 전용' }
    : content?.price 
    ? { type: 'price', text: `₩${content.price.toLocaleString()}` }
    : { type: 'badge', text: '무료' };

  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="text-gray-600">콘텐츠를 불러오는 중...</p>
          </div>
        </div>
      ) : error || !content ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black mb-4">콘텐츠를 찾을 수 없습니다</h1>
            <Link href="/contents" className="text-blue-600 hover:underline">
              콘텐츠 목록으로 돌아가기
            </Link>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 섹션 */}
          <ContentHead
            content={content}
            canViewContent={canViewContent}
            isLoggedIn={isLoggedIn}
          />

          {/* 콘텐츠 본문 */}
          <ContentBody
            content={content}
            canViewContent={canViewContent}
          />

          {/* 액션 버튼 */}
          <div className="flex gap-4 mb-8">
              {/* 본인 소유인 경우에만 수정/삭제 버튼 표시 */}
              {isOwner && (
                <>
                  <button
                    onClick={handleEdit}
                    className="px-6 py-3 border-2 border-black text-black rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    수정하기
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-3 border-2 border-red-500 text-red-500 rounded-lg font-semibold hover:bg-red-50 transition"
                  >
                    삭제하기
                  </button>
                </>
              )}
              {!isOwner && content?.price && !isPurchased && (
                <button 
                  onClick={() => router.push(`/orders/payment?contentId=${id}`)}
                  className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
                >
                  구매하기 ( ₩ {content.price.toLocaleString('ko-KR')} )
                </button>
              )}
              {!isOwner && content?.planId && !isSubscribed && (
                <button 
                  onClick={() => router.push(`/orders/billing?planId=${content.planId}`)}
                  className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
                >
                  {subscriptionPlan?.planName || '구독하기'}{subscriptionPlan?.price ? ` ( ₩ ${subscriptionPlan.price.toLocaleString('ko-KR')} )` : '' }
                </button>
              )}
          </div>
          {/* 댓글 섹션 */}
          <CommentSection
            contentId={id}
            canComment={canComment}
            isLoggedIn={isLoggedIn}
            currentUserId={currentUserId}
            contentCreatorId={content?.creatorId}
          />
        </div>
      )}
    </div>
  );
}
