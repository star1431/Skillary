'use client';

import Link from 'next/link';
import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getContent, deleteContent, toggleContentLike } from '../../api/contents';
import { popularContents } from '../../components/popularContentsData';
import { getComments, addComment, updateComment, deleteComment, toggleLike } from '../../api/comments';
import { creators } from '../../creators/components/data';
import { getCurrentUser } from '../../api/auth';
// ToastUI Viewer는 클라이언트 사이드에서만 동적 import로 로드

// 숫자 포맷팅 (k 단위, 소수점 2자리까지)
const formatCount = (count) => {
  if (!count || count === 0) return '0';
  if (count < 1000) return count.toString();
  const kValue = count / 1000;
  // 소수점 2자리까지 표시, 끝의 0 제거
  return kValue.toFixed(2).replace(/\.?0+$/, '') + 'k';
};

// 카테고리별 배너 설정
const getCategoryBanner = (category) => {
  const categoryBanners = {
    'EXERCISE': { emoji: '💪', gradientFrom: 'from-red-300', gradientTo: 'to-orange-400' },
    'SPORTS': { emoji: '⚽', gradientFrom: 'from-emerald-300', gradientTo: 'to-teal-400' },
    'COOKING': { emoji: '🍳', gradientFrom: 'from-amber-300', gradientTo: 'to-yellow-400' },
    'STUDY': { emoji: '📚', gradientFrom: 'from-blue-300', gradientTo: 'to-indigo-400' },
    'ART': { emoji: '🎨', gradientFrom: 'from-rose-300', gradientTo: 'to-pink-400' },
    'MUSIC': { emoji: '🎵', gradientFrom: 'from-violet-300', gradientTo: 'to-purple-400' },
    'PHOTO_VIDEO': { emoji: '📷', gradientFrom: 'from-slate-300', gradientTo: 'to-gray-400' },
    'IT': { emoji: '💻', gradientFrom: 'from-cyan-300', gradientTo: 'to-blue-400' },
    'GAME': { emoji: '🎮', gradientFrom: 'from-fuchsia-300', gradientTo: 'to-purple-400' },
    'ETC': { emoji: '📦', gradientFrom: 'from-neutral-300', gradientTo: 'to-gray-400' }
  };
  return categoryBanners[category] || { emoji: '📚', gradientFrom: 'from-blue-300', gradientTo: 'to-indigo-400' };
};

export default function ContentDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [content, setContent] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const viewerRef = useRef(null);
  const viewerDivRef = useRef(null);
  
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

  // ToastUI Viewer 초기화 (클라이언트 사이드에서만)
  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR 방지
    if (!viewerDivRef.current || viewerRef.current) return;
    if (!content?.post?.body) return;

    // 동적 import로 Viewer와 CSS 로드
    Promise.all([
      import('@toast-ui/editor/dist/toastui-editor-viewer'),
      import('@toast-ui/editor/dist/toastui-editor-viewer.css')
    ]).then(([viewerModule]) => {
      const Viewer = viewerModule.default;
      viewerRef.current = new Viewer({
        el: viewerDivRef.current,
        initialValue: content.post.body || '',
      });
    });

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [content]);

  // content.post.body 변경 시 Viewer 업데이트
  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR 방지
    if (viewerRef.current && content?.post?.body !== undefined) {
      viewerRef.current.setMarkdown(content.post.body);
    }
  }, [content?.post?.body]);

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

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day}. ${hours}:${minutes}`;
  };

  // 댓글 컴포넌트 (재귀적 렌더링)
  const CommentItem = ({ comment, depth = 0, canComment, isFirst = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.comment);
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [isLiked, setIsLiked] = useState(comment.likedByCurrentUser || comment.likedByUser || false);
    const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
    
    // 댓글 작성자 여부 (로그인한 사용자 중에서 댓글 작성자만 메뉴 표시)
    // userId와 currentUserId를 숫자로 비교
    const isCommentOwner = currentUserId !== null && Number(comment.userId) === Number(currentUserId);
    // 콘텐츠 작성자 여부 (백엔드에서 제공하는 isCreator 활용)
    const isContentCreator = comment.isCreator && content && content.creatorId === comment.userId;
    
    // comment prop이 변경될 때 좋아요 상태 업데이트
    useEffect(() => {
      setIsLiked(comment.likedByCurrentUser || comment.likedByUser || false);
      setLikeCount(comment.likeCount || 0);
    }, [comment.likedByCurrentUser, comment.likedByUser, comment.likeCount]);

    return (
      <div className={`${depth > 0 ? 'pl-12' : ''} ${isFirst ? '' : 'border-t border-gray-200'} relative`}>
        <div className="py-6">
          <div className="flex items-start gap-3">
            {/* 프로필 이미지 */}
            {comment.profileImageUrl && comment.profileImageUrl.trim() !== '' ? (
              <img 
                src={comment.profileImageUrl} 
                alt={comment.displayName || '사용자'}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                onError={(e) => {
                  // 이미지 로드 실패 시 숨기고 기본 이미지 표시
                  e.target.style.display = 'none';
                }}
              />
            ) : null}
            <div className={`w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 ${comment.profileImageUrl && comment.profileImageUrl.trim() !== '' ? 'hidden' : ''}`}></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {comment.displayName || `사용자 ${comment.userId}`}
                  </span>
                  {isContentCreator && (
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">
                      작성자
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{formatDate(comment.createdAt || new Date().toISOString())}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      // 에러가 발생해도 댓글 목록 새로고침으로 상태가 동기화되므로 조용히 처리
                      await handleToggleLike(comment.commentId).catch(err => {
                        console.error('좋아요 처리 중 오류 (상태는 새로고침으로 동기화됨):', err);
                      });
                    }}
                    className={`flex items-center gap-1 transition ${
                      isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-xs">{formatCount(likeCount)}</span>
                  </button>
                  {isCommentOwner && (
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="text-gray-400 hover:text-gray-600 transition p-1"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>
                    {showMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowMenu(false)}
                        ></div>
                        <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[80px]">
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setShowMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteComment(comment.commentId);
                              setShowMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                          >
                            삭제
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none text-sm"
                  rows={3}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditText(comment.comment);
                    }}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      if (editText.trim()) {
                        handleUpdateComment(comment.commentId, editText);
                        setIsEditing(false);
                      }
                    }}
                    className="px-4 py-1.5 bg-gray-800 text-white text-xs rounded hover:bg-gray-900 transition"
                  >
                    등록
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap break-words">{comment.comment}</p>
                {canComment && depth === 0 && (
                  <div>
                    <button
                      onClick={() => setIsReplying(!isReplying)}
                      className="text-xs text-gray-500 hover:text-gray-700 transition"
                    >
                      답글
                    </button>
                  </div>
                )}
                {isReplying && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-start gap-2">
                      {comment.profileImageUrl && comment.profileImageUrl.trim() !== '' ? (
                        <img 
                          src={comment.profileImageUrl} 
                          alt={comment.displayName || '사용자'}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div className={`w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 ${comment.profileImageUrl && comment.profileImageUrl.trim() !== '' ? 'hidden' : ''}`}></div>
                      <div className="flex-1">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="댓글을 입력하세요"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none text-sm"
                          rows={2}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => {
                              setIsReplying(false);
                              setReplyText('');
                            }}
                            className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition"
                          >
                            취소
                          </button>
                          <button
                            onClick={() => {
                              if (replyText.trim()) {
                                handleAddReply(comment.commentId, replyText);
                                setReplyText('');
                                setIsReplying(false);
                              }
                            }}
                            className="px-4 py-1.5 bg-gray-800 text-white text-xs rounded hover:bg-gray-900 transition"
                          >
                            등록
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            </div>
          </div>
        </div>
        {/* 대댓글 렌더링 */}
        {comment.children && comment.children.length > 0 && (
          <div>
            {comment.children.map((child) => (
              <CommentItem key={child.commentId} comment={child} depth={depth + 1} canComment={canComment} />
            ))}
          </div>
        )}
      </div>
    );
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
        <div className="mb-10">
          {content.thumbnailUrl ? (
            <div className="aspect-video rounded-lg overflow-hidden mb-6">
              <img
                src={content.thumbnailUrl}
                alt={content.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className={`aspect-video rounded-lg overflow-hidden mb-6 bg-gradient-to-br ${getCategoryBanner(content.category).gradientFrom} ${getCategoryBanner(content.category).gradientTo} flex items-center justify-center`}>
              <div className="text-8xl">{getCategoryBanner(content.category).emoji}</div>
            </div>
          )}
          
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-black mb-4 break-words">{content.title}</h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
                    <span className="text-gray-700">
                      {content.creatorId 
                        ? (creators.find(c => c.id === content.creatorId)?.name || '크리에이터')
                        : (content.creatorName || '크리에이터')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(content.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{formatCount(content.viewCount || 0)}</span>
                  </div>
                  <button
                    onClick={handleToggleContentLike}
                    disabled={!canViewContent || !isLoggedIn}
                    className={`flex items-center gap-1 transition ${
                      !canViewContent || !isLoggedIn
                        ? 'text-gray-300 cursor-not-allowed' 
                        : isContentLiked 
                        ? 'text-red-500' 
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <svg className="w-4 h-4" fill={isContentLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-xs">{formatCount(contentLikeCount)}</span>
                  </button>
                </div>
              </div>
              {badgeInfo && (
                <span className={`ml-4 flex-shrink-0 ${
                  badgeInfo.type === 'price' 
                    ? 'text-black text-lg font-semibold' 
                    : 'bg-black text-white text-sm px-4 py-2 rounded'
                }`}>
                  {badgeInfo.text}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 콘텐츠 소개 */}
        <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">콘텐츠 소개</h2>
          <p className="text-gray-700 leading-relaxed">{content.description}</p>
        </div>

        {/* 콘텐츠 본문 */}
        {content.post && content.post.body && (
          <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
            <div className="prose prose-lg max-w-none">
              {canViewContent ? (
                <div className="toastui-editor-viewer-wrapper">
                  <div ref={viewerDivRef} />
                </div>
              ) : (
              <div className="h-[300px] relative overflow-hidden bg-gray-50 rounded-lg">
                {/* 스켈레톤 UI */}
                <div className="absolute inset-0 p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                  <div className="h-32 bg-gray-200 rounded animate-pulse mt-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                </div>
                {/* 오버레이 메시지 */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-600 text-lg font-bold mb-2">
                      {content.planId ? '구독이 필요한 콘텐츠입니다' : '구매가 필요한 콘텐츠입니다'}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {content.planId ? '구독하시면 전체 콘텐츠를 볼 수 있습니다' : '구매하시면 전체 콘텐츠를 볼 수 있습니다'}
                    </p>
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>
        )}

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
        {/* 전체 댓글 박스에만 패딩 1.5rem 적용 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="border-b border-gray-200 pb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              댓글 <span className="text-gray-500 font-normal">({(() => {
                const countComments = (comments) => {
                  return comments.reduce((count, comment) => {
                    return count + 1 + (comment.children ? countComments(comment.children) : 0);
                  }, 0);
                };
                return countComments(comments);
              })()})</span>
            </h2>
          </div>
          
          {/* 댓글 목록 - 댓글이 있을 때만 표시 */}
          {comments.length > 0 ? (
            <div className="border-b border-gray-200 pb-4">
              {comments.map((comment, index) => (
                <CommentItem 
                  key={comment.commentId} 
                  comment={comment} 
                  depth={0} 
                  canComment={canComment}
                  isFirst={index === 0}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 text-sm border-b border-gray-200">
              댓글이 없습니다.
            </div>
          )}

          {/* 댓글 작성 폼 - 댓글 작성 권한이 있는 경우만 표시 (하단) */}
          {canComment && (
            <form onSubmit={handleAddComment} className="pt-4">
              <div className="flex items-start gap-3">
                {/* [TODO] 현재 사용자 프로필 이미지 표시 */}
                <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="댓글을 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none text-sm"
                    rows={3}
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-gray-800 text-white text-xs rounded hover:bg-gray-900 transition"
                    >
                      등록
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
          
          {/* 로그인한 사용자 중 댓글 작성 권한이 없는 경우에만 메시지 표시 (비로그인 사용자에게는 표시 안 함) */}
          {!canComment && isLoggedIn && (
            <div className="pt-4 bg-yellow-50 py-3 px-2">
              <p className="text-xs text-yellow-800 text-center leading-relaxed">
                댓글을 작성하려면 콘텐츠에 접근할 수 있는 권한이 필요합니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
