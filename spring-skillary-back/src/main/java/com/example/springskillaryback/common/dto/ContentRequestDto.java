package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.CategoryEnum;

import java.util.List;

public record ContentRequestDto(
		String title,
		CategoryEnum category,
		Integer price,
		Byte planId,
		String thumbnailUrl,
		String body, // Post 본문
		List<String> postFiles // Post 본문 이미지/영상 url들
) { }

