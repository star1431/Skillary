package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.Content;
import com.example.springskillaryback.domain.Subscribe;

public record CompleteSinglePaymentResponseDto(

) {
	public static CompleteSinglePaymentResponseDto from(Content content) {
		return null;
	}

	public static CompleteSinglePaymentResponseDto from(Subscribe subscribe) {
		return null;
	}
}
