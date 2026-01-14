package com.example.springskillaryback.common.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.PositiveOrZero;

public record PlanOrderRequestDto(
		@NotEmpty String email,
		@PositiveOrZero byte planId
) { }