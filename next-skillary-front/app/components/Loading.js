
export default function Loading({
    loadingMessage = '로딩 중입니다.'
}) {
    return <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">{ loadingMessage }</p>
    </div>
}