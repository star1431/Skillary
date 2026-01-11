// Mock data for the platform

export const mockUsers = [
  {
    id: 'user-1',
    email: 'user@example.com',
    nickname: '구독자1',
    role: 'USER',
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'test-user',
    email: 'test@test.com',
    nickname: '테스트 사용자',
    role: 'USER',
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'creator-1',
    email: 'creator@example.com',
    nickname: '크리에이터1',
    role: 'CREATOR',
    createdAt: new Date('2024-12-01'),
  },
  {
    id: 'admin-1',
    email: 'admin@example.com',
    nickname: '관리자',
    role: 'ADMIN',
    createdAt: new Date('2024-11-01'),
  },
];

// Helper function to add a new creator
export function addCreator(newCreator) {
  mockCreators.push(newCreator);
  return newCreator;
}

// Helper function to update a creator
export function updateCreator(creatorId, updates) {
  const index = mockCreators.findIndex((c) => c.id === creatorId);
  if (index !== -1) {
    mockCreators[index] = { ...mockCreators[index], ...updates };
    return mockCreators[index];
  }
  return null;
}

export const mockCreators = [
  {
    id: 'creator-profile-1',
    userId: 'creator-1',
    displayName: '테크 인사이트',
    profileImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
    bio: '개발자를 위한 실무 노하우와 최신 기술 트렌드를 공유합니다.',
    category: '개발/프로그래밍',
    subscriberCount: 1250,
    status: 'APPROVED',
    createdAt: new Date('2024-12-01'),
  },
  {
    id: 'creator-profile-2',
    userId: 'creator-2',
    displayName: '디자인 스튜디오',
    profileImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
    bio: 'UI/UX 디자인 기초부터 실무 케이스 스터디까지',
    category: '디자인',
    subscriberCount: 850,
    status: 'APPROVED',
    createdAt: new Date('2024-11-15'),
  },
  {
    id: 'creator-profile-3',
    userId: 'creator-3',
    displayName: '비즈니스 전략가',
    profileImage: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400',
    bio: '스타트업 성장 전략과 비즈니스 분석',
    category: '비즈니스',
    subscriberCount: 2100,
    status: 'APPROVED',
    createdAt: new Date('2024-10-20'),
  },
  {
    id: 'creator-profile-4',
    userId: 'creator-4',
    displayName: '마케팅 마스터',
    profileImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
    bio: '디지털 마케팅 실전 가이드',
    category: '마케팅',
    subscriberCount: 1680,
    status: 'APPROVED',
    createdAt: new Date('2024-11-05'),
  },
  {
    id: 'creator-profile-5',
    userId: 'creator-5',
    displayName: '신규 크리에이터',
    profileImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
    bio: '승인 대기 중인 크리에이터입니다.',
    category: '교육',
    subscriberCount: 0,
    status: 'PENDING',
    createdAt: new Date('2025-01-05'),
  },
];

export const mockPlans = [
  {
    id: 'plan-1',
    creatorId: 'creator-profile-1',
    name: '베이직 플랜',
    price: 9900,
    description: '월간 구독으로 모든 콘텐츠 접근',
    isActive: true,
    createdAt: new Date('2024-12-01'),
  },
  {
    id: 'plan-2',
    creatorId: 'creator-profile-1',
    name: '프리미엄 플랜',
    price: 19900,
    description: '1:1 질의응답 포함',
    isActive: true,
    createdAt: new Date('2024-12-01'),
  },
  {
    id: 'plan-3',
    creatorId: 'creator-profile-2',
    name: '스탠다드',
    price: 12000,
    description: '디자인 리소스 무제한 다운로드',
    isActive: true,
    createdAt: new Date('2024-11-15'),
  },
  {
    id: 'plan-4',
    creatorId: 'creator-profile-3',
    name: '월간 멤버십',
    price: 15000,
    description: '주간 비즈니스 리포트 제공',
    isActive: true,
    createdAt: new Date('2024-10-20'),
  },
];

export let mockContents = [
  {
    id: 'content-1',
    creatorId: 'creator-profile-1',
    title: 'React 19 새로운 기능 완벽 가이드',
    body: 'React 19에서 추가된 새로운 기능들을 상세히 알아봅니다. Server Components, Actions, 그리고 새로운 Hook들까지...',
    preview: 'React 19의 주요 변경사항을 간단히 소개합니다.',
    category: '개발/프로그래밍',
    accessType: 'PREVIEW',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600',
    createdAt: new Date('2025-01-08'),
    updatedAt: new Date('2025-01-08'),
  },
  {
    id: 'content-2',
    creatorId: 'creator-profile-1',
    title: 'TypeScript 고급 패턴: 타입 안전성 극대화',
    body: '실무에서 사용하는 TypeScript 고급 패턴들을 다룹니다. Generic, Conditional Types, Template Literal Types 등...',
    preview: '타입스크립트 기초를 넘어선 고급 패턴을 배워보세요.',
    category: '개발/프로그래밍',
    accessType: 'SUBSCRIBER',
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600',
    createdAt: new Date('2025-01-07'),
    updatedAt: new Date('2025-01-07'),
  },
  {
    id: 'content-3',
    creatorId: 'creator-profile-1',
    title: '시스템 아키텍처 설계 실전 케이스',
    body: '대규모 서비스의 아키텍처 설계 방법론과 실제 사례를 다룹니다. MSA, Event-Driven, CQRS 패턴 등...',
    preview: '시스템 설계의 핵심 개념을 알아봅니다.',
    category: '개발/프로그래밍',
    accessType: 'PAID',
    price: 5000,
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600',
    createdAt: new Date('2025-01-06'),
    updatedAt: new Date('2025-01-06'),
  },
  {
    id: 'content-4',
    creatorId: 'creator-profile-2',
    title: 'UI/UX 디자인 시스템 구축하기',
    body: '확장 가능한 디자인 시스템을 만드는 방법을 단계별로 설명합니다.',
    preview: '디자인 시스템의 기본 개념과 중요성',
    category: '디자인',
    accessType: 'SUBSCRIBER',
    thumbnail: 'https://images.unsplash.com/photo-1545235617-7a424c1a60cc?w=600',
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-05'),
  },
  {
    id: 'content-5',
    creatorId: 'creator-profile-2',
    title: 'Figma 플러그인 개발 가이드',
    body: 'Figma 플러그인을 만드는 전체 과정을 다룹니다.',
    category: '디자인',
    accessType: 'PREVIEW',
    thumbnail: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=600',
    createdAt: new Date('2025-01-04'),
    updatedAt: new Date('2025-01-04'),
  },
  {
    id: 'content-6',
    creatorId: 'creator-profile-3',
    title: '스타트업 성장 전략 2025',
    body: '2025년 스타트업이 주목해야 할 성장 전략과 투자 유치 방법',
    preview: '스타트업 생존을 위한 핵심 전략',
    category: '비즈니스',
    accessType: 'PAID',
    price: 8000,
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600',
    createdAt: new Date('2025-01-03'),
    updatedAt: new Date('2025-01-03'),
  },
  {
    id: 'content-7',
    creatorId: 'creator-profile-4',
    title: 'SEO 최적화 완벽 가이드',
    body: '검색 엔진 최적화의 모든 것을 다룹니다.',
    category: '마케팅',
    accessType: 'PREVIEW',
    thumbnail: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=600',
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-02'),
  },
  {
    id: 'content-8',
    creatorId: 'creator-profile-4',
    title: '소셜미디어 마케팅 전략',
    body: '인스타그램, 유튜브, 틱톡 마케팅 노하우',
    preview: '소셜미디어 성공 사례 분석',
    category: '마케팅',
    accessType: 'SUBSCRIBER',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
];

// 콘텐츠 추가/수정 함수
export function addContent(content) {
  const now = new Date();
  const newContent = {
    id: content.id || `content-${Date.now()}`,
    creatorId: content.creatorId,
    title: content.title,
    body: content.body,
    preview: content.preview,
    category: content.category,
    accessType: content.accessType,
    price: content.price,
    thumbnail: content.thumbnail || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600',
    createdAt: now,
    updatedAt: now,
  };
  mockContents.push(newContent);
  return newContent;
}

export function updateContent(contentId, updates) {
  const index = mockContents.findIndex((c) => c.id === contentId);
  if (index === -1) return null;
  
  mockContents[index] = {
    ...mockContents[index],
    ...updates,
    updatedAt: new Date(),
  };
  return mockContents[index];
}

export const mockSubscriptions = [
  {
    id: 'sub-1',
    userId: 'user-1',
    creatorId: 'creator-profile-1',
    planId: 'plan-1',
    status: 'ACTIVE',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-02-01'),
  },
  {
    id: 'sub-2',
    userId: 'user-1',
    creatorId: 'creator-profile-2',
    planId: 'plan-3',
    status: 'ACTIVE',
    startDate: new Date('2024-12-15'),
    endDate: new Date('2025-01-15'),
  },
];

export const mockPayments = [
  {
    id: 'pay-1',
    userId: 'user-1',
    orderId: 'ORD-2025-001',
    amount: 9900,
    method: 'CARD',
    status: 'SUCCESS',
    type: 'SUBSCRIPTION',
    subscriptionId: 'sub-1',
    paidAt: new Date('2025-01-01'),
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'pay-2',
    userId: 'user-1',
    orderId: 'ORD-2025-002',
    amount: 5000,
    method: 'CARD',
    status: 'SUCCESS',
    type: 'CONTENT',
    contentId: 'content-3',
    paidAt: new Date('2025-01-06'),
    createdAt: new Date('2025-01-06'),
  },
];

export const mockPurchases = [
  {
    id: 'pur-1',
    userId: 'user-1',
    contentId: 'content-3',
    paymentId: 'pay-2',
    purchasedAt: new Date('2025-01-06'),
  },
];

export const mockNotifications = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'PAYMENT_SUCCESS',
    message: '구독 결제가 완료되었습니다.',
    isRead: false,
    linkUrl: '/mypage/payments',
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: 'CONTENT_UPLOAD',
    message: '테크 인사이트에서 새 콘텐츠를 업로드했습니다.',
    isRead: false,
    linkUrl: '/content/content-1',
    createdAt: new Date('2025-01-08'),
  },
];

export const mockPayouts = [
  {
    id: 'payout-1',
    creatorId: 'creator-profile-1',
    month: '2024-12',
    gross: 500000,
    platformFee: 50000,
    payout: 450000,
    status: 'PAID',
    createdAt: new Date('2025-01-05'),
  },
  {
    id: 'payout-2',
    creatorId: 'creator-profile-1',
    month: '2025-01',
    gross: 320000,
    platformFee: 32000,
    payout: 288000,
    status: 'CALCULATED',
    createdAt: new Date('2025-01-09'),
  },
];

export const categories = [
  '개발/프로그래밍',
  '디자인',
  '비즈니스',
  '마케팅',
  '교육',
  '라이프스타일',
  '예술',
  '기타',
];

