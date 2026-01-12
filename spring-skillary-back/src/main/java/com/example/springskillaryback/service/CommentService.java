package com.example.springskillaryback.service;

import com.example.springskillaryback.common.dto.CommentRequestDto;
import com.example.springskillaryback.domain.Comment;

public interface CommentService {
	Comment addComment(CommentRequestDto commentRequestDto);

	Comment updateComment(Byte commentId, CommentRequestDto commentRequestDto);

	void deleteComment(Byte commentId, CommentRequestDto commentRequestDto);
}

