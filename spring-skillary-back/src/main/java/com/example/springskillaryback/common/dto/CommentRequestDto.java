package com.example.springskillaryback.common.dto;

public record CommentRequestDto(
		Byte userId,
		Byte postId,
		String comment
) { }