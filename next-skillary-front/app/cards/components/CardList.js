export default function CardList({
    cards,
    handleWithdrawCard
}) {
    return <>
    {cards.map((card, idx) => (
        <div 
            key={idx}
            className={`relative overflow-hidden bg-white border-2 rounded-2xl p-6 transition-all ${card.isDefault ? 'border-black shadow-md' : 'border-gray-100'}`}
        >
            <div className="flex justify-between items-start">
                <div className="flex gap-4">
                    <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center text-[10px] text-white font-bold uppercase">
                    {card.cardName}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{card.cardNumber}</span>
                            {card.isDefault && (
                            <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded-full font-bold">DEFAULT</span>
                            )}
                        </div>
                        <p className="text-sm text-gray-400 mt-1">등록일: {card.createdAt}</p>
                    </div>
                </div>
                <button 
                    onClick={(e) => {
                        e.stopPropagation(); // 카드 전체 클릭 이벤트로 번지는 것 방지
                        handleWithdrawCard(card.cardId);
                    }}
                    className="text-gray-400 hover:text-red-500 transition"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                        />
                    </svg>
                </button>
            </div>
        </div>
    ))}
    </>;
}