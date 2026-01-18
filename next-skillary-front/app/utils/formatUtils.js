// 숫자 포맷팅 (k 단위, 소수점 2자리까지)
export const formatCount = (count) => {
  if (!count || count === 0) return '0';
  if (count < 1000) return count.toString();
  const kValue = count / 1000;
  // 소수점 2자리까지 표시, 끝의 0 제거
  return kValue.toFixed(2).replace(/\.?0+$/, '') + 'k';
};

// 날짜 포맷팅
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}. ${month}. ${day}.`;
};

