'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getRecommendedCreators } from '../api/creator';

export default function RecommendedCreatorsSection() {
  const router = useRouter();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  // 카테고리 enum 값을 한글 라벨로 변환
  const getCategoryLabel = (categoryValue) => {
    if (!categoryValue) return null;
    const categoryMap = {
      'EXERCISE': '운동',
      'SPORTS': '스포츠',
      'COOKING': '요리',
      'STUDY': '스터디',
      'ART': '예술/창작',
      'MUSIC': '음악',
      'PHOTO_VIDEO': '사진/영상',
      'IT': '개발/IT',
      'GAME': '게임',
      'ETC': '기타',
    };
    return categoryMap[categoryValue] || categoryValue;
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getRecommendedCreators();
        if (!alive) return;
        // isDeleted = false인 것만 표시
        const filteredCreators = Array.isArray(res) 
          ? res.filter(creator => !creator.isDeleted)
          : [];
        setCreators(filteredCreators);
      } catch (err) {
        if (!alive) return;
        console.error('추천 크리에이터 로딩 실패:', err);
        setCreators([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleViewDetails = (creatorId) => {
    router.push(`/creators/${creatorId}`);
  };

  if (loading) {
    return (
      <section className="py-16 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-3xl font-bold text-black">추천 크리에이터</h3>
          </div>
          <div className="text-center text-gray-600">로딩 중...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-3xl font-bold text-black">추천 크리에이터</h3>
          <Link href="/creators" className="text-black hover:text-gray-700 transition flex items-center gap-2">
            전체 보기
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((creator) => (
            <div
              key={creator.creatorId}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                {creator.profile ? (
                  <img
                    src={creator.profile}
                    alt={creator.displayName}
                    className="w-16 h-16 rounded-full object-cover border border-gray-200 flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-3xl flex-shrink-0">
                    👤
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-black mb-1">{creator.displayName}</h4>
                  <p className="text-sm text-gray-600 mb-2">{creator.introduction || '-'}</p>
                  {creator.category && (
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {getCategoryLabel(creator.category)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{creator.followCount || 0}명 구독자</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{creator.contentCount || 0}개 콘텐츠</span>
                </div>
              </div>
              <button
                onClick={() => handleViewDetails(creator.creatorId)}
                className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition text-sm"
              >
                자세히 보기
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}