package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.Subscribe;
import com.example.springskillaryback.domain.SubscribeStatusEnum;

import java.time.LocalDateTime;

public record SubscribeResponseDto(
		Byte subscribeId,
		SubscribeStatusEnum status,
		LocalDateTime startAt,
		LocalDateTime endAt,
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
				subscribe.getEndAt(),
				plan.getName(),
				plan.getPrice(),
				creator.getDisplayName(),
				creator.getProfile()
		);
	}
}