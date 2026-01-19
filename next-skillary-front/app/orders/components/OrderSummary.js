export default function OrderSummary({ 
  title = '구독 콘텐츠',
  icon = '📦',
  contentTitle = '콘텐츠 제목',
  description = '콘텐츠 설명',
  gradientColors = 'from-blue-400 to-purple-500'
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-black mb-4">{title}</h2>
      <div className="flex gap-4">
        <div className={`w-24 h-24 rounded-lg bg-gradient-to-br ${gradientColors} flex items-center justify-center flex-shrink-0`}>
          <div className="text-4xl">{icon}</div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-black mb-2">{contentTitle}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        </div>
      </div>
    </div>
  );
}