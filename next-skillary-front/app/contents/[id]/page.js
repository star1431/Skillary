'use client';

import Link from 'next/link';
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getContent, deleteContent, toggleContentLike } from '../../api/contents';
import { popularContents } from '../../components/popularContentsData';
import { getComments, addComment, updateComment, deleteComment, toggleLike } from '../../api/comments';
import { creators } from '../../creators/components/data';
import { getCurrentUser } from '../../api/auth';
import ContentHead from './components/ContentHead';
import ContentBody from './components/ContentBody';
import CommentSection from './components/CommentSection';

export default function ContentDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [content, setContent] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 현재 사용자 정보 (토큰 기반 인증)
  const [currentUserId, setCurrentUserId] = useState(null); // 로그인한 사용자 ID (null이면 비로그인)
  
  // [TODO] 실제 API에서 구독/구매 여부 확인 필요
  const [isSubscribed, setIsSubscribed] = useState(false); // 실제 구독 여부 확인
  const [isPurchased, setIsPurchased] = useState(false); // 실제 구매 여부 확인
  
  // 댓글 작성
  const [newComment, setNewComment] = useState('');

  // 콘텐츠 좋아요 상태
  const [isContentLiked, setIsContentLiked] = useState(false);
  const [contentLikeCount, setContentLikeCount] = useState(0);

  // 조회수 중복 증가 방지 (React Strict Mode 대응)
  const loadingRef = useRef(false);

  // 콘텐츠 상세 정보 로드
  useEffect(() => {
    async function loadContent() {
      const contentId = parseInt(id);
      
      // 이미 로딩 중이면 스킵 (React Strict Mode 대응)
      if (loadingRef.current) {
        return;
      }
      
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      
      try {
        // 실제 데이터를 먼저 시도 (모든 contentId에 대해)
        const data = await getContent(contentId);
        setContent(data);
        // 콘텐츠 좋아요 수 초기화
        setContentLikeCount(data.likeCount || 0);
        
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
      loadingRef.current = false;
    }
    loadContent();
    
    // cleanup: id 변경 시 상태 초기화
    return () => {
      loadingRef.current = false;
    };
  }, [id]);

  // 댓글 목록을 계층 구조로 변환하는 공통 함수
  const transformCommentsToHierarchy = (data) => {
    // API 응답이 배열인지 확인
    let commentsList = [];
    if (Array.isArray(data)) {
      commentsList = data;
    } else if (data && Array.isArray(data.content)) {
      commentsList = data.content;
    } else if (data && Array.isArray(data.comments)) {
      commentsList = data.comments;
    } else {
      commentsList = data || [];
    }
    
    // 평면 배열을 계층 구조로 변환 (parentId가 null인 것만 최상위 댓글)
    const topLevelComments = commentsList.filter(comment => !comment.parentId && comment.parentId !== 0);
    const buildCommentTree = (parentId) => {
      return commentsList
        .filter(comment => comment.parentId === parentId)
        .map(comment => ({
          ...comment,
          likedByCurrentUser: comment.likedByCurrentUser || comment.likedByUser || false,
          children: buildCommentTree(comment.commentId)
        }));
    };
    return topLevelComments.map(comment => ({
      ...comment,
      likedByCurrentUser: comment.likedByCurrentUser || comment.likedByUser || false,
      children: buildCommentTree(comment.commentId)
    }));
  };

  // 댓글 목록 로드 (계층 구조로 변환)
  useEffect(() => {
    async function loadComments() {
      try {
        const data = await getComments(parseInt(id));
        const hierarchicalComments = transformCommentsToHierarchy(data);
        setComments(hierarchicalComments);
      } catch (err) {
        console.error('댓글 로드 실패:', err);
        // 댓글 로드 실패 시 빈 배열로 설정
        setComments([]);
      }
    }
    if (id) {
      loadComments();
    }
  }, [id]);

  // 댓글 작성
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await addComment(parseInt(id), { comment: newComment.trim() });
      setNewComment('');
      // 댓글 목록 새로고침
      const data = await getComments(parseInt(id));
      const hierarchicalComments = transformCommentsToHierarchy(data);
      setComments(hierarchicalComments);
    } catch (err) {
      console.error('댓글 작성 실패:', err);
      alert('댓글 작성에 실패했습니다: ' + err.message);
    }
  };

  // 대댓글 작성
  const handleAddReply = async (parentId, replyText) => {
    if (!replyText || !replyText.trim()) return;

    try {
      await addComment(parseInt(id), { 
        comment: replyText.trim(),
        parentId: parentId 
      });
      // 댓글 목록 새로고침
      const data = await getComments(parseInt(id));
      const hierarchicalComments = transformCommentsToHierarchy(data);
      setComments(hierarchicalComments);
    } catch (err) {
      console.error('대댓글 작성 실패:', err);
      alert('대댓글 작성에 실패했습니다: ' + err.message);
    }
  };

  // 댓글 수정
  const handleUpdateComment = async (commentId, newText) => {
    try {
      await updateComment(parseInt(id), commentId, { comment: newText });
      // 댓글 목록 새로고침
      const data = await getComments(parseInt(id));
      const hierarchicalComments = transformCommentsToHierarchy(data);
      setComments(hierarchicalComments);
    } catch (err) {
      console.error('댓글 수정 실패:', err);
      alert('댓글 수정에 실패했습니다: ' + err.message);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      await deleteComment(parseInt(id), commentId);
      // 댓글 목록 새로고침
      const data = await getComments(parseInt(id));
      const hierarchicalComments = transformCommentsToHierarchy(data);
      setComments(hierarchicalComments);
    } catch (err) {
      console.error('댓글 삭제 실패:', err);
      alert('댓글 삭제에 실패했습니다: ' + err.message);
    }
  };

  // 콘텐츠 좋아요 토글
  const handleToggleContentLike = async () => {
    // canViewContent는 나중에 정의되므로 여기서 직접 계산
    const isPaidContent = content?.planId || content?.price;
    const canView = isOwner || 
                    !isPaidContent || 
                    (isLoggedIn && content?.planId && isSubscribed) || 
                    (isLoggedIn && content?.price && isPurchased);
    
    if (!canView) {
      return; // 접근 권한이 없으면 클릭 불가
    }
    
    try {
      // 낙관적 업데이트
      setIsContentLiked(prev => !prev);
      setContentLikeCount(prev => isContentLiked ? prev - 1 : prev + 1);
      
      await toggleContentLike(parseInt(id));
      
      // 성공 시 콘텐츠 정보 새로고침하여 최신 상태 반영
      const data = await getContent(parseInt(id));
      setContent(data);
      setContentLikeCount(data.likeCount || 0);
    } catch (err) {
      console.error('콘텐츠 좋아요 처리 중 오류:', err);
      // 에러 발생 시 원래 상태로 복구
      setIsContentLiked(prev => !prev);
      setContentLikeCount(prev => isContentLiked ? prev + 1 : prev - 1);
      // 콘텐츠 정보 새로고침하여 최신 상태 반영
      const data = await getContent(parseInt(id));
      setContent(data);
      setContentLikeCount(data.likeCount || 0);
    }
  };

  // 댓글 좋아요
  const handleToggleLike = async (commentId) => {
    try {
      await toggleLike(parseInt(id), commentId);
    } catch (err) {
      // 백엔드 에러가 발생해도 (예: deleted instance 에러) 댓글 목록을 새로고침하여 최신 상태 반영
      console.error('좋아요 API 호출 실패 (댓글 목록 새로고침으로 상태 동기화):', err);
    }
    
    // 항상 댓글 목록을 새로고침하여 최신 좋아요 상태 반영
    try {
      const data = await getComments(parseInt(id));
      const hierarchicalComments = transformCommentsToHierarchy(data);
      setComments(hierarchicalComments);
    } catch (refreshErr) {
      console.error('댓글 목록 새로고침 실패:', refreshErr);
      // 새로고침 실패 시에만 에러 throw
      throw refreshErr;
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

  // 수정 페이지로 이동
  const handleEdit = () => {
    if (content && content.creatorId) {
      router.push(`/creators/${content.creatorId}/create?edit=true&contentId=${id}`);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">콘텐츠를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">콘텐츠를 찾을 수 없습니다</h1>
          <Link href="/contents" className="text-blue-600 hover:underline">
            콘텐츠 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }
  
  // 유료 콘텐츠 여부
  const isPaidContent = content.planId || content.price;
  
  // 콘텐츠 본문 접근 권한 (보기)
  // - 크리에이터(본인): 항상 접근 가능 (isOwner가 true면 무조건 접근)
  // - 무료 콘텐츠: 모든 사용자 접근 가능 (로그인/비로그인 모두)
  // - 구독 전용: 로그인한 사용자 중 구독한 사용자만 접근 가능
  // - 단건 결제: 로그인한 사용자 중 결제한 사용자만 접근 가능
  const canViewContent = isOwner || 
                         !isPaidContent || 
                         (isLoggedIn && content.planId && isSubscribed) || 
                         (isLoggedIn && content.price && isPurchased);
  
  // 댓글 작성 권한 (댓글 입력)
  // - 크리에이터(본인): 항상 댓글 작성 가능
  // - 무료 콘텐츠: 로그인한 사용자만 댓글 작성 가능
  // - 구독 전용: 로그인한 사용자 중 구독한 사용자만 댓글 작성 가능
  // - 단건 결제: 로그인한 사용자 중 결제한 사용자만 댓글 작성 가능
  const canComment = isOwner || 
                     (isLoggedIn && (
                       !isPaidContent || 
                       (content.planId && isSubscribed) || 
                       (content.price && isPurchased)
                     ));
  const badgeInfo = content.planId 
    ? { type: 'badge', text: '구독자 전용' }
    : content.price 
    ? { type: 'price', text: `₩${content.price.toLocaleString()}` }
    : { type: 'badge', text: '무료' };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 섹션 */}
        <ContentHead
          content={content}
          creators={creators}
          contentLikeCount={contentLikeCount}
          isContentLiked={isContentLiked}
          isLoggedIn={isLoggedIn}
          canViewContent={canViewContent}
          badgeInfo={badgeInfo}
          onToggleLike={handleToggleContentLike}
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
          {!isOwner && badgeInfo.type === 'price' && (
            <button className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition">
              구매하기 ({badgeInfo.text})
            </button>
          )}
          {!isOwner && badgeInfo.type === 'badge' && badgeInfo.text === '구독자 전용' && (
            <Link 
              href={`/orders?contentId=${id}`}
              className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition text-center block"
            >
              구독하기
            </Link>
          )}
        </div>

        {/* 댓글 섹션 */}
        <CommentSection
          comments={comments}
          canComment={canComment}
          isLoggedIn={isLoggedIn}
          currentUserId={currentUserId}
          contentCreatorId={content?.creatorId}
          newComment={newComment}
          setNewComment={setNewComment}
          onAddComment={handleAddComment}
          onAddReply={handleAddReply}
          onUpdateComment={handleUpdateComment}
          onDeleteComment={handleDeleteComment}
          onToggleLike={handleToggleLike}
        />
      </div>
    </div>
  );
}
