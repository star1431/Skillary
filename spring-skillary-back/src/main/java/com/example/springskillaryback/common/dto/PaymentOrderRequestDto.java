package com.example.springskillaryback.common.dto;

import jakarta.validation.constraints.PositiveOrZero;

public record PaymentOrderRequestDto(
		@PositiveOrZero byte contentId
) { }
