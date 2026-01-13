'use client';

import { useState } from 'react';
import CreatorCard from '../components/CreatorCard';
import { creators, categories } from './components/data';

export default function CreatorsPage() {
  const [selectedCategory, setSelectedCategory] = useState('전체 카테고리');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    // TODO: 검색 로직 구현
  };

  const handleCategoryChange = () => {
    // TODO: 카테고리 변경 로직 구현
  };

  const filteredCreators = selectedCategory === '전체 카테고리'
    ? creators
    : creators.filter(creator => creator.category === selectedCategory);

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
                  <option key={category} value={category}>
                    {category}
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
            {filteredCreators.length}명의 크리에이터
          </p>
        </div>

        {/* 크리에이터 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCreators.map((creator) => (
            <CreatorCard
              key={creator.id}
              id={creator.id}
              name={creator.name}
              category={creator.category}
              description={creator.description}
              subscribers={creator.subscribers}
              avatar={creator.avatar}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
