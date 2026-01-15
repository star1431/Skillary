import Link from 'next/link';

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

// 숫자 포맷팅 (k 단위, 소수점 2자리까지)
const formatCount = (count) => {
  if (!count || count === 0) return '0';
  if (count < 1000) return count.toString();
  const kValue = count / 1000;
  // 소수점 2자리까지 표시, 끝의 0 제거
  return kValue.toFixed(2).replace(/\.?0+$/, '') + 'k';
};

export default function PopularCard({ 
  id,
  title, 
  description, 
  author, 
  date, 
  badge, 
  badgeType, 
  price, 
  emoji,
  gradientFrom,
  gradientTo,
  thumbnailUrl,
  category,
  viewCount,
  likeCount
}) {
  // 썸네일이 있으면 썸네일, 없으면 카테고리별 배너
  const hasThumbnail = thumbnailUrl && thumbnailUrl.trim() !== '';
  const bannerInfo = category ? getCategoryBanner(category) : { emoji: emoji || '📚', gradientFrom: gradientFrom || 'from-blue-600', gradientTo: gradientTo || 'to-indigo-700' };
  
  return (
    <Link href={`/contents/${id}`} className="block h-full">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
      {hasThumbnail ? (
        <div className="aspect-video relative overflow-hidden">
          <img 
            src={thumbnailUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className={`aspect-video bg-gradient-to-br ${bannerInfo.gradientFrom} ${bannerInfo.gradientTo} flex items-center justify-center relative`}>
          <div className="text-6xl">{bannerInfo.emoji}</div>
        </div>
      )}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2 gap-2">
          <h4 className="font-semibold text-black text-sm leading-tight flex-1 min-w-0">
            <span 
              className="block overflow-hidden"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                wordBreak: 'keep-all'
              }}
            >
              {title}
            </span>
          </h4>
          {badge && (
            <span className={`flex-shrink-0 ${badgeType === 'price' ? 'text-black text-xs font-semibold' : 'bg-black text-white text-xs px-2 py-1 rounded'}`}>
              {badgeType === 'price' ? price : badge}
            </span>
          )}
        </div>
        <p 
          className="text-xs text-gray-600 mb-3 overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word'
          }}
        >
          {description}
        </p>
        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0"></div>
            <span className="text-xs text-gray-600 break-words">{author}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 ml-8">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{date}</span>
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{formatCount(viewCount || 0)}</span>
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{formatCount(likeCount || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Link>
  );
}
