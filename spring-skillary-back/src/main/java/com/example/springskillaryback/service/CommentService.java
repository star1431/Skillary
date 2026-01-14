package com.example.springskillaryback.service;

import com.example.springskillaryback.common.dto.CommentRequestDto;
import com.example.springskillaryback.common.dto.CommentResponseDto;

import java.util.List;

public interface CommentService {
	CommentResponseDto addComment(Byte contentId, Byte userId, CommentRequestDto commentRequestDto);

	List<CommentResponseDto> getComments(Byte contentId, Byte currentUserId);

	CommentResponseDto updateComment(Byte commentId, Byte userId, CommentRequestDto commentRequestDto);

	void deleteComment(Byte commentId, Byte userId);

	void toggleLike(Byte commentId, Byte userId);
}

