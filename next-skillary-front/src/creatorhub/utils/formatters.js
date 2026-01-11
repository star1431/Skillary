// Formatter utilities

export function formatCurrency(amount) {
  if (typeof amount !== 'number') return '';
  return `₩${amount.toLocaleString()}`;
}

export function formatDate(date) {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  return dateObj.toLocaleDateString('ko-KR');
}

export function formatDateTime(date) {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  return dateObj.toLocaleString('ko-KR');
}

export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function formatSubscriberCount(count) {
  if (typeof count !== 'number') return '0';
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}만`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}천`;
  }
  return count.toLocaleString();
}

