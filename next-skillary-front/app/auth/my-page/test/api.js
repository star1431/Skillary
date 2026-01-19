import { baseRequest } from '../../../api/api';
import { API_URL, TEXT_HEADERS } from './config';

/**
 * test 페이지 전용 API 래퍼
 * - baseRequest의 에러 처리/쿠키 포함 로직을 그대로 사용
 * - "201 + body 없음" 같은 케이스는 Accept 헤더로 회피
 */

/**
 * 프로필 이미지 업로드
 * - 백엔드: POST /api/files/image (multipart/form-data)
 * - 응답: 업로드된 파일의 URL(text/plain)
 */
export async function uploadProfileImage(file) {
  if (!API_URL) throw new Error('NEXT_PUBLIC_FRONT_API_URL이 설정되지 않았습니다.');
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/files/image`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(msg || '이미지 업로드에 실패했습니다.');
  }
  return await res.text();
}

export async function apiGetMe() {
  return await baseRequest(
    'GET',
    {},
    '/users/me',
    null,
    '유저 정보를 불러오지 못했습니다.',
    true,
  );
}

export async function apiGetMyCreator() {
  return await baseRequest(
    'GET',
    {},
    '/creators/me',
    null,
    '크리에이터 정보를 불러오지 못했습니다.',
    true,
  );
}

export async function apiCreateCreator(payload) {
  await baseRequest(
    'POST',
    TEXT_HEADERS, // 201 + body 없음 → json 파싱 방지
    '/creators',
    JSON.stringify(payload),
    '크리에이터 생성에 실패했습니다.',
    true,
  );
}

export async function apiUpdateUserMe(payload) {
  await baseRequest(
    'PUT',
    {},
    '/users/me',
    JSON.stringify(payload),
    '유저 정보 수정에 실패했습니다.',
    true,
  );
}

export async function apiUpdateCreatorMe(payload) {
  await baseRequest(
    'PUT',
    {},
    '/creators/me',
    JSON.stringify(payload),
    '프로필 수정(유저+크리에이터)에 실패했습니다.',
    true,
  );
}

