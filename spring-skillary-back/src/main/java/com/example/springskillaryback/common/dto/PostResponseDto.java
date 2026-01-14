package com.example.springskillaryback.common.dto;

import java.util.List;

public record PostResponseDto(
		Byte postId,
		String body,
		List<String> postFiles
) {
}

