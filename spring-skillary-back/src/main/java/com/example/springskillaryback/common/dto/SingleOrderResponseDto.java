package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.Order;

public record SingleOrderResponseDto(
		String customerKey,
		String orderId,
		String creatorName,
		String contentTitle,
		int price
) {
	public static SingleOrderResponseDto from(Order order) {
		var content = order.getContent();
		return new SingleOrderResponseDto(order.getUser().getCustomerKey().toString(),
		                                  order.getOrderId().toString(),
		                                  content.getCreator().getDisplayName(),
		                                  content.getTitle(),
		                                  content.getPrice());
	}
}