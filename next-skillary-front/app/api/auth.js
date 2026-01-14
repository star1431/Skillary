import { baseRequest } from './api';

/*
// 1. 보낼 데이터를 만든다
const data = { planId: 101 };

// 2. baseRequest를 호출한다
const result = await baseRequest(
  'POST',                // 1. method
  {},                    // 2. headers (없으면 빈 객체)
  '/payments',           // 3. url
  JSON.stringify(data)   // 4. body (문자열로 변환 필수!)
);

console.log(result);
*/
const TEXT_HEADERS = { Accept: 'text/plain' };

// 백엔드: POST /api/auth/login (201, Set-Cookie, body 없음)
export async function login(email, password) {
  await baseRequest(
    'POST',
    TEXT_HEADERS,
    '/api/auth/login',
    JSON.stringify({ email, password }),
    '로그인에 실패했습니다.',
    true // credentials include (쿠키 수신/전송)
  );
  return true;
}

// 백엔드: POST /api/auth/refresh (201, Set-Cookie, body 없음)
export async function refresh() {
  await baseRequest(
    'POST',
    TEXT_HEADERS,
    '/api/auth/refresh',
    null,
    '토큰 갱신에 실패했습니다.',
    true
  );
  return true;
}

// 백엔드: POST /api/auth/logout (204, Set-Cookie clear)
export async function logout() {
  await baseRequest(
    'POST',
    TEXT_HEADERS,
    '/api/auth/logout',
    null,
    '로그아웃에 실패했습니다.',
    true
  );
  return true;
}