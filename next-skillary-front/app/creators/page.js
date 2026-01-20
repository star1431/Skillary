'use client';

import { useEffect, useMemo, useState } from 'react';
import CreatorCard from '../components/CreatorCard';
import { listCreators } from '../api/creator';

export default function CreatorsPage() {
  const [selectedCategory, setSelectedCategory] = useState('전체 카테고리');
  const [searchQuery, setSearchQuery] = useState('');
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // CategoryEnum과 매핑된 카테고리 목록 (백엔드 CategoryEnum과 동일)
  const categories = useMemo(() => [
    { value: '전체 카테고리', label: '전체 카테고리' },
    { value: 'EXERCISE', label: '운동' },
    { value: 'SPORTS', label: '스포츠' },
    { value: 'COOKING', label: '요리' },
    { value: 'STUDY', label: '스터디' },
    { value: 'ART', label: '예술/창작' },
    { value: 'MUSIC', label: '음악' },
    { value: 'PHOTO_VIDEO', label: '사진/영상' },
    { value: 'IT', label: '개발/IT' },
    { value: 'GAME', label: '게임' },
    { value: 'ETC', label: '기타' },
  ], []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setLoadError('');
        const res = await listCreators();
        if (!alive) return;
        setCreators(Array.isArray(res) ? res : []);
      } catch (err) {
        if (!alive) return;
        setCreators([]);
        setLoadError(err?.message || '크리에이터 목록을 불러오지 못했습니다.');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filteredCreators = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return creators
      .filter((c) => {
        // 검색어 필터
        if (!q) return true;
        const name = String(c?.displayName ?? '').toLowerCase();
        return name.includes(q);
      })
      .filter((c) => {
        // 카테고리 필터
        if (selectedCategory === '전체 카테고리') return true;
        const cat = c?.category;
        if (!cat) return false; // 카테고리가 없으면 필터링에서 제외
        return cat === selectedCategory;
      });
  }, [creators, searchQuery, selectedCategory]);

  // 카테고리 라벨 매핑 함수
  const getCategoryLabel = (categoryValue) => {
    if (!categoryValue) return null;
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-6">크리에이터 탐색</h1>
          
          {/* 검색 및 필터 섹션 */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* 검색 바 */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="크리에이터 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* 카테고리 드롭다운 */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white appearance-none pr-10 min-w-[180px]"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* 크리에이터 수 */}
          <p className="text-gray-600 text-sm">
            {loading ? '로딩 중...' : `${filteredCreators.length}명의 크리에이터`}
          </p>
        </div>

        {loadError && (
          <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
            {loadError}
          </div>
        )}

        {/* 크리에이터 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCreators.map((creator) => (
            <CreatorCard
              key={creator.creatorId}
              id={creator.creatorId}
              name={creator.displayName}
              category={getCategoryLabel(creator.category)}
              description={creator.introduction ?? ''}
              subscribers={`${creator.followCount ?? 0}명`}
              avatar={creator.profile}
              isDeleted={creator.isDeleted}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
