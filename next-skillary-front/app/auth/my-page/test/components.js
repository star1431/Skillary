/**
 * test 페이지에서만 쓰는 아주 작은 표시용 컴포넌트들
 * - UI를 예쁘게 만들기보단 "데이터가 찍히는지" 확인 용도
 */
import { asText } from './utils';

// profile URL이 있으면 img로 미리보기
export function PreviewImage({ src, alt }) {
  if (!src) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <img
        src={src}
        alt={alt}
        style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 8 }}
      />
    </div>
  );
}

// 간단 출력용 key/value 줄
export function InfoRow({ label, value }) {
  return (
    <div>
      {label}: {asText(value)}
    </div>
  );
}

