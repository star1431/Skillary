/**
 * test 페이지 전용 유틸
 * - 백엔드 roles 응답 형태 차이를 흡수
 * - "크리에이터 권한(ROLE_CREATOR)" 여부를 간단히 판단
 */

export function asText(v) {
  return String(v ?? '');
}

// roles 응답이 Role 객체 배열 형태라서 "ROLE_XXX" 문자열만 뽑아냄
export function getRoleNames(roles) {
  if (!Array.isArray(roles)) return [];
  return roles
    .map((r) => (typeof r === 'string' ? r : r?.role))
    .filter(Boolean);
}

export function hasCreatorRole(roles) {
  return getRoleNames(roles).includes('ROLE_CREATOR');
}

