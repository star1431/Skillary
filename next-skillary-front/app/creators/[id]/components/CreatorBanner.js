'use client';

import { useRouter } from 'next/navigation';
import { getCategoryBanner } from '../../../utils/categoryUtils';

// 카테고리 라벨 매핑
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

export default function CreatorBanner({ 
  creator, 
  isOwner, 
  currentUser, 
  isSubscribed, 
  contentsCount,
  onSubscribe,
  onEditProfile,
  hasSubscriptionPlans
}) {
  const router = useRouter();

  // 카테고리에 따른 배너 색상 설정
  const bannerInfo = creator?.category 
    ? getCategoryBanner(creator.category)
    : { gradientFrom: 'from-blue-100', gradientTo: 'to-blue-200' };

  return (
    <div className={`bg-gradient-to-br ${bannerInfo.gradientFrom} ${bannerInfo.gradientTo} relative overflow-hidden`}>
      <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* 수정 버튼 (소유자일 때만 표시) */}
        {isOwner && (
          <div className="absolute top-4 right-4">
            <button
              onClick={onEditProfile}
              className="px-4 py-2 bg-white bg-opacity-90 text-black rounded-lg font-semibold hover:bg-opacity-100 transition text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              수정
            </button>
          </div>
        )}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* 프로필 이미지 */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white shadow-xl flex items-center justify-center text-6xl md:text-7xl border-4 border-white overflow-hidden">
              {creator.profile ? (
                <img src={creator.profile} alt={creator.displayName} className="w-full h-full object-cover" />
              ) : (
                <span>👤</span>
              )}
            </div>
          </div>

          {/* 크리에이터 정보 */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{creator.displayName}</h1>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              {creator.category && (
                <span className="inline-block bg-white bg-opacity-90 text-gray-700 text-sm px-4 py-1.5 rounded-full font-medium">
                  {getCategoryLabel(creator.category)}
                </span>
              )}
              {creator.createdAt && (
                <span className="text-white text-sm opacity-90">
                  {new Date(creator.createdAt).getFullYear()}년 {new Date(creator.createdAt).getMonth() + 1}월 가입
                </span>
              )}
            </div>
            
            {/* 통계 정보 */}
            <div className="flex items-center justify-center md:justify-start gap-6 mb-6">
              <div>
                <div className="text-2xl font-bold text-white">{creator.followCount || 0}</div>
                <div className="text-sm text-white opacity-80">구독자</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{contentsCount}개</div>
                <div className="text-sm text-white opacity-80">콘텐츠</div>
              </div>
            </div>

            {/* 구독 버튼 및 나의 플랜 버튼 */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {/* 구독 버튼: 본인이 아닌 경우에만 표시, 구독 플랜이 있을 때만 표시 (비로그인 사용자도 볼 수 있음) */}
              {!isOwner && hasSubscriptionPlans && (
                <button
                  onClick={onSubscribe}
                  className={`px-6 py-3 rounded-lg font-semibold transition ${
                    isSubscribed
                      ? 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  {isSubscribed ? '구독 중' : '구독하기'}
                </button>
              )}

              {/* 나의 플랜 버튼: 본인 크리에이터인 경우에만 표시 */}
              {isOwner && (
                <button
                  onClick={() => router.push('/subscriptions/plans')}
                  className="px-6 py-3 rounded-lg font-semibold bg-black bg-opacity-30 text-white border border-white border-opacity-30 hover:bg-opacity-40 transition"
                >
                  나의 플랜
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

