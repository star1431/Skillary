// Helper functions

export function getContentAccessBadgeVariant(accessType) {
  switch (accessType) {
    case 'FREE':
    case 'PREVIEW':
      return 'secondary';
    case 'SUBSCRIBER':
      return 'default';
    case 'PAID':
      return 'outline';
    default:
      return 'secondary';
  }
}

export function getContentAccessLabel(accessType, price) {
  switch (accessType) {
    case 'FREE':
    case 'PREVIEW':
      return '무료';
    case 'SUBSCRIBER':
      return '구독자 전용';
    case 'PAID':
      return typeof price === 'number' ? `₩${price.toLocaleString()}` : '단건 구매';
    default:
      // 혹시 모르는 값이 들어오면 그대로 노출하되, 빈 값은 방지
      return accessType || '';
  }
}

export function getStatusBadgeVariant(status) {
  switch (status) {
    case 'APPROVED':
    case 'ACTIVE':
    case 'SUCCESS':
    case 'PAID':
      return 'default';
    case 'PENDING':
    case 'CALCULATED':
      return 'secondary';
    case 'REJECTED':
    case 'CANCELLED':
    case 'FAILED':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export function getStatusLabel(status) {
  const labels = {
    APPROVED: '승인됨',
    PENDING: '대기 중',
    REJECTED: '거부됨',
    ACTIVE: '활성',
    INACTIVE: '비활성',
    CANCELLED: '취소됨',
    SUCCESS: '성공',
    FAILED: '실패',
    PAID: '지급 완료',
    CALCULATED: '정산 완료',
  };
  return labels[status] || status;
}

