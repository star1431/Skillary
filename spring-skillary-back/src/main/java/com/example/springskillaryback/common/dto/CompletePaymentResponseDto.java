package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.Payment;

public record CompletePaymentResponseDto(
		String paymentKey,
		String orderId,
		int price
) {
	public static CompletePaymentResponseDto from(Payment payment) {
		return new CompletePaymentResponseDto(
				payment.getPaymentKey(),
				payment.getOrder().getOrderId().toString(),
				payment.getCredit()
		);
	}
}
