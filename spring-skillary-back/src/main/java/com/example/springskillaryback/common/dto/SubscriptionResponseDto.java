package com.example.springskillaryback.common.dto;

public record SubscriptionResponseDto(
	String planName,
	String description,
	int price
) { }