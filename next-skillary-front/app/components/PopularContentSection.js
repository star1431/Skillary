'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import PopularCard from './PopularCard';
import { getPopularContents } from '../api/contents';

export default function PopularContentSection() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function loadContents() {
      try {
        const data = await getPopularContents(0, 4);
        // Slice 응답 구조: { content: [...], hasNext: boolean, ... }
        const apiContents = data.content || [];
        setContents(apiContents);
      } catch (err) {
        console.error('인기 콘텐츠 로드 실패:', err);
        setError(err.message || '인기 콘텐츠를 불러오는데 실패했습니다.');
        setContents([]);
      } finally {
        setLoading(false);
      }
    }
    loadContents();
  }, []);

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

  return (
    <section className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-3xl font-bold text-black">인기 콘텐츠</h3>
          <Link href="/contents" className="text-black hover:text-gray-700 transition flex items-center gap-2">
            전체 보기
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black mb-4"></div>
            <p className="text-gray-600">콘텐츠를 불러오는 중...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {!loading && error && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-4">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">콘텐츠를 불러올 수 없습니다</h3>
            <p className="text-red-600 text-sm mb-2">{error}</p>
            <p className="text-gray-500 text-sm">잠시 후 다시 시도해주세요.</p>
          </div>
        )}

        {/* 콘텐츠가 없을 때 */}
        {!loading && !error && contents.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-50 mb-4">
              <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">아직 컨텐츠가 없습니다</h3>
            <p className="text-gray-500 text-sm">곧 새로운 컨텐츠가 업로드될 예정입니다.</p>
          </div>
        )}
        
        {!loading && !error && contents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contents.map((content) => {
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
        )}
      </div>
    </section>
  );
}
