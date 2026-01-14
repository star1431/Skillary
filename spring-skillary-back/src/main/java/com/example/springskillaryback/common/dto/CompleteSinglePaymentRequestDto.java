package com.example.springskillaryback.common.dto;

public record CompleteSinglePaymentRequestDto(
		String email,
		String orderId,
		String paymentKey,
		int amount
) { }
