// Application constants

export const USER_ROLES = {
  USER: 'USER',
  CREATOR: 'CREATOR',
  ADMIN: 'ADMIN',
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  CANCELLED: 'CANCELLED',
};

export const CREATOR_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
};

export const PAYMENT_METHOD = {
  CARD: 'CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  MOBILE: 'MOBILE',
};

export const PAYMENT_TYPE = {
  SUBSCRIPTION: 'SUBSCRIPTION',
  CONTENT: 'CONTENT',
};

export const PAYOUT_STATUS = {
  CALCULATED: 'CALCULATED',
  PAID: 'PAID',
};

export const CONTENT_ACCESS_TYPE = {
  FREE: 'FREE', // 무료 (PREVIEW와 호환)
  PREVIEW: 'PREVIEW', // 무료 (기존 호환용)
  SUBSCRIBER: 'SUBSCRIBER', // 구독자 전용
  PAID: 'PAID', // 단건 구매
};

export const CONTENT_ACCESS_TYPE_LABELS = {
  FREE: '무료',
  PREVIEW: '무료',
  SUBSCRIBER: '구독자 전용',
  PAID: '단건 구매',
};

export const NOTIFICATION_TYPE = {
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  CONTENT_UPLOAD: 'CONTENT_UPLOAD',
  SUBSCRIPTION_EXPIRING: 'SUBSCRIPTION_EXPIRING',
  SYSTEM: 'SYSTEM',
};

export const APP_CONFIG = {
  NAME: 'Skillary',
  DESCRIPTION: '크리에이터와 구독자를 연결하는 플랫폼',
  COPYRIGHT: '© 2025 Skillary. All rights reserved.',
};

