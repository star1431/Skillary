package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.CategoryEnum;
import com.example.springskillaryback.domain.Content;

import java.time.LocalDateTime;

public record ContentResponseDto(
		Byte contentId,
		String title,
		CategoryEnum category,
		Byte creatorId,
		Byte planId,
		String thumbnailUrl,
		LocalDateTime createdAt,
		LocalDateTime updatedAt,
		PostResponseDto post
) {
	public static ContentResponseDto from(Content content) {
		return new ContentResponseDto(
			content.getContentId(),
			content.getTitle(),
			content.getCategory(),
			content.getCreator().getCreatorId(),
			content.getPlan() != null ? content.getPlan().getPlanId() : null,
			content.getThumbnailUrl(),
			content.getCreatedAt(),
			content.getUpdatedAt(),
			content.getPost() != null ? PostResponseDto.from(content.getPost()) : null
		);
	}
}

