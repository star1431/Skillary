package com.example.springskillaryback.common.dto;

import jakarta.validation.constraints.NotEmpty;

public record CardRequestDto(
		@NotEmpty String email,
		@NotEmpty String customerKey,
		@NotEmpty String authKey
) { }
