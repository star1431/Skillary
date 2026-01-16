import baseRequest from './api';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

const clientKey = 'test_ck_yL0qZ4G1VO11Mw99NZLv8oWb2MQY';

export async function getCustomerKey(email) {
  return (await baseRequest(
    'POST',
    {},
    '/payments/customer-key',
    email,
    'customer key 를 가져오지 못했습니다.',
    true
  )).customerKey;
}

export async function singleOrder(contentId) {
  return await baseRequest(
    'POST',
    {},
    '/payments/orders/single',
    JSON.stringify({
      email: 'email@email.com', // 임시
      contentId: contentId
    }),
    '주문 생성 중 오류가 발생했습니다.',
    true
  );
}

export async function planOrder(planId) {
  return await baseRequest(
    'POST',
    {},
    '/payments/orders/plan',
    JSON.stringify({
      email: 'email@email.com', // 임시
      planId: planId
    }),
    '주문 생성 중 오류가 발생했습니다.',
    true
  );
}


// 카드 등록
export async function billingAuth(customerKey) {
  const tossPayments = await loadTossPayments(clientKey);
  if (!window.TossPayments)
    throw new Error("토스페이먼츠 SDK가 로드되지 않았습니다.");
  try {
    const payment = tossPayments.payment({ customerKey });

    return await payment.requestBillingAuth({
      method: 'CARD',
      successUrl: window.location.origin + '/cards/success',
      failUrl: window.location.origin + '/cards/fail',
      customerEmail: 'email@email.com',
      customerName: '박성훈',
    });
  } catch (error) {
    alert(error.message || "카드 등록 중 오류가 발생했습니다.");
  }
}

export async function createCard(customerKey, authKey) {
  return await baseRequest(
    'POST',
    {},
    `/payments/cards/create`,
    JSON.stringify({
      email: 'email@email.com',
      customerKey: customerKey,
      authKey: authKey
    }),
    '서버에 결제 수단 등록 실패하였습니다.',
    true
  );
}

export async function pagingCard(page = 0, size = 10) {
  return await baseRequest(
    'GET',
    {},
    `/payments/cards?page=${page}&size=${size}`, // 백엔드 엔드포인트에 맞게 수정
    null,
    "카드 목록을 불러오는데 실패했습니다.",
    true
  );
}


export async function confirmBillingPay(
  customerKey,
  orderId,
  planName,
  amount
) {
  return !!(await baseRequest(
    'POST',
    {},
    `/payments/complete/billing`,
    JSON.stringify({
      customerKey: customerKey,
      email: 'email@email.com',
      orderId: orderId,
      planName: planName,
      amount: amount
    }),
    '플랜 결제 실패',
    true
  ));
  const response = await baseRequest(
    'POST',
    {},
    `/payments/complete/billing`,
    JSON.stringify({
      customerKey: customerKey,
      email: 'email@email.com',
      orderId: orderId,
      planName: planName,
      amount: amount
    }),
    '플랜 결제 실패',
    true
  );
  if (response === undefined || !response) {
    return null;
  }

  alert("결제가 완료되었습니다!");
  return response;
}


export async function confirmSinglePay(
  customerKey,
  orderId,
  orderName,
  credit
) {
  const tossPayments = await loadTossPayments(clientKey);
  if (!window.TossPayments)
    throw new Error("토스페이먼츠 SDK가 로드되지 않았습니다.");

  try {
    const payment = tossPayments.payment({ customerKey });

    return await payment.requestPayment({
      method: "CARD",
      amount: {
        currency: "KRW",
        value: parseInt(credit),
      },
      orderId: orderId,
      orderName: orderName,
      successUrl: window.location.origin + "/payments/success",
      failUrl: window.location.origin + "/payments/fail",
      card: {
        useEscrow: false,
        flowMode: "DEFAULT",
        useCardPoint: false,
        useAppCardOnly: false,
      },
    });
  } catch (e) {
    alert(error.message || "결제 확인 중 오류가 발생했습니다.");
  }
}


export async function completeSinglePay(
  orderId,
  paymentKey,
  amount
) {
  return await baseRequest(
    'POST',
    {},
    `/payments/complete/single`,
    JSON.stringify({
      email: 'email@email.com',
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
    null
  );
}

export async function pagingOrder(
  page = 0, size = 10
) {
  return await baseRequest(
    'GET',
    {},
    `/payments/orders?page=${page}&size=${size}`,
    null
  );
}

export async function restartOrder(
  orderId
) {
  return await baseRequest(
    'GET',
    {},
    `/payments/restart/${orderId}`,
    null
  );
}

export async function withdrawCard(
  cardId
) {
  return await baseRequest(
    'DELETE',
    {},
    `/payments/card/${cardId}`,
    null
  );
}