package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.Order;

public record PlanOrderResponseDto(
		String customerKey,
		String orderId,
		String creatorName,
		String planName,
		int price
) {
	public static PlanOrderResponseDto from(Order order) {
		var plan = order.getSubscriptionPlan();
		return new PlanOrderResponseDto(
				order.getUser().getCustomerKey().toString(),
				order.getOrderId().toString(),
				plan.getCreator().getDisplayName(),
				plan.getName(),
				plan.getPrice()
		);
	}
}