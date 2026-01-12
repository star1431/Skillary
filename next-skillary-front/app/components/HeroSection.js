'use client';

export default function HeroSection() {
  const handleExploreCreators = () => {
    // TODO: 크리에이터 둘러보기 로직 구현
  };

  const handleBrowseCategories = () => {
    // TODO: 카테고리 탐색 로직 구현
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl font-bold text-purple-600 mb-6">
          크리에이터와 함께 성장하세요
        </h2>
        <p className="text-xl text-black mb-10">
          전문가의 지식과 노하우를 구독하고, 당신의 성장을 가속화하세요
        </p>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => handleExploreCreators()}
            className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition flex items-center gap-2"
          >
            크리에이터 둘러보기
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button 
            onClick={() => handleBrowseCategories()}
            className="bg-white border-2 border-black text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            카테고리 탐색
          </button>
        </div>
      </div>
    </section>
  );
}
