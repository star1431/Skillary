package com.example.springskillaryback.common.dto;

import java.time.LocalDateTime;

public record CommentResponseDto(
		Byte commentId,
		Byte userId,
		String displayName,             // 크리에이터: displayName, 일반: nickName
		String profileImageUrl,         // 크리에이터: 사진url, 일반: null
		Boolean isCreator,              // 크리에이터 여부
		String comment,
		Integer likeCount,
		Boolean likedByCurrentUser,     // 비로그인: null, 로그인: 좋아요 여부
		Byte parentId,
		LocalDateTime createdAt,
		Boolean isDeleted               // 소프트 삭제 여부
) {
}

