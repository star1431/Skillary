import Link from 'next/link';

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
  gradientTo
}) {
  return (
    <Link href={`/contents/${id}`} className="block">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className={`aspect-video bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center relative`}>
        <div className="text-6xl">{emoji}</div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2 gap-2">
          <h4 className="font-semibold text-black text-sm leading-tight flex-1 overflow-hidden">
            <span className="line-clamp-3 block">{title}</span>
          </h4>
          {badge && (
            <span className={`flex-shrink-0 ${badgeType === 'price' ? 'text-black text-xs font-semibold' : 'bg-black text-white text-xs px-2 py-1 rounded'}`}>
              {badgeType === 'price' ? price : badge}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-300"></div>
            <span className="text-xs text-gray-600">{author}</span>
          </div>
          <span className="text-xs text-gray-500">{date}</span>
        </div>
      </div>
    </div>
    </Link>
  );
}
