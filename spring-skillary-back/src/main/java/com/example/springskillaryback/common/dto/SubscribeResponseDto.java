package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.Subscribe;
import com.example.springskillaryback.domain.SubscribeStatusEnum;

import java.time.LocalDateTime;

public record SubscribeResponseDto(
		Byte subscribeId,
		SubscribeStatusEnum status,
		LocalDateTime startAt,
		String endAt,
		String planName,
		int price,
		String creatorDisplayName,
		String creatorProfileImage
) {
	public static SubscribeResponseDto from(Subscribe subscribe) {
		var plan = subscribe.getSubscriptionPlan();
		var creator = plan.getCreator();

		return new SubscribeResponseDto(
				subscribe.getSubscribeId(),
				subscribe.getSubscribeStatus(),
				subscribe.getStartAt(),
				subscribe.getEndAt().toLocalDate().toString(), // 변환된 문자열 주입
				plan.getName(),
				plan.getPrice(),
				creator.getDisplayName(),
				creator.getProfile()
		);
	}
}