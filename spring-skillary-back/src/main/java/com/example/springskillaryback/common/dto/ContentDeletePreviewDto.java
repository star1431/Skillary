package com.example.springskillaryback.common.dto;

import java.time.LocalDateTime;

public record ContentDeletePreviewDto(
		boolean hasPaidUsers,
		LocalDateTime deletedAt
) {
}

