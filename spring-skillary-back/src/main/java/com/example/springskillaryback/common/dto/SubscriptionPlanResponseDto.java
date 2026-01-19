package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.SubscriptionPlan;

public record SubscriptionPlanResponseDto(
		String planName,
		String description,
		int price
) {
	public static SubscriptionPlanResponseDto from(SubscriptionPlan plan) {
		return new SubscriptionPlanResponseDto(
				plan.getName(),
				plan.getDescription(),
				plan.getPrice()
		);
	}
}
