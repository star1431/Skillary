'use client';

import { useState, useEffect } from 'react';
import { toggleContentLike } from '../../../api/contents';
import { getCategoryBanner } from '../../../utils/categoryUtils';
import { formatCount, formatDate } from '../../../utils/formatUtils';

export default function ContentHead({ 
  content,
  canViewContent,
  isLoggedIn
}) {
  const [contentLikeCount, setContentLikeCount] = useState(content?.likeCount || 0);
  const [isContentLiked, setIsContentLiked] = useState(false);

  // 콘텐츠 좋아요 수 초기화
  useEffect(() => {
    if (content?.likeCount !== undefined) {
      setContentLikeCount(content.likeCount);
    }
  }, [content?.likeCount]);

  // 콘텐츠 좋아요 토글
  const handleToggleLike = async () => {
    if (!canViewContent || !isLoggedIn) {
      return;
    }

    try {
      const response = await toggleContentLike(content.contentId);
      if (response && typeof response.likeCount === 'number') {
        setContentLikeCount(response.likeCount);
        setIsContentLiked(response.isLiked || false);
      }
    } catch (err) {
      console.error('콘텐츠 좋아요 처리 중 오류:', err);
    }
  };

  // 배지 정보 계산
  const badgeInfo = content?.planId 
    ? { type: 'badge', text: '구독자 전용' }
    : content?.price 
    ? { type: 'price', text: `₩${content.price.toLocaleString()}` }
    : { type: 'badge', text: '무료' };
  return (
    <div className="mb-10">
      {/* 썸네일 또는 카테고리 배너 */}
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
      
      {/* 제목 및 메타 정보 */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-black mb-4 break-words">{content.title}</h1>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
                <span className="text-gray-700">
                  {content.creatorName || '크리에이터'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="leading-none">{formatDate(content.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="leading-none">{formatCount(content.viewCount || 0)}</span>
              </div>
              <button
                onClick={handleToggleLike}
                disabled={!canViewContent || !isLoggedIn}
                className={`flex items-center gap-1 transition ${
                  !canViewContent || !isLoggedIn
                    ? 'text-gray-300 cursor-not-allowed' 
                    : isContentLiked 
                    ? 'text-red-500' 
                    : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill={isContentLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-xs leading-none">{formatCount(contentLikeCount)}</span>
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
  );
}

