// NOTE:
// - 클라이언트 번들에서 NEXT_PUBLIC_* 환경변수는 "빌드/실행 시점에 주입"됩니다.
// - 값이 비어있으면 fullUrl이 "undefined/..."가 되어 프론트(3000)로 잘못 요청이 나갈 수 있어
//   로컬 개발 기본값을 둡니다.
const DEFAULT_API_URL = 'http://localhost:8080';
const API_URL = process.env.NEXT_PUBLIC_FRONT_API_URL || DEFAULT_API_URL;

let refreshInFlight = null;

async function attemptRefresh() {
    if (refreshInFlight) return refreshInFlight;

    refreshInFlight = (async () => {
        const refreshUrl = `${API_URL}/api/auth/refresh`;
        const res = await fetch(refreshUrl, {
            method: 'POST',
            headers: { Accept: 'text/plain' },
            credentials: 'include',
        });
        if (!res.ok) throw new Error('토큰 갱신에 실패했습니다.');
        return true;
    })();

    try {
        return await refreshInFlight;
    } finally {
        refreshInFlight = null;
    }
}

export async function baseRequest(
    method = 'GET',
    headers = {},
    url,
    body = null,
    errMsg = '🛠️ 요청 처리 중 오류가 발생했습니다.',
    credentials = false,
) {
    // URL이 '/'로 시작하면 API_URL과 결합
    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;

    try {
        const fetchOptions = {
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            credentials: credentials ? 'include' : 'omit',
        };

        if (body && !['GET', 'HEAD'].includes(fetchOptions.method)) {
            fetchOptions.body = body;
        }

        let response = await fetch(fullUrl, fetchOptions);

        // 401 Unauthorized 처리
        const isRefreshEndpoint = fullUrl.includes('/api/auth/refresh');
        if (response.status === 401 && credentials && !isRefreshEndpoint) {
            console.warn("토큰 만료 감지, 갱신 시도...");
            try {
                await attemptRefresh();
                response = await fetch(fullUrl, fetchOptions);
            } catch (e) {
                // refresh 실패면 그대로 401 처리로 내려가게 둠
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            // 백엔드(Spring) 구조에 따른 우선순위 메시지 추출
            const specificMsg = errorData.detail || errorData.details || errorData.message || errMsg;

            throw new Error(specificMsg);
        }

        if (response.status === 204)
            return null;
        if (fetchOptions.headers['Accept']?.startsWith('text/'))
            return response;
        else
            return await response.json();
        
    } catch (e) {
        console.error(`[API Error] ${fullUrl}:`, e.message);
        throw e; 
    }
}

export default baseRequest;