package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.Card;

import java.time.format.DateTimeFormatter;

public record CardResponseDto(
		byte cardId,
		String cardName,
		String cardNumber,
		String cardStatus,
		boolean isDefault,
		String createdAt
) {
	public static CardResponseDto from(Card card) {
		return new CardResponseDto(
				card.getCardId(),
				card.getCardName(),
				card.getCardNumber(),
				card.getCardStatus().toString(),
				card.isDefault(),
				card.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 HH시 mm분 ss초"))
		);
	}
}