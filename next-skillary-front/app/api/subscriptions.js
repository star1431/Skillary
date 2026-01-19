import { baseRequest } from './api';

export async function getSubscriptions(
  userId = 1,
  page = 0,
  size = 10
) {
  const result = await baseRequest(
    'GET',
    {},
    `/subscriptions?userId=${userId}&page=${page}&size=${size}`,
    null
  );
  return result;
}

// 구독 취소
export async function unsubscribe (
  userId = 1,
  planId = 1
) {
  const result = await baseRequest(
    'DELETE',
    {},
    `/subscriptions/${planId}?userId=${userId}`,
    null
  );
  return result === null;
}