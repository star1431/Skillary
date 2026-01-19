import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

const clientKey = 'test_ck_yL0qZ4G1VO11Mw99NZLv8oWb2MQY';


// 카드 등록
export async function registerCard(
    customerKey,
    customerEmail = 'email@email.com',
    customerName = '홍길동',
    successUrl = '/cards/success',
    failUrl = '/cards/fail',
) {
  const tossPayments = await loadTossPayments(clientKey);
  if (!window.TossPayments)
    throw new Error("토스페이먼츠 SDK가 로드되지 않았습니다.");

  try {
    const payment = tossPayments.payment({ customerKey });

    return await payment.requestBillingAuth({
      method: 'CARD',
      successUrl: window.location.origin + successUrl,
      failUrl: window.location.origin + failUrl,
      customerEmail: customerEmail,
      customerName: customerName,
    });
  } catch (error) {
    alert(error.message || "카드 등록 중 오류가 발생했습니다.");
  }
}


// 단건 결제 승인
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

    await payment.requestPayment({
      method: "CARD",
      amount: {
        currency: "KRW",
        value: parseInt(credit),
      },
      orderId: orderId,
      orderName: orderName,
      successUrl: window.location.origin + `/payments/success`,
      failUrl: window.location.origin + `/payments/fail`,
      card: {
        useEscrow: false,
        flowMode: "DEFAULT",
        useCardPoint: false,
        useAppCardOnly: false,
      },
    });
  } catch (e) {
    alert(error.message || "결제 확인 중 오류가 발생했습니다.");
    throw new Error(e);
  }
}