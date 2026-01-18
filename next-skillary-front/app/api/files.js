const DEFAULT_API_URL = 'http://localhost:8080/api';
const API_URL = process.env.NEXT_PUBLIC_FRONT_API_URL || DEFAULT_API_URL;

/**
 * 이미지 업로드
 * @param {File} file - 업로드할 이미지 파일
 * @returns {Promise<string>} 업로드된 이미지 URL
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const fullUrl = `${API_URL}/files/image`;

  try {
    const response = await fetch(fullUrl, {
      method: 'POST',
      body: formData,
      credentials: 'include', // 쿠키 전송
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '이미지 업로드 실패');
      throw new Error(errorText || '이미지 업로드 중 오류가 발생했습니다.');
    }

    const imageUrl = await response.text();
    return imageUrl;
  } catch (e) {
    console.error(`[File Upload Error] ${fullUrl}:`, e.message);
    throw e;
  }
}

/**
 * 영상 업로드 (현재 에디터 호환 확인중)
 * @param {File} file - 업로드할 영상 파일
 * @returns {Promise<string>} 업로드된 영상 URL
 */
export async function uploadVideo(file) {
  const formData = new FormData();
  formData.append('file', file);

  const fullUrl = `${API_URL}/files/video`;

  try {
    const response = await fetch(fullUrl, {
      method: 'POST',
      body: formData,
      credentials: 'include', // 쿠키 전송
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '영상 업로드 실패');
      throw new Error(errorText || '영상 업로드 중 오류가 발생했습니다.');
    }

    const videoUrl = await response.text();
    return videoUrl;
  } catch (e) {
    console.error(`[File Upload Error] ${fullUrl}:`, e.message);
    throw e;
  }
}


