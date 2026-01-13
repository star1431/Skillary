package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.CategoryEnum;
import com.example.springskillaryback.domain.Content;

import java.time.LocalDateTime;

public record ContentResponseDto(
		Byte contentId,
		String title,
        String description,
		CategoryEnum category,
		Byte creatorId,
		Byte planId,
		Integer price,
		String thumbnailUrl,
		LocalDateTime createdAt,
		LocalDateTime updatedAt,
		Integer viewCount,
		PostResponseDto post
) {
	public static ContentResponseDto from(Content content) {
		return new ContentResponseDto(
			content.getContentId(),
			content.getTitle(),
            content.getDescription(),
			content.getCategory(),
			content.getCreator().getCreatorId(),
			content.getPlan() != null ? content.getPlan().getPlanId() : null,
			content.getPrice(),
			content.getThumbnailUrl(),
			content.getCreatedAt(),
			content.getUpdatedAt(),
			content.getViewCount() != null ? content.getViewCount() : 0,
			content.getPost() != null ? PostResponseDto.from(content.getPost()) : null
		);
	}
}

