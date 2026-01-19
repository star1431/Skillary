export default function CardFooter() {
    return <div className="mt-12 border-t border-gray-200 pt-8">
        <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            꼭 확인해 주세요!
        </h4>
        <ul className="text-xs text-gray-500 space-y-2 leading-relaxed">
            <li>• 본인 명의의 신용/체크카드만 등록이 가능합니다.</li>
            <li>• 등록된 기본 결제 수단은 정기 구독 갱신 시 자동으로 사용됩니다.</li>
            <li>• 카드 정보는 토스페이먼츠를 통해 안전하게 암호화되어 관리됩니다.</li>
        </ul>
    </div>
}