package com.example.springskillaryback.service;

import com.example.springskillaryback.common.dto.CommentRequestDto;
import com.example.springskillaryback.common.dto.CommentResponseDto;
import com.example.springskillaryback.domain.Comment;

import java.util.List;

public interface CommentService {
	Comment addComment(Byte contentId, Byte userId, CommentRequestDto commentRequestDto);

	List<CommentResponseDto> getComments(Byte contentId);

	Comment updateComment(Byte commentId, Byte userId, CommentRequestDto commentRequestDto);

	void deleteComment(Byte commentId, Byte userId);

	void toggleLike(Byte commentId, Byte userId);
}

