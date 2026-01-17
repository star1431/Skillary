package com.example.springskillaryback.controller;

import com.example.springskillaryback.common.dto.SubscribeResponseDto;
import com.example.springskillaryback.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/subscriptions")
public class SubscriptionController {
	private final SubscriptionService subscriptionService;

	@GetMapping
	public ResponseEntity<Page<SubscribeResponseDto>> pagingSubscribe(
			@RequestParam Byte userId,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size
	) {
		PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt")
		                                                         .descending());
		return ResponseEntity.ok(subscriptionService.pagingSubscribes(userId, pageRequest)
		                                            .map(SubscribeResponseDto::from));
	}

	@DeleteMapping("/{planId}")
	public ResponseEntity<Void> unsubscribe(
			@PathVariable Byte planId,
			@RequestParam Byte userId
	) {
		subscriptionService.deleteSubscribe(userId, planId);
		return ResponseEntity.noContent()
		                     .build();
	}
}