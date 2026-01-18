package com.example.springskillaryback.common.dto;

import java.util.List;

public record PostRequestDto(
		String body,
		List<String> postFiles
) { }