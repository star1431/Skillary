package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.Payment;

import java.time.LocalDateTime;

public record PaymentResponseDto(
		byte paymentId,
		String creatorName,
		String productName,
		int credit,
		String creditStatus,
		String creditMethod,
		LocalDateTime paidAt,
		String type
) {
	public static PaymentResponseDto from(Payment payment) {
		var subscription = payment.getOrder().getSubscriptionPlan();
		var content = payment.getOrder().getContent();

		String type, productName, creatorName;
		if (subscription == null) {
			type = "one-time";
			productName = content.getTitle();
			creatorName = content.getCreator().getDisplayName();
		} else {
			type = "subscription";
			creatorName = subscription.getCreator().getDisplayName();
			productName = subscription.getName();
		}

		return new PaymentResponseDto(
				payment.getPaymentId(),
				creatorName,
				productName,
				payment.getCredit(),
				payment.getCreditStatus().toString(),
				payment.getCreditMethod().toString(),
				payment.getPaidAt(),
				type
		);
	}
}
