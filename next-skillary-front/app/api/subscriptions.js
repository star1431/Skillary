import { baseRequest } from './api';


export async function createSubscriptionPlan(planName, description, price) {
  const result = await baseRequest(
    'POST',
    {},
    '/subscriptions',
    JSON.stringify({
      planName,
      description,
      price
    }),
    "구독 플랜 생성 실패",
    true
  );
  return result;
}

export async function pagingSubscriptionPlans(page = 0, size = 10) {
  const result = await baseRequest(
    'GET',
    {},
    `/subscriptions/plans?page=${page}&size=${size}`,
    null,
    "구독 플랜 목록 불러오기 실패",
    true
  );
  return result;
}

export async function getSubscriptionPlan(planId) {
  const result = await baseRequest(
    'GET',
    {},
    `/subscriptions/${planId}`,
    null,
    "시스템에 등록되어있지 않습니다.",
    false
  );
  return result;
}

export async function getSubscriptions(
  page = 0,
  size = 10
) {
  const result = await baseRequest(
    'GET',
    {},
    `/subscriptions?page=${page}&size=${size}`,
    null,
    "구독 목록 불러오기 실패",
    true
  );
  return result;
}

export async function deleteSubscriptionPlan(planId) {
  const result = await baseRequest(
    'DELETE',
    {},
    `/subscriptions/plans/${planId}`,
    null,
    "구독 플랜 삭제 실패",
    true
  );
  
  return result === null; 
}

// 구독 취소
export async function unsubscribe (
  planId = 1
) {
  const result = await baseRequest(
    'DELETE',
    {},
    `/subscriptions/${planId}`,
    null,
    "구독 해지 실패 문의해주세요",
    true
  );
  return result === null;
}