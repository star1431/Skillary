package com.example.springskillaryback.common.dto;

import java.util.List;

public record PostRequestDto(
		String body,
		List<String> mediaUrls // 본문에 삽입된 이미지/영상 url들..
) { }