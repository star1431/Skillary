import { baseRequest } from './api';

/**
 * 현재 로그인한 사용자 정보 조회
 * @returns {Promise} 현재 로그인한 사용자 정보 (userId, email, nickname, profile)
 */
export async function getCurrentUser() {
  return await baseRequest(
    'GET',
    {},
    '/users/me',
    null,
    '사용자 정보를 가져오는데 실패했습니다.',
    true // credentials: include (쿠키 전송)
  );
}