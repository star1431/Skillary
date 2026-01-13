package com.example.springskillaryback.common.dto;

public record CommentRequestDto(
		String comment,
		Byte parentId // 대댓글일때만
) { }