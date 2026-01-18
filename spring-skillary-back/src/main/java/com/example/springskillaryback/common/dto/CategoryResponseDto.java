package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.CategoryEnum;

public record CategoryResponseDto(
		String code,
		String label
) {
	public static CategoryResponseDto from(CategoryEnum category) {
		return new CategoryResponseDto(
			category.name(),
			category.getLabel()
		);
	}
}

