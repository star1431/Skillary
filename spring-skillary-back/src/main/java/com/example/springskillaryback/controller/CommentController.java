package com.example.springskillaryback.controller;

import com.example.springskillaryback.common.dto.CommentRequestDto;
import com.example.springskillaryback.common.dto.CommentResponseDto;
import com.example.springskillaryback.domain.Comment;
import com.example.springskillaryback.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {
	private final CommentService commentService;

	@PostMapping
	public ResponseEntity<CommentResponseDto> addComment(@RequestBody CommentRequestDto requestDto) {
		Comment comment = commentService.addComment(requestDto);
		return ResponseEntity.status(HttpStatus.CREATED).body(CommentResponseDto.from(comment)); // 201
	}

	@PutMapping("/{commentId}")
	public ResponseEntity<CommentResponseDto> updateComment(
		@PathVariable Byte commentId,
		@RequestBody CommentRequestDto requestDto
	) {
		Comment comment = commentService.updateComment(commentId, requestDto);
		return ResponseEntity.ok(CommentResponseDto.from(comment)); // 200
	}

	@DeleteMapping("/{commentId}")
	public ResponseEntity<Void> deleteComment(
		@PathVariable Byte commentId,
		@RequestBody CommentRequestDto requestDto
	) {
		commentService.deleteComment(commentId, requestDto);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build(); // 204
	}
}

