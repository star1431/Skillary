import { baseRequest } from './api';

/**
 * 마이페이지/프로필 설정/크리에이터 생성에서 사용하는 API + 유틸 모음
 *
 * 출처:
 * - app/auth/my-page/test/{api.js,utils.js,config.js} 를 통합/이동
 *
 * 주의:
 * - baseRequest는 기본 API_URL을 내부에서 보정하지만,
 *   파일 업로드(multipart)는 baseRequest를 못 쓰므로 여기서 API_URL을 따로 계산해 사용합니다.
 */

// POST /api/creators 는 201 + body 없음 → json 파싱을 피하려고 text/plain 사용
export const TEXT_HEADERS = { Accept: 'text/plain' };

// 파일 업로드 전용 API URL (baseRequest의 DEFAULT_API_URL 정책과 동일하게 맞춤)
const DEFAULT_API_URL = 'http://localhost:8080/api';
const API_URL = process.env.NEXT_PUBLIC_FRONT_API_URL || DEFAULT_API_URL;

/**
 * 프로필 이미지 업로드
 * - 백엔드: POST /api/files/image (multipart/form-data)
 * - 응답: 업로드된 파일의 URL(text/plain)
 */
export async function uploadProfileImage(file) {
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
    true);
}

export async function apiGetMyCreator() {
  return await baseRequest('GET', {}, '/creators/me', null, '크리에이터 정보를 불러오지 못했습니다.', true);
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
  await baseRequest('PUT', {}, '/users/me', JSON.stringify(payload), '유저 정보 수정에 실패했습니다.', true);
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

export function getRoleNames(roles) {
  if (!Array.isArray(roles)) return [];
  return roles.map((r) => (typeof r === 'string' ? r : r?.role)).filter(Boolean);
}

export function hasCreatorRole(roles) {
  return getRoleNames(roles).includes('ROLE_CREATOR');
}

