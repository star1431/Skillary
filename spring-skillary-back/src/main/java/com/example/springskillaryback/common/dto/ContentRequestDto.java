package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.CategoryEnum;

public record ContentRequestDto(
		String title,
		CategoryEnum category,
		Integer price,
		Byte planId,
		String thumbnailUrl,
		PostRequestDto post
) { }

