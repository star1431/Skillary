package com.example.springskillaryback.common.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;

public record CompletePaymentRequestDto(
		@NotEmpty String orderId,
		@NotEmpty String paymentKey,
		@Positive int amount
) { }
