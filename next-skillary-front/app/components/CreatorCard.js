import Link from 'next/link';

export default function CreatorCard({
  id,
  name,
  category,
  description,
  subscribers,
  avatar
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow flex flex-col h-full">
      <div className="flex flex-col items-center mb-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4 overflow-hidden">
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">
              👤
            </div>
          )}
        </div>
        <h3 className="text-lg font-bold text-black mb-2">{name}</h3>
        <span className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full mb-3">
          {category}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-4 text-center line-clamp-2 flex-grow">
        {description}
      </p>

      <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span>구독자 {subscribers}</span>
      </div>

      <Link
        href={`/creators/${id}`}
        className="w-full bg-black text-white py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition text-sm mt-auto text-center block"
      >
        프로필 보기
      </Link>
    </div>
  );
}
