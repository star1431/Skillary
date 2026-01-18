'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getContent, toggleContentLike, updateContent, deleteContent, getDeletePreview } from '../../../../api/contents';
import { formatDate } from '../../../../utils/formatUtils';
import { getComments, addComment, deleteComment, toggleLike } from '../../../../api/comments';
import { getCurrentUser } from '../../../../api/auth';

const API_URL = process.env.NEXT_PUBLIC_FRONT_API_URL || 'http://localhost:8080/api';

export default function ContentViewTestPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const contentId = parseInt(id);

  const [content, setContent] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 로그인 유저 정보
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // 구독 & 구매(유료) : 다른 API에서 구독/유료 여부 확인 필요
  const [isSubscribed, setIsSubscribed] = useState(false); // 실제 구독 여부 확인
  const [isPurchased, setIsPurchased] = useState(false); // 실제 구매 여부 확인

  // 댓글 작성
  const [newComment, setNewComment] = useState('');
  
  // 대댓글 작성
  const [replyComment, setReplyComment] = useState({ parentId: '', text: '' });

  // 로그인 유저 정보 로드
  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const userInfo = await getCurrentUser();
        console.log('[GET] 현재 사용자 정보:', userInfo);
        if (userInfo) {
          setCurrentUserId(userInfo.userId);
          setCurrentUserEmail(userInfo.email);
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.log('[GET] 비로그인 상태');
        setCurrentUserId(null);
        setCurrentUserEmail(null);
        setIsLoggedIn(false);
      }
    }
    loadCurrentUser();
  }, []);

  // 콘텐츠 상세 로드
  useEffect(() => {
    async function loadContent() {
      setLoading(true);
      setError(null);
      try {
        console.log('[GET] 콘텐츠 상세 조회:', contentId);
        const data = await getContent(contentId);
        console.log('[GET] 콘텐츠 상세:', data);
        setContent(data);
      } catch (err) {
        console.error('[GET] 콘텐츠 상세 조회 실패:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (contentId) {
      loadContent();
    }
  }, [contentId]);

  // 댓글 목록 로드
  useEffect(() => {
    async function loadComments() {
      try {
        console.log('[GET] 댓글 목록 조회:', contentId);
        const data = await getComments(contentId);
        console.log('[GET] 댓글 목록:', data);
        const commentsList = Array.isArray(data) ? data : (data.content || data.comments || []);
        setComments(commentsList);
      } catch (err) {
        console.error('[GET] 댓글 목록 조회 실패:', err);
        setComments([]);
      }
    }
    if (contentId) {
      loadComments();
    }
  }, [contentId]);
    
    // 크리에이터 본인 여부 확인
    const isOwner = content?.isOwner || false;
    const isPaidContent = content?.planId || content?.price;
    const badgeInfo = content?.planId
      ? { type: 'badge', text: '구독자 전용' }
      : content?.price
      ? { type: 'price', text: `₩${content?.price.toLocaleString()}` }
      : { type: 'badge', text: '무료' };
    
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
  
  // 콘텐츠 좋아요 토글
  const handleToggleLike = async () => {
    try {
      console.log('[POST] 콘텐츠 좋아요 토글:', contentId);
      const data = await toggleContentLike(contentId);
      console.log('[POST] 콘텐츠 좋아요 토글 완료:', data);
      if (content) {
        setContent({ ...content, likeCount: data.likeCount, isLiked: data.isLiked });
      }
    } catch (err) {
      console.error('[POST] 콘텐츠 좋아요 토글 실패:', err);
      alert('좋아요 처리에 실패했습니다.');
    }
  };

  // 콘텐츠 수정
  const handleEdit = () => {
    router.push(`/test/content/create?edit=true&contentId=${contentId}`);
  };

  // 콘텐츠 삭제
  const handleDelete = async () => {
    if (!confirm('콘텐츠를 삭제하시겠습니까?')) return;

    try {
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
        router.push('/test/content');
      }
    } catch (err) {
      console.error('[DELETE] 콘텐츠 삭제 실패:', err);
      alert('콘텐츠 삭제에 실패했습니다.');
    }
  };

  // 구독하기 버튼 (임시 확인)
  const handleSubscribe = async () => {
    try {
      console.log('[POST] 구독하기:', { planId: content.planId });
    } catch (err) {}
  };

  // 단건결제 버튼 (임시 확인)
  const handlePurchase = async () => {
    try {
      console.log('[POST] 단건결제:', { contentId, price: content.price });
    } catch (err) {}
  };

  // 댓글 작성
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      console.log('[POST] 댓글 작성:', { contentId, comment: newComment });
      await addComment(contentId, { comment: newComment.trim() });
      console.log('[POST] 댓글 작성 완료');
      setNewComment('');
      
      // 댓글 목록 새로고침
      const data = await getComments(contentId);
      const commentsList = Array.isArray(data) ? data : (data.content || data.comments || []);
      setComments(commentsList);
    } catch (err) {
      console.error('[POST] 댓글 작성 실패:', err);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  // 대댓글 작성
  const handleAddReply = async (parentId) => {
    if (!replyComment.text.trim()) return;

    try {
      console.log('[POST] 대댓글 작성:', { contentId, parentId, comment: replyComment.text });
      await addComment(contentId, { 
        comment: replyComment.text.trim(),
        parentId: parseInt(parentId)
      });
      console.log('[POST] 대댓글 작성 완료');
      setReplyComment({ parentId: '', text: '' });
      
      // 댓글 목록 새로고침
      const data = await getComments(contentId);
      const commentsList = Array.isArray(data) ? data : (data.content || data.comments || []);
      setComments(commentsList);
    } catch (err) {
      console.error('[POST] 대댓글 작성 실패:', err);
      alert('대댓글 작성에 실패했습니다.');
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      console.log('[DELETE] 댓글 삭제:', { contentId, commentId });
      await deleteComment(contentId, commentId);
      console.log('[DELETE] 댓글 삭제 완료');
      
      // 댓글 목록 새로고침
      const data = await getComments(contentId);
      const commentsList = Array.isArray(data) ? data : (data.content || data.comments || []);
      setComments(commentsList);
    } catch (err) {
      console.error('[DELETE] 댓글 삭제 실패:', err);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  // 댓글 좋아요 토글
  const handleCommentLike = async (commentId) => {
    try {
      console.log('[POST] 댓글 좋아요 토글:', { contentId, commentId });
      await toggleLike(contentId, commentId);
      console.log('[POST] 댓글 좋아요 토글 완료');
      
      // 댓글 목록 새로고침
      const data = await getComments(contentId);
      const commentsList = Array.isArray(data) ? data : (data.content || data.comments || []);
      setComments(commentsList);
    } catch (err) {
      console.error('[POST] 댓글 좋아요 토글 실패:', err);
      alert('좋아요 처리에 실패했습니다.');
    }
  };
  


  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/test/content')}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            목록으로 돌아가기
          </button>
          <div className="text-sm text-gray-600">
            현재 로그인 정보: <span className="font-semibold text-gray-900">{currentUserEmail || '비로그인'}</span>
          </div>
        </div>
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black mb-4"></div>
                <p className="text-gray-600">콘텐츠를 불러오는 중...</p>
              </div>
            </div>
          ) : error || !content ? (
            <div className="flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-black mb-4">콘텐츠를 찾을 수 없습니다</h1>
              </div>
            </div>
          ) : (
            <>
              {/* 콘텐츠 정보 코드 블록 */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">콘텐츠 정보 (JSON)</h2>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs">
                  {JSON.stringify(content, null, 2)}
                </pre>
              </div>

              {/* 본문 확인 권한 */}
              <div className={`bg-white rounded-lg border p-6 mb-6 ${
                canViewContent 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}>
                <p className={`text-sm font-semibold text-center ${
                  canViewContent 
                    ? 'text-green-800' 
                    : 'text-red-800'
                }`}>
                  {canViewContent ? '✅ 본문 확인 권한 있음' : '❌ 본문 확인 권한 없음'}
                </p>
              </div>

              {/* 액션 버튼 */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">액션 버튼 노출 확인</h2>
                <div className="flex gap-4 flex-wrap">
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
                  {!isOwner && badgeInfo.type === 'price' && !isPurchased && (
                    <button
                      onClick={handlePurchase}
                      className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
                    >
                      단건결제 ({badgeInfo.text})
                    </button>
                  )}
                  {!isOwner && badgeInfo.type === 'badge' && badgeInfo.text === '구독자 전용' && !isSubscribed && (
                    <button
                      onClick={handleSubscribe}
                      className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
                    >
                      구독하기
                    </button>
                  )}
                </div>
              </div>

              {/* 콘텐츠 좋아요 */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">콘텐츠 좋아요</h2>
                  <button
                    onClick={canViewContent ? handleToggleLike : undefined}
                    disabled={!canViewContent}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                      !canViewContent
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : content.isLiked
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <span className="text-lg">{content.isLiked ? '❤️' : '🤍'}</span>
                    <span>{content.likeCount || 0}</span>
                  </button>
                </div>
              </div>

              {/* 댓글 관련 기능 통합 */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">댓글 관리 ({comments.length})</h2>
                
                {/* 댓글 목록 JSON 전체 표시 */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">전체 댓글 데이터 (JSON):</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs">
                    {JSON.stringify(comments, null, 2)}
                  </pre>
                </div>

                {/* 댓글 작성 폼 */}
                {canComment ? (
                  <>
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">댓글 작성</h3>
                      <form onSubmit={handleAddComment} className="flex gap-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="댓글을 입력하세요"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <button
                          type="submit"
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                        >
                          댓글 작성
                        </button>
                      </form>
                    </div>

                    {/* 대댓글 작성 폼 */}
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">대댓글 작성</h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="부모 댓글 ID"
                          value={replyComment.parentId}
                          onChange={(e) => setReplyComment({ ...replyComment, parentId: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black w-32"
                        />
                        <input
                          type="text"
                          value={replyComment.text}
                          onChange={(e) => setReplyComment({ ...replyComment, text: e.target.value })}
                          placeholder="대댓글을 입력하세요"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <button
                          onClick={() => handleAddReply(replyComment.parentId)}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                        >
                          대댓글 작성
                        </button>
                      </div>
                    </div>

                    {/* 댓글 삭제 - 내가 작성한 댓글만 표시 */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">댓글 삭제 (내가 작성한 댓글만)</h3>
                      {isLoggedIn ? (
                        <div className="space-y-2">
                      {comments
                        .filter(comment => comment.userId === currentUserId)
                        .map(comment => (
                          <div key={comment.commentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <span className="text-sm font-semibold text-gray-700">댓글 ID: {comment.commentId}</span>
                              <span className="text-xs text-gray-500 ml-2">({comment.comment?.substring(0, 30)}...)</span>
                            </div>
                            <button
                              onClick={() => handleDeleteComment(comment.commentId)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm"
                            >
                              삭제
                            </button>
                          </div>
                        ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">로그인 후 내가 작성한 댓글을 삭제할 수 있습니다.</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bg-yellow-50 py-3 px-4 rounded">
                    <p className="text-xs text-yellow-800 text-center leading-relaxed">
                      댓글을 작성하려면 콘텐츠에 접근할 수 있는 권한이 필요합니다.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
      </div>
    </div>
  );
}
