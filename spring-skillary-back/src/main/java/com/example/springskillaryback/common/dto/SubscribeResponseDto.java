package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.Subscribe;

public record SubscribeResponseDto(
		String subscriptionName,
		String creatorName,
		String subscriptionDescription
) {
	public static SubscribeResponseDto from(Subscribe subscribe) {
		var subscription = subscribe.getSubscriptionPlan();
		return new SubscribeResponseDto(
				subscription.getName(),
				subscription.getCreator().getDisplayName(),
				subscription.getDescription()
		);
	}
}