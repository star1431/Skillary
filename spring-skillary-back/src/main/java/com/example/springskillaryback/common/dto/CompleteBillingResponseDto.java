package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.Payment;

public record CompleteBillingResponseDto(
		String paymentKey,
		String orderId,
		int amount
) {
	public static CompleteBillingResponseDto from(Payment payment) {
		var plan = payment.getOrder().getSubscriptionPlan();
		return new CompleteBillingResponseDto(
				payment.getPaymentKey(),
				payment.getOrder().getOrderId().toString(),
				payment.getCredit()
		);
	}
}