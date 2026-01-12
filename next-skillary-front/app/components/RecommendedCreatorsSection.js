'use client';

import Link from 'next/link';
import { recommendedCreators } from './recommendedCreatorsData';


export default function RecommendedCreatorsSection() {

  const handleSubscribe = () => {
    // TODO: 구독 로직 구현
  };
    
  return (
    <section className="py-16 bg-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-3xl font-bold text-black">추천 크리에이터</h3>
          <Link href="#" className="text-black hover:text-gray-700 transition flex items-center gap-2">
            전체 보기
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedCreators.map((creator, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${creator.gradientFrom} ${creator.gradientTo} flex items-center justify-center text-3xl flex-shrink-0`}>
                  {creator.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-black mb-1">{creator.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{creator.description}</p>
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    {creator.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{creator.subscribers} 구독자</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{creator.contents}개 콘텐츠</span>
                </div>
              </div>
              <button
                onClick={() => handleSubscribe()}
                className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition text-sm"
              >
                구독하기
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}