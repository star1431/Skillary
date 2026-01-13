package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.Comment;

import java.util.List;

public record CommentResponseDto(
		Byte commentId,
		Byte userId,
		String comment,
		Integer likeCount,
		Byte parentId,
		List<CommentResponseDto> children
) {
	public static CommentResponseDto from(Comment comment) {
		// 자식 댓글 list
		List<CommentResponseDto> children = comment.getChildren() != null && !comment.getChildren().isEmpty()
			? comment.getChildren().stream()
				.map(CommentResponseDto::from)
				.toList()
			: List.of();

		return new CommentResponseDto(
			comment.getCommentId(),
			comment.getUser().getUserId(),
			comment.getComment(),
			comment.getLikeCount(),
			comment.getParent() != null ? comment.getParent().getCommentId() : null,
			children
		);
	}
}

