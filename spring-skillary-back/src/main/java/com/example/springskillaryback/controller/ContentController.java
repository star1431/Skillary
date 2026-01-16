package com.example.springskillaryback.controller;

import com.example.springskillaryback.common.dto.CategoryResponseDto;
import com.example.springskillaryback.common.dto.ContentLikeResponseDto;
import com.example.springskillaryback.common.dto.ContentListResponseDto;
import com.example.springskillaryback.common.dto.ContentRequestDto;
import com.example.springskillaryback.common.dto.ContentResponseDto;
import com.example.springskillaryback.domain.CategoryEnum;
import com.example.springskillaryback.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Slice;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/contents")
@RequiredArgsConstructor
public class ContentController {
	private final ContentService contentService;

	@PostMapping
	public ResponseEntity<ContentResponseDto> createContent(
		@RequestBody ContentRequestDto requestDto,
		Authentication authentication
	) {
		Byte userId = Byte.valueOf((String) authentication.getPrincipal());
		try {
			ContentResponseDto response = contentService.createContent(requestDto, userId);
			return ResponseEntity.status(HttpStatus.CREATED).body(response); // 201
		} catch (IllegalStateException e) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 크리에이터만 가능
		}
	}

	@PutMapping("/{contentId}")
	public ResponseEntity<ContentResponseDto> updateContent(
		@PathVariable Byte contentId,
		@RequestBody ContentRequestDto requestDto,
		Authentication authentication
	) {
		Byte userId = Byte.valueOf((String) authentication.getPrincipal());
		try {
			ContentResponseDto response = contentService.updateContent(contentId, requestDto, userId);
			return ResponseEntity.ok(response); // 200
		} catch (IllegalStateException e) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 크리에이터만 가능
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 권한 없음
		}
	}

	/** 카테고리 목록 조회 */
	@GetMapping("/categories")
	public ResponseEntity<List<CategoryResponseDto>> getCategories() {
		List<CategoryResponseDto> categories = Arrays.stream(CategoryEnum.values())
			.map(CategoryResponseDto::from)
			.toList();
		return ResponseEntity.ok(categories); // 200
	}

	/** 콘텐츠 전체 목록 조회 */
	@GetMapping
	public ResponseEntity<Slice<ContentListResponseDto>> getContents(
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "10") int size
	) {
		Slice<ContentListResponseDto> contents = contentService.getContents(page, size);
		return ResponseEntity.ok(contents); // 200
	}

	/** 인기 콘텐츠 목록 조회 (라이크 기준) */
	@GetMapping("/popular")
	public ResponseEntity<Slice<ContentListResponseDto>> getPopularContents(
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "10") int size
	) {
		Slice<ContentListResponseDto> contents = contentService.getPopularContents(page, size);
		return ResponseEntity.ok(contents); // 200
	}

	/** 크리에이터 기준 목록 조회 */
	@GetMapping("/creators/{creatorId}")
	public ResponseEntity<Slice<ContentListResponseDto>> getContentsByCreator(
		@PathVariable Byte creatorId,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "10") int size
	) {
		Slice<ContentListResponseDto> contents = contentService.getContentsByCreator(creatorId, page, size);
		return ResponseEntity.ok(contents); // 200
	}

	/** 카테고리 기준 목록 조회 */
	@GetMapping("/category/{category}")
	public ResponseEntity<Slice<ContentListResponseDto>> getContentsByCategory(
		@PathVariable CategoryEnum category,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "10") int size
	) {
		Slice<ContentListResponseDto> contents = contentService.getContentsByCategory(category, page, size);
		return ResponseEntity.ok(contents); // 200
	}

	/** 콘텐츠 상세 조회 (포스트, 댓글 포함) */
	@GetMapping("/{contentId}")
	public ResponseEntity<ContentResponseDto> getContent(
            @PathVariable Byte contentId,
            Authentication authentication
    ) {
		contentService.incrementViewCount(contentId); // 조회수 증감 분리 적용
		
		Byte userId = null;
		if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
			userId = Byte.valueOf((String) authentication.getPrincipal());
		}
		
		ContentResponseDto content = contentService.getContent(contentId, userId);
		return ResponseEntity.ok(content); // 200
	}

	@DeleteMapping("/{contentId}")
	public ResponseEntity<Void> deleteContent(
		@PathVariable Byte contentId,
		Authentication authentication
	) {
		Byte userId = Byte.valueOf((String) authentication.getPrincipal());
		try {
			// Content 삭제 (파일 삭제까지 포함하여 처리)
			contentService.deleteContent(contentId, userId);
			return ResponseEntity.status(HttpStatus.NO_CONTENT).build(); // 204
		} catch (IllegalStateException e) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 크리에이터만 가능
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403 권한 없음
		}
	}

	/** 콘텐츠 좋아요 토글 */
	@PostMapping("/{contentId}/like")
	public ResponseEntity<ContentLikeResponseDto> toggleLike(
		@PathVariable Byte contentId,
		Authentication authentication
	) {
		Byte userId = Byte.valueOf((String) authentication.getPrincipal());
		ContentLikeResponseDto response = contentService.toggleLike(contentId, userId);
		return ResponseEntity.ok(response); // 200
	}
}

