import { baseRequest } from './api';

/**
 * 1. 내 정산 내역 페이징 조회 (일반 사용자/크리에이터용)
 * GET /api/settlements?page=0&size=10
 */
export const getCreatorSettlements = async (page = 0, size = 10) => {
  return await baseRequest(
    'GET',
    {}, // 필요한 경우 { 'Authorization': `Bearer ${token}` } 추가
    `/api/settlements?page=${page}&size=${size}`,
    null
  );
};

/**
 * 2. 특정 정산 상세 조회
 * GET /api/settlements/{settlementId}
 */
export const getSettlementDetail = async (settlementId) => {
  return await baseRequest(
    'GET',
    {},
    `/api/settlements/${settlementId}`,
    null
  );
};

/**
 * 3. [관리자] 정산 실행 기록 페이징 조회
 * GET /api/settlements/admin?page=0&size=10
 */
export const getAdminSettlementRuns = async (page = 0, size = 10) => {
  return await baseRequest(
    'GET',
    {},
    `/api/settlements/admin?page=${page}&size=${size}`,
    null
  );
};