// Route configuration and route matching utilities

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  CATEGORIES: '/categories',
  CREATORS: '/creators',
  CREATOR_PROFILE: '/creator/:id',
  CONTENT_DETAIL: '/content/:id',
  PAYMENT_SUBSCRIPTION: '/payment/subscription',
  PAYMENT_CONTENT: '/payment/content',
  MY_PAGE: '/mypage',
  MY_PAYMENTS: '/mypage/payments',
  MY_NOTIFICATIONS: '/mypage/notifications',
  CONTENT_NEW: '/mypage/content/new',
  CONTENT_EDIT: '/mypage/content/edit/:id',
  ADMIN: '/admin',
};

function matchDynamicRoute(path, template) {
  const paramNames = [];
  const escaped = template.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = '^' + escaped.replace(/:([^/]+)/g, (_m, name) => {
    paramNames.push(name);
    return '([^/]+)';
  }) + '$';
  const regex = new RegExp(pattern);
  const match = path.match(regex);
  if (!match) return null;

  const params = {};
  paramNames.forEach((name, idx) => {
    params[name] = match[idx + 1];
  });
  return params;
}

// Helper functions for generating dynamic routes
export function getCreatorProfilePath(creatorId) {
  return ROUTES.CREATOR_PROFILE.replace(':id', creatorId);
}

export function getContentDetailPath(contentId) {
  return ROUTES.CONTENT_DETAIL.replace(':id', contentId);
}

export function getContentEditPath(contentId) {
  return ROUTES.CONTENT_EDIT.replace(':id', contentId);
}

export function getPaymentSubscriptionPath(planId) {
  return `${ROUTES.PAYMENT_SUBSCRIPTION}?planId=${planId}`;
}

export function getPaymentContentPath(contentId) {
  return `${ROUTES.PAYMENT_CONTENT}?contentId=${contentId}`;
}

export function getCategoriesPath(category) {
  return category ? `${ROUTES.CATEGORIES}?category=${encodeURIComponent(category)}` : ROUTES.CATEGORIES;
}

export function matchRoute(fullPath) {
  // Split path and query string
  const [path, searchString] = fullPath.split('?');
  
  // Exact route matches (without query params)
  if (path === ROUTES.HOME) return { route: 'home', params: {} };
  if (path === ROUTES.LOGIN) return { route: 'login', params: {} };
  if (path === ROUTES.SIGNUP) return { route: 'signup', params: {} };
  if (path === ROUTES.CREATORS) return { route: 'creators', params: {} };
  if (path === ROUTES.MY_PAGE) return { route: 'myPage', params: {} };
  if (path === ROUTES.MY_PAYMENTS) return { route: 'myPayments', params: {} };
  if (path === ROUTES.MY_NOTIFICATIONS) return { route: 'notifications', params: {} };
  if (path === ROUTES.CONTENT_NEW) return { route: 'contentNew', params: {} };
  if (path === ROUTES.ADMIN) return { route: 'admin', params: {} };
  
  // Dynamic routes
  const creatorParams = matchDynamicRoute(path, ROUTES.CREATOR_PROFILE);
  if (creatorParams) return { route: 'creatorProfile', params: creatorParams };
  
  const contentParams = matchDynamicRoute(path, ROUTES.CONTENT_DETAIL);
  if (contentParams) return { route: 'contentDetail', params: contentParams };
  
  const contentEditParams = matchDynamicRoute(path, ROUTES.CONTENT_EDIT);
  if (contentEditParams) return { route: 'contentEdit', params: contentEditParams };
  
  // Categories - check exact match first, then with query params
  if (path === ROUTES.CATEGORIES) {
    if (searchString) {
      const searchParams = new URLSearchParams(searchString);
      return { route: 'categories', params: { category: searchParams.get('category') } };
    }
    return { route: 'categories', params: {} };
  }
  
  // Payment routes with query params
  if (path.startsWith(ROUTES.PAYMENT_SUBSCRIPTION)) {
    const searchParams = new URLSearchParams(searchString || '');
    return { route: 'paymentSubscription', params: { planId: searchParams.get('planId') } };
  }
  
  if (path.startsWith(ROUTES.PAYMENT_CONTENT)) {
    const searchParams = new URLSearchParams(searchString || '');
    return { route: 'paymentContent', params: { contentId: searchParams.get('contentId') } };
  }
  
  return { route: 'notFound', params: {} };
}

