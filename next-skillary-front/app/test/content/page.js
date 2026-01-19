'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getContents, getCategories, getContentsByCategory, getPopularContents } from '../../api/contents';

export default function ContentListTestPage() {
  const router = useRouter();
  const [contents, setContents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 상세/삭제 이동용 입력 폼
  const [contentIdInput, setContentIdInput] = useState('');

  // 카테고리 목록 로드
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        console.log('[GET] 카테고리 목록:', data);
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
        if (selectedCategory) {
          data = await getContentsByCategory(selectedCategory, page, size, sortBy);
          console.log('[GET] 카테고리별 콘텐츠:', { category: selectedCategory, page, size, sortBy, data });
        } else if (sortBy === 'popular') {
          data = await getPopularContents(page, size);
          console.log('[GET] 인기 콘텐츠:', { page, size, data });
        } else {
          data = await getContents(page, size);
          console.log('[GET] 전체 콘텐츠:', { page, size, data });
        }
        
        let filteredContents = data.content || [];
        
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
  };

  const handleTypeClick = (type) => {
    setSelectedType(type);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };



  const handleViewContent = () => {
    if (!contentIdInput) {
      alert('콘텐츠 ID를 입력해주세요.');
      return;
    }
    router.push(`/test/content/${contentIdInput}/view`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-4">콘텐츠 조회 테스트</h1>
          <p className="text-gray-600">콘텐츠 목록 조회 및 필터링 테스트</p>
        </div>

        {/* 액션 버튼 */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                placeholder="콘텐츠 ID"
                value={contentIdInput}
                onChange={(e) => setContentIdInput(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black flex-1 max-w-xs"
              />
              <button
                onClick={handleViewContent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                상세 이동
              </button>
              <button
                onClick={() => router.push('/test/content/create')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                콘텐츠 생성
              </button>
            </div>
          </div>
        </div>

        {/* 필터 및 정렬 섹션 */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
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

            <div className="flex items-center gap-4 ml-auto">
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

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black mb-4"></div>
            <p className="text-gray-600">콘텐츠를 불러오는 중...</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && contents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">콘텐츠가 없습니다.</p>
          </div>
        )}

        {/* 콘텐츠 JSON 목록 (1열 3개) */}
        {!loading && !error && contents.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {contents.map((content) => (
              <div key={content.contentId} className="bg-white rounded-lg border border-gray-200">
                <pre className="bg-gray-100 p-0 rounded-lg overflow-auto" style={{ fontSize: '11px' }}>
                  {JSON.stringify(content, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
