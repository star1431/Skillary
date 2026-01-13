package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.CategoryEnum;
import com.example.springskillaryback.domain.Content;

import java.time.LocalDateTime;


public record ContentListResponseDto(
		Byte contentId,
		String title,
		String description,
		CategoryEnum category,
		Byte creatorId,
		String creatorName,
		Byte planId,
		Integer price,
		String thumbnailUrl,
		LocalDateTime createdAt,
		LocalDateTime updatedAt,
		Integer viewCount
) {
	public static ContentListResponseDto from(Content content) {
		return new ContentListResponseDto(
			content.getContentId(),
			content.getTitle(),
			content.getDescription(),
			content.getCategory(),
			content.getCreator().getCreatorId(),
			content.getCreator().getDisplayName(),
			content.getPlan() != null ? content.getPlan().getPlanId() : null,
			content.getPrice(),
			content.getThumbnailUrl(),
			content.getCreatedAt(),
			content.getUpdatedAt(),
			content.getViewCount() != null ? content.getViewCount() : 0
		);
	}
}

