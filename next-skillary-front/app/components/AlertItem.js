export default function AlertItem({ title, message, time, isRead }) {
  const handleClick = () => {
    // TODO: 알림 클릭 로직 구현
  };

  return (
    <button
      onClick={() => handleClick()}
      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0 ${
        !isRead ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!isRead ? 'bg-blue-500' : 'bg-transparent'}`}></div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-black mb-1">{title}</h4>
          <p className="text-xs text-gray-600 mb-1 line-clamp-2">{message}</p>
          <span className="text-xs text-gray-400">{time}</span>
        </div>
      </div>
    </button>
  );
}
