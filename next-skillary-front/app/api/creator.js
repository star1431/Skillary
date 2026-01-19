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

/**
 * 현재 로그인한 크리에이터 정보 조회
 * @returns {Promise} 현재 크리에이터 정보 (creatorId, name, email, profile)
 */
export async function getCurrentCreator() {
  return await baseRequest(
    'GET',
    {},
    '/creators/me',
    null,
    '크리에이터 정보를 가져오는데 실패했습니다.',
    true // credentials: include (쿠키 전송)
  );
}