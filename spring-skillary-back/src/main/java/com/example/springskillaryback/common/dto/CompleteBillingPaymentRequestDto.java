package com.example.springskillaryback.common.dto;

public record CompleteBillingPaymentRequestDto(
		String email,
		String orderId,
		String planName,
		String customerKey,
		int amount
) { }