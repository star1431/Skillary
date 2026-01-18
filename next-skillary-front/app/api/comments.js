import { baseRequest } from './api';

/**
 * 댓글 목록 조회
 * @param {number} contentId - 콘텐츠 ID
 * @returns {Promise} 댓글 목록
 */
export async function getComments(contentId) {
  return await baseRequest(
    'GET',
    {},
    `/contents/${contentId}/comments`,
    null,
    '댓글 목록 조회 중 오류가 발생했습니다.',
    true // credentials: include (쿠키 전송)
  );
}

/**
 * 댓글 추가
 * @param {number} contentId - 콘텐츠 ID
 * @param {Object} data - 댓글 데이터
 * @param {string} data.comment - 댓글 내용
 * @param {number} [data.parentId] - 부모 댓글 ID (대댓글인 경우)
 * @returns {Promise} 생성된 댓글 정보
 */
export async function addComment(contentId, data) {
  return await baseRequest(
    'POST',
    {},
    `/contents/${contentId}/comments`,
    JSON.stringify(data),
    '댓글 작성 중 오류가 발생했습니다.',
    true // credentials: include (쿠키 전송)
  );
}

/**
 * 댓글 수정
 * @param {number} contentId - 콘텐츠 ID
 * @param {number} commentId - 댓글 ID
 * @param {Object} data - 수정할 댓글 데이터
 * @param {string} data.comment - 댓글 내용
 * @returns {Promise} 수정된 댓글 정보
 */
export async function updateComment(contentId, commentId, data) {
  return await baseRequest(
    'PUT',
    {},
    `/contents/${contentId}/comments/${commentId}`,
    JSON.stringify(data),
    '댓글 수정 중 오류가 발생했습니다.',
    true // credentials: include (쿠키 전송)
  );
}

/**
 * 댓글 삭제
 * @param {number} contentId - 콘텐츠 ID
 * @param {number} commentId - 댓글 ID
 * @returns {Promise} null (204 No Content)
 */
export async function deleteComment(contentId, commentId) {
  return await baseRequest(
    'DELETE',
    {},
    `/contents/${contentId}/comments/${commentId}`,
    null,
    '댓글 삭제 중 오류가 발생했습니다.',
    true // credentials: include (쿠키 전송)
  );
}

/**
 * 댓글 좋아요 토글
 * @param {number} contentId - 콘텐츠 ID
 * @param {number} commentId - 댓글 ID
 * @returns {Promise} null (200 OK)
 */
export async function toggleLike(contentId, commentId) {
  return await baseRequest(
    'POST',
    {},
    `/contents/${contentId}/comments/${commentId}/like`,
    null,
    '좋아요 처리 중 오류가 발생했습니다.',
    true // credentials: include (쿠키 전송)
  );
}




