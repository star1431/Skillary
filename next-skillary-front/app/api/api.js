const API_URL = process.env.NEXT_PUBLIC_FRONT_API_URL || 'http://localhost:8080/api';

export default async function baseRequest(
    method = 'GET',
    headers = {},
    url,
    body = null,
    errMsg = '🛠️ 요청 처리 중 오류가 발생했습니다.',
    credentials = false,
) {     
    const fullUrl = `${API_URL}${url}`;
    console.log('fullUrl: ', fullUrl);

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
        if (response.status === 401) {
            console.warn("토큰 만료 감지, 갱신 시도...");
            // TODO: 여기서 실제 refresh API를 호출해야 합니다.
            // await refresh();
            response = await fetch(fullUrl, fetchOptions);
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            // 백엔드(Spring) 구조에 따른 우선순위 메시지 추출
            const specificMsg = errorData.detail || errorData.details || errorData.message || errMsg;

            throw new Error(specificMsg);
        }

        if (response.status === 204) return null;
        if (fetchOptions.headers['Accept']?.startsWith('text/')) return response;
        else return await response.json();
        
    } catch (e) {
        console.log(`[API Error] ${fullUrl}:`, e.message);
    }
}