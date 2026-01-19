import baseRequest from './api';

export async function getCustomerKey() {
  return (await baseRequest(
    'POST',
    {},
    '/payments/customer-key',
    null,
    'customer key 를 가져오지 못했습니다.',
    true
  )).customerKey;
}

export async function paymentOrder(contentId) {
  return await baseRequest(
    'POST',
    {},
    '/payments/orders/payment',
    JSON.stringify({
      contentId: contentId
    }),
    '주문 생성 중 오류가 발생했습니다.',
    true
  );
}

export async function billingOrder(planId) {
  return await baseRequest(
    'POST',
    {},
    '/payments/orders/billing',
    JSON.stringify({
      planId: planId
    }),
    '주문 생성 중 오류가 발생했습니다.',
    true
  );
}


export async function createCard(
  customerKey,
  authKey
) {
  const res = await baseRequest(
    'POST',
    {},
    `/payments/cards`,
    JSON.stringify({
      customerKey: customerKey,
      authKey: authKey
    }),
    '서버에 결제 수단 등록 실패하였습니다.',
    true
  );
  return res === null;
}


export async function pagingCard(
  page = 0,
  size = 10
) {
  return await baseRequest(
    'GET',
    {},
    `/payments/cards?page=${page}&size=${size}`,
    null,
    "카드 목록을 불러오는데 실패했습니다.",
    true
  );
}


export async function completeBilling({
  customerKey,
  orderId,
  planName,
  subscriptionFee
}) {
  const response = await baseRequest(
    'POST',
    {},
    `/payments/complete/billing`,
    JSON.stringify({
      customerKey: customerKey,
      orderId: orderId,
      planName: planName,
      subscriptionFee: subscriptionFee
    }),
    '플랜 결제 실패',
    true
  );
  
  if (response === undefined || !response)
    return null;

  alert("결제가 완료되었습니다!");
  return response;
}

export async function completePayment(
  orderId,
  paymentKey,
  amount
) {
  return await baseRequest(
    'POST',
    {},
    `/payments/complete/payment`,
    JSON.stringify({
      paymentKey: paymentKey,
      orderId: orderId,
      amount: amount
    }),
    "지불 정보가 일치하지 않음",
    true
  );
}

export async function pagingPayments(
  page = 0, size = 10
) {
  return await baseRequest(
    'GET',
    {},
    `/payments?page=${page}&size=${size}`,
    null,
    "결제 내역을 불러오는데 실패했습니다.",
    true
  );
}

export async function pagingOrders(
  page = 0,
  size = 10
) {
  return await baseRequest(
    'GET',
    {},
    `/payments/orders?page=${page}&size=${size}`,
    null,
    "주문 내역을 불러오는데 실패했습니다.",
    true
  );
}

export async function retrieveOrder(
  orderId
) {
  return await baseRequest(
    'GET',
    {},
    `/payments/${orderId}`,
    null,
    "주문 내역을 불러오는데 실패했습니다.",
    true
  );
}

export async function withdrawCard(
  cardId
) {
  const res = await baseRequest(
    'DELETE',
    {},
    `/payments/card/${cardId}`,
    null,
    "카드 삭제에 실패했습니다.",
    true
  );
  return res === null;
}