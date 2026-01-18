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
const DEFAULT_API_URL = 'http://localhost:8080/api';
const API_URL = process.env.NEXT_PUBLIC_FRONT_API_URL || DEFAULT_API_URL;

// 백엔드: POST /api/auth/login (201, Set-Cookie, body 없음)
export async function login(email, password) {
  await baseRequest(
    'POST',
    TEXT_HEADERS,
    '/auth/login',
    JSON.stringify({ email, password }),
    '로그인에 실패했습니다.',
    true // credentials include (쿠키 수신/전송)
  );
  return true;
}

// 로그인 상태 체크 용도:
// - 201: 로그인 상태(AT 재발급 성공)
// - 401: 비로그인/세션 만료(정상 케이스) → throw/log 없이 false 반환
export async function silentRefresh() {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: TEXT_HEADERS,
      credentials: 'include',
    });

    if (res.status === 401) return false;
    return res.ok;
  } catch {
    return false;
  }
}

// 백엔드: POST /api/auth/refresh (201, Set-Cookie, body 없음)
export async function refresh() {
  await baseRequest(
    'POST',
    TEXT_HEADERS,
    '/auth/refresh',
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
    '/auth/logout',
    null,
    '로그아웃에 실패했습니다.',
    true
  );
  return true;
}

// 백엔드: GET /api/users/me (200, 현재 사용자 정보)
export async function getCurrentUser() {
  return await baseRequest(
    'GET',
    {},
    '/users/me',
    null,
    '사용자 정보를 가져오는데 실패했습니다.',
    true
  )
}