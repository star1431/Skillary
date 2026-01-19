import Link from "next/link";

export default function CardHeader() {
    return <div className="mb-8">
        <Link
        href="/auth/my-page"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition mb-4"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            마이페이지로 돌아가기
        </Link>
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-2xl font-bold text-black tracking-tight">결제 수단 관리</h1>
                <p className="text-gray-500 mt-1">구독 서비스에 사용할 카드를 등록하세요.</p>
            </div>
        </div>
    </div>
}