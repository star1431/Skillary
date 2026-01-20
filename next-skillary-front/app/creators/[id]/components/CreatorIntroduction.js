'use client';

export default function CreatorIntroduction({ introduction }) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-700 leading-relaxed text-center md:text-left">
          {introduction || '소개글이 없습니다.'}
        </p>
      </div>
    </div>
  );
}

