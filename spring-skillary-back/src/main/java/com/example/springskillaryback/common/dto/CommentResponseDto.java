package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.Comment;

public record CommentResponseDto(
		Byte commentId,
		Byte userId,
		String comment,
		Integer likeCount
) {
	public static CommentResponseDto from(Comment comment) {
		return new CommentResponseDto(
			comment.getCommentId(),
			comment.getUser().getUserId(),
			comment.getComment(),
			comment.getLikeCount()
		);
	}
}

