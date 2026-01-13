import Link from 'next/link';
import PopularCard from './PopularCard';
import { popularContents } from './popularContentsData';

export default function PopularContentSection() {
  return (
    <section className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-3xl font-bold text-black">인기 콘텐츠</h3>
          <Link href="/contents" className="text-black hover:text-gray-700 transition flex items-center gap-2">
            전체 보기
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularContents.map((content, index) => (
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
      </div>
    </section>
  );
}
