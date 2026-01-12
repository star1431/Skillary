package com.example.springskillaryback.service;

import com.example.springskillaryback.common.dto.ContentRequestDto;
import com.example.springskillaryback.common.dto.ContentResponseDto;
import org.springframework.data.domain.Slice;

public interface ContentService {
	ContentResponseDto createContent(ContentRequestDto requestDto, Byte creatorId);
	
	ContentResponseDto updateContent(Byte contentId, ContentRequestDto requestDto, Byte creatorId);
	
	Slice<ContentResponseDto> getContents(int page, int size);
	
	ContentResponseDto getContent(Byte contentId);
	
	void deleteContent(Byte contentId, Byte creatorId);
}

