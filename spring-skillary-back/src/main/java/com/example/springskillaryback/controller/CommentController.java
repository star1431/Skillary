package com.example.springskillaryback.controller;

import com.example.springskillaryback.common.dto.CommentRequestDto;
import com.example.springskillaryback.common.dto.CommentResponseDto;
import com.example.springskillaryback.domain.Comment;
import com.example.springskillaryback.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contents/{contentId}/comments")
@RequiredArgsConstructor
public class CommentController {
	private final CommentService commentService;

	@GetMapping
	public ResponseEntity<List<CommentResponseDto>> getComments(
		@PathVariable Byte contentId
	) {
		List<CommentResponseDto> comments = commentService.getComments(contentId);
		return ResponseEntity.ok(comments); // 200
	}

	@PostMapping
	public ResponseEntity<CommentResponseDto> addComment(
		@PathVariable Byte contentId,
		@RequestHeader("X-User-Id") Byte userId, // [임시] 시큐리티 작업전
		// @AuthenticationPrincipal CustomPrincipal customPrincipal
		@RequestBody CommentRequestDto requestDto
	) {
		// Byte userId = customPrincipal.getUserId();
		Comment comment = commentService.addComment(contentId, userId, requestDto);
		return ResponseEntity.status(HttpStatus.CREATED).body(CommentResponseDto.from(comment)); // 201
	}

	@PutMapping("/{commentId}")
	public ResponseEntity<CommentResponseDto> updateComment(
		@PathVariable Byte commentId,
		@RequestHeader("X-User-Id") Byte userId, // [임시] 시큐리티 작업전
		// @AuthenticationPrincipal CustomPrincipal customPrincipal
		@RequestBody CommentRequestDto requestDto
	) {
		// Byte userId = customPrincipal.getUserId();
		Comment comment = commentService.updateComment(commentId, userId, requestDto);
		return ResponseEntity.ok(CommentResponseDto.from(comment)); // 200
	}

	@DeleteMapping("/{commentId}")
	public ResponseEntity<Void> deleteComment(
		@PathVariable Byte commentId,
		@RequestHeader("X-User-Id") Byte userId // [임시] 시큐리티 작업전
		// @AuthenticationPrincipal CustomPrincipal customPrincipal
	) {
		// Byte userId = customPrincipal.getUserId();
		commentService.deleteComment(commentId, userId);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build(); // 204
	}

	@PostMapping("/{commentId}/like")
	public ResponseEntity<Void> toggleLike(
		@PathVariable Byte commentId,
		@RequestHeader("X-User-Id") Byte userId // [임시] 시큐리티 작업전
		// @AuthenticationPrincipal CustomPrincipal customPrincipal
	) {
		// Byte userId = customPrincipal.getUserId();
		commentService.toggleLike(commentId, userId);
		return ResponseEntity.ok().build(); // 200
	}
}

