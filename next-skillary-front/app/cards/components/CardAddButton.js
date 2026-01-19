export default function CardAddButton({
    handleRegisterCard
}) {
    return <button 
        onClick={handleRegisterCard}
        className="w-full bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center hover:border-black hover:bg-gray-50 transition-all group"
    >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4 group-hover:scale-110 transition-transform">
            <span className="text-3xl">💳</span>
        </div>
        <h3 className="text-xl font-bold text-black mb-2">등록된 결제 수단이 없습니다</h3>
        <p className="text-gray-500 mb-8">안전한 결제를 위해 카드를 먼저 등록해 주세요.</p>
        <span className="inline-flex items-center px-8 py-3 bg-black text-white rounded-full font-bold shadow-lg hover:bg-gray-800 transition">
        카드 등록 시작하기
        </span>
    </button>
}