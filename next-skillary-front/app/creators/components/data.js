export const creators = [
  {
    id: 1,
    name: '테크 인사이트',
    category: '개발/프로그래밍',
    description: '개발자를 위한 실무 노하우와 최신 기술 트렌드를 공유합니다.',
    subscribers: '1.3천명',
    avatar: null,
    bio: '10년 이상의 개발 경력을 가진 풀스택 개발자입니다. React, Node.js, TypeScript 등 최신 기술 스택을 활용한 실무 경험을 공유합니다. 다양한 프로젝트 경험을 바탕으로 실전에서 바로 활용할 수 있는 노하우를 전달합니다.',
    contentsCount: 45,
    joinedDate: '2023년 3월',
    gradientFrom: 'from-blue-100',
    gradientTo: 'to-blue-200',
    emoji: '👨‍💻',
    subscriptionPlans: [
      {
        id: 1,
        name: '베이직',
        price: 9900,
        period: '월',
        features: ['모든 무료 컨텐츠 이용', '주 1회 신규 컨텐츠 알림', '커뮤니티 참여']
      },
      {
        id: 2,
        name: '프리미엄',
        price: 19900,
        period: '월',
        features: ['모든 컨텐츠 무제한 이용', '신규 컨텐츠 우선 접근', '1:1 멘토링 (월 1회)', '커뮤니티 VIP 권한']
      }
    ]
  },
  {
    id: 2,
    name: '디자인 스튜디오',
    category: '디자인',
    description: 'UI/UX 디자인 기초부터 실무 케이스 스터디까지',
    subscribers: '850명',
    avatar: null,
    bio: '프로덕트 디자이너로 활동하며 다양한 브랜드의 디자인 시스템을 구축했습니다. 사용자 중심의 디자인 철학을 바탕으로 실무에서 바로 적용 가능한 디자인 방법론을 공유합니다.',
    contentsCount: 32,
    joinedDate: '2023년 6월',
    gradientFrom: 'from-green-100',
    gradientTo: 'to-green-200',
    emoji: '🎨',
    subscriptionPlans: [
      {
        id: 1,
        name: '스타터',
        price: 7900,
        period: '월',
        features: ['기본 디자인 컨텐츠 이용', '디자인 리소스 다운로드']
      },
      {
        id: 2,
        name: '프로',
        price: 14900,
        period: '월',
        features: ['모든 컨텐츠 무제한 이용', '프리미엄 디자인 템플릿', '포트폴리오 리뷰 (월 1회)']
      }
    ]
  },
  {
    id: 3,
    name: '마케팅 마스터',
    category: '마케팅',
    description: '디지털 마케팅 실전 가이드',
    subscribers: '1.7천명',
    avatar: null,
    bio: '디지털 마케팅 전문가로 15년 이상의 경력을 보유하고 있습니다. 성장 마케팅, 콘텐츠 마케팅, SEO 등 다양한 분야의 실전 노하우를 공유합니다.',
    contentsCount: 58,
    joinedDate: '2023년 1월',
    gradientFrom: 'from-purple-100',
    gradientTo: 'to-purple-200',
    emoji: '📈',
    subscriptionPlans: [
      {
        id: 1,
        name: '베이직',
        price: 11900,
        period: '월',
        features: ['마케팅 가이드 컨텐츠', '케이스 스터디 자료']
      },
      {
        id: 2,
        name: '비즈니스',
        price: 24900,
        period: '월',
        features: ['모든 컨텐츠 무제한 이용', '전략 컨설팅 (월 1회)', '마케팅 도구 템플릿']
      }
    ]
  },
  {
    id: 4,
    name: '비즈니스 전략가',
    category: '비즈니스',
    description: '스타트업 성장 전략과 비즈니스 분석',
    subscribers: '2.1천명',
    avatar: null,
    bio: '스타트업 창업과 성장 경험을 바탕으로 비즈니스 전략과 운영 노하우를 공유합니다. 데이터 기반 의사결정과 성장 전략 수립에 대한 인사이트를 제공합니다.',
    contentsCount: 67,
    joinedDate: '2022년 11월',
    gradientFrom: 'from-orange-100',
    gradientTo: 'to-orange-200',
    emoji: '💼',
    subscriptionPlans: [
      {
        id: 1,
        name: '스탠다드',
        price: 14900,
        period: '월',
        features: ['비즈니스 전략 컨텐츠', '분석 리포트 다운로드']
      },
      {
        id: 2,
        name: '엔터프라이즈',
        price: 29900,
        period: '월',
        features: ['모든 컨텐츠 무제한 이용', '1:1 전략 컨설팅 (월 2회)', '비즈니스 템플릿 제공']
      }
    ]
  }
];

export const categories = ['전체 카테고리', '개발/프로그래밍', '디자인', '마케팅', '비즈니스'];
