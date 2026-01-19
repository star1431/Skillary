/**
 * test 페이지 전용 설정
 * - API_URL: 파일 업로드는 baseRequest를 우회해서 직접 fetch(multipart)로 호출하므로 필요
 */
export const API_URL = process.env.NEXT_PUBLIC_FRONT_API_URL;

// POST /api/creators는 201 + body 없음이라 json 파싱을 피하려고 text/plain 사용
export const TEXT_HEADERS = { Accept: 'text/plain' };

