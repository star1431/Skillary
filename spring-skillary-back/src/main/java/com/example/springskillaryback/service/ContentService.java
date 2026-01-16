package com.example.springskillaryback.service;

import org.springframework.data.domain.Slice;

import com.example.springskillaryback.common.dto.ContentLikeResponseDto;
import com.example.springskillaryback.common.dto.ContentListResponseDto;
import com.example.springskillaryback.common.dto.ContentRequestDto;
import com.example.springskillaryback.common.dto.ContentResponseDto;
import com.example.springskillaryback.domain.CategoryEnum;

public interface ContentService {
	ContentResponseDto createContent(ContentRequestDto requestDto, Byte userId);
	
	ContentResponseDto updateContent(Byte contentId, ContentRequestDto requestDto, Byte userId);
	
	/** 콘텐츠 전체 목록 조회 (최신순) */
	Slice<ContentListResponseDto> getContents(int page, int size);
	
	/** 인기 콘텐츠 목록 조회 (댓글 수 기준) */
	Slice<ContentListResponseDto> getPopularContents(int page, int size);
	
	/** 크리에이터 기준 목록 조회 */
	Slice<ContentListResponseDto> getContentsByCreator(Byte creatorId, int page, int size);
	
	/** 카테고리 기준 목록 조회 */
	Slice<ContentListResponseDto> getContentsByCategory(CategoryEnum category, int page, int size);
	
	/** 콘텐츠 상세 조회 (포스트, 댓글 포함) */
	ContentResponseDto getContent(Byte contentId, Byte userId);
	
	void incrementViewCount(Byte contentId);
	
	void deleteContent(Byte contentId, Byte userId);
	
	/** 콘텐츠 좋아요 토글 */
	ContentLikeResponseDto toggleLike(Byte contentId, Byte userId);
}

