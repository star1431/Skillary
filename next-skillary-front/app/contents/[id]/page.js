'use client';

import Link from 'next/link';
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getContent, deleteContent } from '../../api/contents';
import { popularContents } from '../../components/popularContentsData';
import { getCurrentUser } from '../../api/auth';
import ContentHead from './components/ContentHead';
import ContentBody from './components/ContentBody';
import CommentSection from './components/CommentSection';


export default function ContentDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 현재 사용자 정보 (토큰 기반 인증)
  const [currentUserId, setCurrentUserId] = useState(null); // 로그인한 사용자 ID (null이면 비로그인)
  
  // [TODO] 실제 API에서 구독/구매 여부 확인 필요
  const [isSubscribed, setIsSubscribed] = useState(false); // 실제 구독 여부 확인
  const [isPurchased, setIsPurchased] = useState(false); // 실제 구매 여부 확인

  // 콘텐츠 상세 정보 로드
  useEffect(() => {
    async function loadContent() {
      const contentId = parseInt(id);
      
      setLoading(true);
      setError(null);
      
      try {
        // 실제 데이터를 먼저 시도 (모든 contentId에 대해)
        const data = await getContent(contentId);
        setContent(data);
        
        // 토큰 기반 인증으로 현재 사용자 정보 가져오기
        try {
          const userInfo = await getCurrentUser();
          if (userInfo) {
            setCurrentUserId(userInfo.userId);
          }
        } catch (err) {
          // 인증 정보 가져오기 실패 시 비로그인 상태로 처리
          setCurrentUserId(null);
        }
      } catch (err) {
        // 실제 데이터가 없을 때 목업 데이터 사용
        console.log(`콘텐츠 ${contentId} 실제 데이터 없음, 목업 데이터 사용`);
        const fallbackContent = popularContents.find(item => item.id === contentId) || popularContents[0];
        if (fallbackContent) {
          const convertedContent = {
            contentId: fallbackContent.id,
            title: fallbackContent.title,
            description: fallbackContent.description,
            creatorName: fallbackContent.author,
            createdAt: new Date().toISOString(),
            thumbnailUrl: null,
            category: fallbackContent.category || 'ETC',
            planId: fallbackContent.badgeType === 'badge' && fallbackContent.badge === '구독자 전용' ? 1 : null,
            price: fallbackContent.badgeType === 'price' ? parseInt(fallbackContent.price?.replace(/[^0-9]/g, '') || '0') : null,
            viewCount: 0,
            likeCount: 0,
            creatorId: 1,
            post: {
              body: fallbackContent.body || `### ${fallbackContent.title}\n\n${fallbackContent.description}`,
              postFiles: []
            }
          };
          setContent(convertedContent);
          setError(null);
        } else {
          setError('콘텐츠를 찾을 수 없습니다.');
        }
      }
      
      // [TODO] 실제 API에서 구독/구매 여부 확인 필요
      // 예: setIsSubscribed(await checkSubscription(data.planId, currentUserId));
      // 예: setIsPurchased(await checkPurchase(data.contentId, currentUserId));
      
      setLoading(false);
    }
    loadContent();
  }, [id]);

  // 현재 사용자 정보 가져오기 (토큰 기반 인증)
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

  // 로그인 여부 확인
  const isLoggedIn = currentUserId !== null;
  
  // 크리에이터 본인 여부 확인 (백엔드에서 isOwner로 반환)
  const isOwner = content?.isOwner || false;
  
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
      await deleteContent(parseInt(id));
      router.push('/contents');
    } catch (err) {
      console.error('콘텐츠 삭제 실패:', err);
      alert('콘텐츠 삭제에 실패했습니다: ' + err.message);
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
        <div className="flex gap-4">
          {isOwner && (
            <button
              onClick={handleEdit}
              className="px-6 py-3 border-2 border-black text-black rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              수정하기
            </button>
          )}
          {content.badgeType === 'price' && (
            <button 
              onClick={() => router.push(`/orders/payment?contentId=1`)}
              className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              구매하기 {content.price}
            </button>
          )}
          {content.badgeType === 'badge' && content.badge === '구독자 전용' && (
            <button 
              onClick={() => router.push(`/orders/billing?planId=1`)}
              className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition text-center block"
            >
              구독하기
            </button>
          )}
          {content.badge === '무료' && (
            <button className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition">
              콘텐츠 보기
            </button>
          )}
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
