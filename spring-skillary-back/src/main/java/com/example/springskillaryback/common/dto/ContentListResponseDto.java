package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.CategoryEnum;
import java.time.LocalDateTime;

public record ContentListResponseDto(
		Byte contentId,
		String title,
		String description,
		CategoryEnum category,
		Byte creatorId,
		String creatorName,
		String profileImageUrl,
		Byte planId,
		Integer price,
		String thumbnailUrl,
		LocalDateTime createdAt,
		LocalDateTime updatedAt,
		Integer viewCount,
		Integer likeCount
) {
}

