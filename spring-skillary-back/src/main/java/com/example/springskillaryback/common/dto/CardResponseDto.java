package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.Card;

import java.time.format.DateTimeFormatter;

public record CardResponseDto(
		String cardName,
		String cardStatus,
		boolean isDefault,
		String cardExpiryDate
) {
	public static CardResponseDto from(Card card) {
		return new CardResponseDto(
				card.getCardName(),
				card.getCardStatus().toString(),
				card.isDefault(),
				card.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 HH시 mm분 ss초"))
		);
	}
}