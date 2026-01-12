package com.example.springskillaryback.controller;

import com.example.springskillaryback.common.dto.ContentRequestDto;
import com.example.springskillaryback.common.dto.ContentResponseDto;
import com.example.springskillaryback.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Slice;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contents")
@RequiredArgsConstructor
public class ContentController {
	private final ContentService contentService;

	/** 콘텐츠 생성 */
	@PostMapping
	public ResponseEntity<ContentResponseDto> createContent(
		@RequestBody ContentRequestDto requestDto,
		@RequestHeader("X-Creator-Id") Byte creatorId // [임시] 시큐리티 작업전
        // @AuthenticationPrincipal CustomPrincipal customPrincipal
	) {
        // Byte creatorId = customPrincipal.getCreatorId();
		ContentResponseDto response = contentService.createContent(requestDto, creatorId);
		return ResponseEntity.status(HttpStatus.CREATED).body(response); // 201
	}

	@PutMapping("/{contentId}")
	public ResponseEntity<ContentResponseDto> updateContent(
		@PathVariable Byte contentId,
		@RequestBody ContentRequestDto requestDto,
		@RequestHeader("X-Creator-Id") Byte creatorId // [임시] 시큐리티 작업전
        // @AuthenticationPrincipal CustomPrincipal customPrincipal
	) {
        // Byte creatorId = customPrincipal.getCreatorId();
		ContentResponseDto response = contentService.updateContent(contentId, requestDto, creatorId);
		return ResponseEntity.ok(response); // 200
	}

	@GetMapping
	public ResponseEntity<Slice<ContentResponseDto>> getContents(
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "10") int size
	) {
		Slice<ContentResponseDto> contents = contentService.getContents(page, size);
		return ResponseEntity.ok(contents); // 200
	}

	@GetMapping("/{contentId}")
	public ResponseEntity<ContentResponseDto> getContent(@PathVariable Byte contentId) {
		ContentResponseDto content = contentService.getContent(contentId);
		return ResponseEntity.ok(content); // 200
	}

	@DeleteMapping("/{contentId}")
	public ResponseEntity<Void> deleteContent(
		@PathVariable Byte contentId,
		@RequestHeader("X-Creator-Id") Byte creatorId // [임시] 시큐리티 작업전
        // @AuthenticationPrincipal CustomPrincipal customPrincipal
	) {
        // Byte creatorId = customPrincipal.getCreatorId();

		// Content 삭제 (파일 삭제까지 포함하여 처리)
		contentService.deleteContent(contentId, creatorId);
		
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build(); // 204
	}
}

