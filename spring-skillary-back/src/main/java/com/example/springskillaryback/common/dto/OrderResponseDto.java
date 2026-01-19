package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.common.util.DateFormatter;
import com.example.springskillaryback.domain.Order;

public record OrderResponseDto(
	String orderId,
	String orderTitle,
	String sellerName,
	int amount,
	String orderStatus,
	String createdAt,
	String expiredAt,
	String creatorId,
	boolean isPlan
) {
	public static OrderResponseDto from(Order order) {
		if (order.getSubscriptionPlan() != null)
			return new OrderResponseDto(order.getOrderId().toString(),
			                            order.getSubscriptionPlan().getName(),
										order.getSubscriptionPlan().getCreator().getDisplayName(),
			                            order.getAmount(),
			                            order.getStatus().toString(),
			                            DateFormatter.dateTimeToDateString(order.getCreatedAt()),
			                            DateFormatter.dateTimeToDateString(order.getExpiredAt()),
			                            order.getSubscriptionPlan().getCreator().getCreatorId().toString(),
			                            true);
		else
			return new OrderResponseDto(order.getOrderId().toString(),
			                            order.getContent().getTitle(),
			                            order.getContent().getCreator().getDisplayName(),
			                            order.getAmount(),
			                            order.getStatus().toString(),
			                            DateFormatter.dateTimeToDateString(order.getCreatedAt()),
			                            DateFormatter.dateTimeToDateString(order.getExpiredAt()),
			                            order.getContent().getCreator().getCreatorId().toString(),
			                            false);

	}
}
