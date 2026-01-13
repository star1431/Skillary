package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.CategoryEnum;

public record ContentRequestDto(
		String title,
        String description,
		CategoryEnum category,
		Byte planId,
		Integer price,
		String thumbnailUrl,
		PostRequestDto post
) { }

