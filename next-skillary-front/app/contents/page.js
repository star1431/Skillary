'use client';

import { useState, useEffect } from 'react';
import PopularCard from '@/components/PopularCard';
import { popularContents } from '@/components/popularContentsData';
import { getContents, getCategories, getContentsByCategory, getPopularContents } from '../api/contents';
import { formatDate } from '../utils/formatUtils';

export default function ContentsPage() {
  const [contents, setContents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'free', 'subscription', 'paid'
  const [sortBy, setSortBy] = useState('latest'); // 'latest', 'popular'
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 카테고리 목록 로드
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('카테고리 로드 실패:', err);
      }
    }
    loadCategories();
  }, []);

  // 콘텐츠 목록 로드
  useEffect(() => {
    async function loadContents() {
      setLoading(true);
      setError(null);
      try {
        let data;
        // 정렬 기준에 따라 API 선택
        if (selectedCategory) {
          // 카테고리별 조회 (정렬 파라미터 포함)
          data = await getContentsByCategory(selectedCategory, page, size, sortBy);
        } else if (sortBy === 'popular') {
          // 인기별 조회
          data = await getPopularContents(page, size);
        } else {
          // 최신순 조회
          data = await getContents(page, size);
        }
        
        // Slice 응답 구조: { content: [...], hasNext: boolean, ... }
        let filteredContents = data.content || [];
        
        // 타입 필터링
        if (selectedType === 'free') {
          filteredContents = filteredContents.filter(c => !c.planId && !c.price);
        } else if (selectedType === 'subscription') {
          filteredContents = filteredContents.filter(c => c.planId);
        } else if (selectedType === 'paid') {
          filteredContents = filteredContents.filter(c => c.price);
        }
        
        setContents(filteredContents);
        setHasNext(data.hasNext || false);
      } catch (err) {
        console.error('콘텐츠 로드 실패:', err);
        setError('콘텐츠를 불러오는 중 오류가 발생했습니다.');
        setContents([]);
        setHasNext(false);
      } finally {
        setLoading(false);
      }
    }
    loadContents();
  }, [page, size, selectedCategory, selectedType, sortBy]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value === 'ALL' ? null : e.target.value);
    setPage(0); // 카테고리 변경 시 첫 페이지로
  };

  const handleTypeClick = (type) => {
    setSelectedType(type);
    setPage(0); // 타입 변경 시 첫 페이지로
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setPage(0); // 정렬 변경 시 첫 페이지로
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNext) {
      setPage(page + 1);
    }
  };


  // 가격 포맷팅
  const formatPrice = (price) => {
    if (!price) return null;
    return `₩${price.toLocaleString()}`;
  };

  // 배지 타입 결정 (planId가 있으면 구독, price가 있으면 유료, 없으면 무료)
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-4">콘텐츠</h1>
          <p className="text-gray-600">다양한 전문가들의 지식과 노하우를 만나보세요</p>
        </div>

        {/* 필터 및 정렬 섹션 */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
            {/* 타입 필터 */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleTypeClick('all')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  selectedType === 'all'
                    ? 'bg-black text-white'
                    : 'bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => handleTypeClick('free')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  selectedType === 'free'
                    ? 'bg-black text-white'
                    : 'bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                무료
              </button>
              <button
                onClick={() => handleTypeClick('subscription')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  selectedType === 'subscription'
                    ? 'bg-black text-white'
                    : 'bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                구독자 전용
              </button>
              <button
                onClick={() => handleTypeClick('paid')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  selectedType === 'paid'
                    ? 'bg-black text-white'
                    : 'bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                유료
              </button>
            </div>

            {/* 정렬 옵션 및 카테고리 필터 */}
            <div className="flex items-center gap-4 ml-auto">
              {/* 정렬 옵션 */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleSortChange('latest')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    sortBy === 'latest'
                      ? 'bg-black text-white'
                      : 'bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  최신순
                </button>
                <button
                  onClick={() => handleSortChange('popular')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    sortBy === 'popular'
                      ? 'bg-black text-white'
                      : 'bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  인기순
                </button>
              </div>

              {/* 카테고리 필터 */}
              <div className="relative">
                <select
                  value={selectedCategory || 'ALL'}
                  onChange={handleCategoryChange}
                  className="px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black appearance-none bg-white text-sm font-semibold min-w-[160px]"
                >
                  <option value="ALL">카테고리 전체</option>
                  {categories.map((category) => (
                    <option key={category.code} value={category.code}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
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
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* 콘텐츠가 없을 때 */}
        {!loading && !error && contents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">콘텐츠가 없습니다.</p>
          </div>
        )}

        {/* 콘텐츠 그리드 */}
        {!loading && !error && contents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
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

        {/* 페이지네이션 */}
        {!loading && contents.length > 0 && (
        <div className="mt-12 flex justify-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={page === 0}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                page === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
            이전
          </button>
          <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold">
              {page + 1}
          </button>
            <button
              onClick={handleNextPage}
              disabled={!hasNext}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                !hasNext
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
            다음
          </button>
        </div>
        )}
      </div>
    </div>
  );
}
