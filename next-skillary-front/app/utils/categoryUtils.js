// 카테고리별 배너 설정 (썸네일 없을때 대응)
export const getCategoryBanner = (category) => {
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

