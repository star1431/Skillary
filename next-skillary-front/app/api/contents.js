import baseRequest from './api';

/**
 * 콘텐츠 목록 조회 (페이지네이션)
 * @param {number} page - 페이지 번호 (기본값: 0)
 * @param {number} size - 페이지 크기 (기본값: 10)
 * @returns {Promise} 콘텐츠 목록 (Slice)
 */
export async function getContents(page = 0, size = 10) {
  return await baseRequest(
    'GET',
    {},
    `/contents?page=${page}&size=${size}`
  );
}

/**
 * 콘텐츠 상세 조회
 * @param {number} contentId - 콘텐츠 ID
 * @returns {Promise} 콘텐츠 상세 정보
 */
export async function getContent(contentId) {
  return await baseRequest(
    'GET',
    {},
    `/contents/${contentId}`
  );
}

/**
 * 인기 콘텐츠 목록 조회
 * @param {number} page - 페이지 번호 (기본값: 0)
 * @param {number} size - 페이지 크기 (기본값: 10)
 * @returns {Promise} 인기 콘텐츠 목록 (Slice)
 */
export async function getPopularContents(page = 0, size = 10) {
  return await baseRequest(
    'GET',
    {},
    `/contents/popular?page=${page}&size=${size}`
  );
}

/**
 * 크리에이터별 콘텐츠 목록 조회
 * @param {number} creatorId - 크리에이터 ID
 * @param {number} page - 페이지 번호 (기본값: 0)
 * @param {number} size - 페이지 크기 (기본값: 10)
 * @returns {Promise} 크리에이터별 콘텐츠 목록 (Slice)
 */
export async function getContentsByCreator(creatorId, page = 0, size = 10) {
  return await baseRequest(
    'GET',
    {},
    `/contents/creators/${creatorId}?page=${page}&size=${size}`
  );
}

/**
 * 카테고리별 콘텐츠 목록 조회
 * @param {string} category - 카테고리 (예: 'TECH', 'DESIGN', 'BUSINESS' 등)
 * @param {number} page - 페이지 번호 (기본값: 0)
 * @param {number} size - 페이지 크기 (기본값: 10)
 * @returns {Promise} 카테고리별 콘텐츠 목록 (Slice)
 */
export async function getContentsByCategory(category, page = 0, size = 10) {
  return await baseRequest(
    'GET',
    {},
    `/contents/category/${category}?page=${page}&size=${size}`
  );
}

/**
 * 카테고리 목록 조회
 * @returns {Promise} 카테고리 목록
 */
export async function getCategories() {
  return await baseRequest(
    'GET',
    {},
    '/contents/categories'
  );
}

/**
 * 콘텐츠 생성
 * @param {Object} data - 콘텐츠 데이터
 * @param {string} data.title - 제목
 * @param {string} data.description - 설명
 * @param {string} data.category - 카테고리 (CategoryEnum)
 * @param {number} [data.planId] - 구독 플랜 ID (유료 구독일 경우)
 * @param {number} [data.price] - 가격 (유료 단건 결제일 경우)
 * @param {string} [data.thumbnailUrl] - 썸네일 URL
 * @param {Object} [data.post] - 포스트 정보
 * @param {string} [data.post.body] - 포스트 본문
 * @param {string[]} [data.post.postFiles] - 포스트 파일 URL 목록
 * @param {number} creatorId - 크리에이터 ID (X-Creator-Id 헤더)
 * @returns {Promise} 생성된 콘텐츠 정보
 */
export async function createContent(data, creatorId) {
  return await baseRequest(
    'POST',
    {
      'X-Creator-Id': creatorId.toString()
    },
    '/contents',
    JSON.stringify(data)
  );
}

/**
 * 콘텐츠 수정
 * @param {number} contentId - 콘텐츠 ID
 * @param {Object} data - 수정할 콘텐츠 데이터
 * @param {string} data.title - 제목
 * @param {string} data.description - 설명
 * @param {string} data.category - 카테고리 (CategoryEnum)
 * @param {number} [data.planId] - 구독 플랜 ID (유료 구독일 경우)
 * @param {number} [data.price] - 가격 (유료 단건 결제일 경우)
 * @param {string} [data.thumbnailUrl] - 썸네일 URL
 * @param {Object} [data.post] - 포스트 정보
 * @param {string} [data.post.body] - 포스트 본문
 * @param {string[]} [data.post.postFiles] - 포스트 파일 URL 목록
 * @param {number} creatorId - 크리에이터 ID (X-Creator-Id 헤더)
 * @returns {Promise} 수정된 콘텐츠 정보
 */
export async function updateContent(contentId, data, creatorId) {
  return await baseRequest(
    'PUT',
    {
      'X-Creator-Id': creatorId.toString()
    },
    `/contents/${contentId}`,
    JSON.stringify(data)
  );
}

/**
 * 콘텐츠 삭제
 * @param {number} contentId - 콘텐츠 ID
 * @param {number} creatorId - 크리에이터 ID (X-Creator-Id 헤더)
 * @returns {Promise} null (204 No Content)
 */
export async function deleteContent(contentId, creatorId) {
  return await baseRequest(
    'DELETE',
    {
      'X-Creator-Id': creatorId.toString()
    },
    `/contents/${contentId}`
  );
}
