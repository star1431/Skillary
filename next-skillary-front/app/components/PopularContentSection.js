'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import PopularCard from './PopularCard';
import { popularContents } from './popularContentsData';
import { getPopularContents } from '../api/contents';

export default function PopularContentSection() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContents() {
      try {
        const data = await getPopularContents(0, 4);
        // Slice 응답 구조: { content: [...], hasNext: boolean, ... }
        const apiContents = data.content || [];
        
        // 실제 데이터가 있으면 무조건 실제 데이터 사용
        if (apiContents.length > 0) {
          setContents(apiContents);
        } else {
          // [임시] 실제 데이터가 없을 때만 목업 데이터 사용
          const fallbackContents = popularContents.map((item, index) => ({
            contentId: item.id,
            title: item.title,
            description: item.description,
            creatorName: item.author,
            createdAt: new Date().toISOString(),
            thumbnailUrl: null,
            category: item.category || 'ETC',
            planId: item.badge === '구독자 전용' && item.badgeType === 'badge' ? 1 : null,
            price: item.badgeType === 'price' ? parseInt(item.price.replace(/[^0-9]/g, '')) : null,
            viewCount: 0,
            likeCount: 0
          }));
          setContents(fallbackContents);
        }
      } catch (err) {
        console.error('인기 콘텐츠 로드 실패:', err);
        // [임시] 에러 시 목업 데이터 사용
        const fallbackContents = popularContents.map((item) => ({
          contentId: item.id,
          title: item.title,
          description: item.description,
          creatorName: item.author,
          createdAt: new Date().toISOString(),
          thumbnailUrl: null,
          category: item.category || 'ETC',
          planId: item.badge === '구독자 전용' && item.badgeType === 'badge' ? 1 : null,
          price: item.badgeType === 'price' ? parseInt(item.price.replace(/[^0-9]/g, '')) : null,
          viewCount: 0,
          likeCount: 0
        }));
        setContents(fallbackContents);
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

  if (loading) {
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
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black"></div>
          </div>
        </div>
      </section>
    );
  }

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
      </div>
    </section>
  );
}
