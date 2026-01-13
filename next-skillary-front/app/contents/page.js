import PopularCard from '../components/PopularCard';
import { popularContents } from '../components/popularContentsData';

export default function ContentsPage() {
  // 임시로 더 많은 데이터를 보여주기 위해 데이터 복제
  const allContents = [...popularContents, ...popularContents, ...popularContents];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-4">콘텐츠</h1>
          <p className="text-gray-600">다양한 전문가들의 지식과 노하우를 만나보세요</p>
        </div>

        {/* 필터 섹션 */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition">
            전체
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
            무료
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
            구독자 전용
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
            유료
          </button>
        </div>

        {/* 콘텐츠 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allContents.map((content, index) => (
            <PopularCard
              key={index}
              id={content.id}
              title={content.title}
              description={content.description}
              author={content.author}
              date={content.date}
              badge={content.badge}
              badgeType={content.badgeType}
              price={content.price}
              emoji={content.emoji}
              gradientFrom={content.gradientFrom}
              gradientTo={content.gradientTo}
            />
          ))}
        </div>

        {/* 페이지네이션 */}
        <div className="mt-12 flex justify-center gap-2">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
            이전
          </button>
          <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold">
            1
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
            2
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
            3
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition">
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
