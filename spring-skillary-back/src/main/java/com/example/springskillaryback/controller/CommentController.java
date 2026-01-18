package com.example.springskillaryback.controller;

import com.example.springskillaryback.common.dto.CommentRequestDto;
import com.example.springskillaryback.common.dto.CommentResponseDto;
import com.example.springskillaryback.common.util.TokenUtil;
import com.example.springskillaryback.service.CommentService;
import jakarta.servlet.http.HttpServletRequest;
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
	private final TokenUtil tokenUtil;

	@GetMapping
	public ResponseEntity<List<CommentResponseDto>> getComments(
		@PathVariable Byte contentId,
		HttpServletRequest request
	) {
		Byte userId = tokenUtil.getUserIdFromToken(request);
		List<CommentResponseDto> comments = commentService.getComments(contentId, userId);
		return ResponseEntity.ok(comments); // 200
	}

	@PostMapping
	public ResponseEntity<CommentResponseDto> addComment(
		@PathVariable Byte contentId,
		HttpServletRequest request,
		@RequestBody CommentRequestDto requestDto
	) {
		Byte userId = tokenUtil.getUserIdFromToken(request);
		if (userId == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 401
		}
		CommentResponseDto response = commentService.addComment(contentId, userId, requestDto);
		return ResponseEntity.status(HttpStatus.CREATED).body(response); // 201
	}

	@PutMapping("/{commentId}")
	public ResponseEntity<CommentResponseDto> updateComment(
		@PathVariable Byte commentId,
		HttpServletRequest request,
		@RequestBody CommentRequestDto requestDto
	) {
		Byte userId = tokenUtil.getUserIdFromToken(request);
		if (userId == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 401
		}
		CommentResponseDto response = commentService.updateComment(commentId, userId, requestDto);
		return ResponseEntity.ok(response); // 200
	}

	@DeleteMapping("/{commentId}")
	public ResponseEntity<Void> deleteComment(
		@PathVariable Byte commentId,
		HttpServletRequest request
	) {
		Byte userId = tokenUtil.getUserIdFromToken(request);
		if (userId == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 401
		}
		commentService.deleteComment(commentId, userId);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build(); // 204
	}

	@PostMapping("/{commentId}/like")
	public ResponseEntity<Void> toggleLike(
		@PathVariable Byte commentId,
		HttpServletRequest request
	) {
		Byte userId = tokenUtil.getUserIdFromToken(request);
		if (userId == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 401
		}
		commentService.toggleLike(commentId, userId);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build(); // 204
	}
}

