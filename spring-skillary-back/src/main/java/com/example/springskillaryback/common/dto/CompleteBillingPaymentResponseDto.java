package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.Payment;

public record CompleteBillingPaymentResponseDto(
		String paymentKey,
		String orderId,
		int amount
) {
	public static CompleteBillingPaymentResponseDto from(Payment payment) {
		var plan = payment.getOrder().getSubscriptionPlan();
		return new CompleteBillingPaymentResponseDto(
				payment.getPaymentKey(),
				payment.getOrder().getOrderId().toString(),
				payment.getCredit()
		);
	}
}