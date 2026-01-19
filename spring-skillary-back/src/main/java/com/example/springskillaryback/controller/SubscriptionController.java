package com.example.springskillaryback.controller;

import com.example.springskillaryback.common.dto.SubscribeResponseDto;
import com.example.springskillaryback.common.dto.SubscriptionPlanResponseDto;
import com.example.springskillaryback.common.dto.SubscriptionResponseDto;
import com.example.springskillaryback.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/subscriptions")
public class SubscriptionController {
	private final SubscriptionService subscriptionService;

	@PostMapping
	public ResponseEntity<SubscriptionResponseDto> createSubscription(
			Authentication authentication,
			@RequestBody String planName,
			@RequestBody String description,
			@RequestBody int price
	) {
		Byte userId = Byte.valueOf((String) Objects.requireNonNull(authentication.getPrincipal()));
		var plan = subscriptionService.createSubscription(userId, planName, description, price);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new SubscriptionResponseDto(plan.getName(), plan.getDescription(), plan.getPrice()));
	}

	@GetMapping("/plans")
	public ResponseEntity<Page<SubscriptionPlanResponseDto>> pagingSubscriptionPlans(
			Authentication authentication,
			@RequestParam(defaultValue = "0") Integer page,
			@RequestParam(defaultValue = "10") Integer size
	) {
		Byte userId = Byte.valueOf((String) Objects.requireNonNull(authentication.getPrincipal()));
		return ResponseEntity.ok(subscriptionService.pagingSubscriptionPlan(userId, page, size)
				                         .map(SubscriptionPlanResponseDto::from));
	}

	@GetMapping
	public ResponseEntity<Page<SubscribeResponseDto>> pagingSubscribe(
			Authentication authentication,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size
	) {
		Byte userId = Byte.valueOf((String) Objects.requireNonNull(authentication.getPrincipal()));
		PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt")
		                                                         .descending());
		return ResponseEntity.ok(subscriptionService.pagingSubscribes(userId, pageRequest)
		                                            .map(SubscribeResponseDto::from));
	}

	@DeleteMapping("/plans/{planId}")
	public ResponseEntity<Void> deletePlan(
			Authentication authentication,
			@PathVariable Byte planId
	) {
		Byte userId = Byte.valueOf((String) Objects.requireNonNull(authentication.getPrincipal()));
		subscriptionService.deletePlan(userId, planId);
		return ResponseEntity.noContent()
		                     .build();
	}

	@DeleteMapping("/{planId}")
	public ResponseEntity<Void> unsubscribe(
			Authentication authentication,
			@PathVariable Byte planId
	) {
		Byte userId = Byte.valueOf((String) Objects.requireNonNull(authentication.getPrincipal()));
		subscriptionService.deleteSubscribe(userId, planId);
		return ResponseEntity.noContent()
		                     .build();
	}
}