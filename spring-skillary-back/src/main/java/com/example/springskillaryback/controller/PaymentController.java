package com.example.springskillaryback.controller;

import com.example.springskillaryback.common.dto.BillingOrderRequestDto;
import com.example.springskillaryback.common.dto.CardRequestDto;
import com.example.springskillaryback.common.dto.CardResponseDto;
import com.example.springskillaryback.common.dto.CompleteBillingRequestDto;
import com.example.springskillaryback.common.dto.CompleteBillingResponseDto;
import com.example.springskillaryback.common.dto.CompletePaymentRequestDto;
import com.example.springskillaryback.common.dto.CompletePaymentResponseDto;
import com.example.springskillaryback.common.dto.CustomerKeyResponseDto;
import com.example.springskillaryback.common.dto.OrderResponseDto;
import com.example.springskillaryback.common.dto.PaymentResponseDto;
import com.example.springskillaryback.common.dto.PlanOrderResponseDto;
import com.example.springskillaryback.common.dto.PaymentOrderRequestDto;
import com.example.springskillaryback.common.dto.PaymentOrderResponseDto;
import com.example.springskillaryback.domain.Order;
import com.example.springskillaryback.domain.Payment;
import com.example.springskillaryback.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
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

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {
	private final PaymentService paymentService;

	@PostMapping("/customer-key")
	public ResponseEntity<CustomerKeyResponseDto> getCustomerKey(
			Authentication authentication
	) {
		Byte userId = Byte.valueOf((String) Objects.requireNonNull(authentication.getPrincipal()));
		String customerKey = paymentService.getCustomerKey(userId);
		return ResponseEntity.ok(new CustomerKeyResponseDto(customerKey));
	}

	@PostMapping("/cards")
	public ResponseEntity<Void> createCard(
			Authentication authentication,
			@Valid
			@RequestBody
			CardRequestDto cardRequestDto
	) {
		Byte userId = Byte.valueOf((String) Objects.requireNonNull(authentication.getPrincipal()));
		var customerKey = cardRequestDto.customerKey();
		var authKey = cardRequestDto.authKey();
		paymentService.createCard(userId, customerKey, authKey);
		return ResponseEntity.noContent()
		                     .build();
	}

	@GetMapping("/cards")
	public ResponseEntity<Page<CardResponseDto>> pagingCard(
			Authentication authentication,
			@RequestParam(defaultValue = "0") Integer page,
			@RequestParam(defaultValue = "10") Integer size
	) {
		Byte userId = Byte.valueOf((String) Objects.requireNonNull(authentication.getPrincipal()));
		return ResponseEntity.ok(paymentService.pagingCards(userId, page, size)
		                                       .map(CardResponseDto::from));
	}

	@GetMapping("/orders")
	public ResponseEntity<Page<OrderResponseDto>> pagingOrders(
			Authentication authentication,
			@RequestParam(defaultValue = "0") Integer page,
			@RequestParam(defaultValue = "10") Integer size
	) {
		Byte userId = Byte.valueOf((String) Objects.requireNonNull(authentication.getPrincipal()));
		return ResponseEntity.ok(paymentService.pagingOrders(userId, page, size)
		                                       .map(OrderResponseDto::from));
	}

	@PostMapping("/orders/payment")
	public ResponseEntity<PaymentOrderResponseDto> paymentOrder(
			Authentication authentication,
			@Valid
			@RequestBody
			PaymentOrderRequestDto paymentOrderRequestDto
	) {
		Byte userId = Byte.valueOf((String) Objects.requireNonNull(authentication.getPrincipal()));
		var contentId = paymentOrderRequestDto.contentId();
		System.out.println("\n\n\n" + userId + "\n\n\n");
		var order = paymentService.paymentOrder(userId, contentId);
		return ResponseEntity.status(HttpStatus.CREATED)
		                     .body(PaymentOrderResponseDto.from(order));
	}

	@PostMapping("/orders/billing")
	public ResponseEntity<PlanOrderResponseDto> billingOrder(
			Authentication authentication,
			@Valid
			@RequestBody
			BillingOrderRequestDto billingOrderRequestDto
	) {
		Byte userId = Byte.valueOf((String) Objects.requireNonNull(authentication.getPrincipal()));
		var planId = billingOrderRequestDto.planId();
		var order = paymentService.billingOrder(userId, planId);
		return ResponseEntity.status(HttpStatus.CREATED)
		                     .body(PlanOrderResponseDto.from(order));
	}

	@PostMapping("/complete/payment")
	public ResponseEntity<CompletePaymentResponseDto> completePayment(
			Authentication authentication,
			@Valid
			@RequestBody
			CompletePaymentRequestDto completePaymentRequestDto
	) {
		Byte userId = Byte.valueOf((String) Objects.requireNonNull(authentication.getPrincipal()));
		Payment payment = paymentService.completePayment(userId, completePaymentRequestDto);
		return ResponseEntity.status(HttpStatus.CREATED)
		                     .body(CompletePaymentResponseDto.from(payment));
	}

	@PostMapping("/complete/billing")
	public ResponseEntity<CompleteBillingResponseDto> completeBilling(
			Authentication authentication,
			@Valid
			@RequestBody
			CompleteBillingRequestDto completeBillingRequestDto
	) {
		Byte userId = Byte.valueOf((String) Objects.requireNonNull(authentication.getPrincipal()));
		Payment payment = paymentService.completeBilling(userId, completeBillingRequestDto);

		return ResponseEntity.status(HttpStatus.CREATED)
		                     .body(CompleteBillingResponseDto.from(payment));
	}

	@GetMapping
	public ResponseEntity<Page<PaymentResponseDto>> pagingPayments(
			Authentication authentication,
			@RequestParam(defaultValue = "0") Integer page,
			@RequestParam(defaultValue = "10") Integer size
	) {
		Byte userId = Byte.valueOf((String) Objects.requireNonNull(authentication.getPrincipal()));
		Page<PaymentResponseDto> response = paymentService.pagingPayments(userId, page, size)
		                                                  .map(PaymentResponseDto::from);
		return ResponseEntity.ok()
		                     .body(response);
	}

	@GetMapping("/{orderId}")
	public ResponseEntity<?> retrieveOrder(
			Authentication authentication,
			@PathVariable String orderId
	) {
		Byte userId = Byte.valueOf((String) Objects.requireNonNull(authentication.getPrincipal()));
		if (orderId == null)
			throw new IllegalArgumentException("주문 정보 입력 값이 없습니다.");
		Order order = paymentService.retrieveOrder(userId, orderId);

		if (order.isContent())
			return ResponseEntity.ok(PaymentOrderResponseDto.from(order));

		if (order.isPlan())
			return ResponseEntity.ok(PlanOrderResponseDto.from(order));

		throw new RuntimeException("시스템에 잘못된 값이 저장되어 있습니다.");
	}

	@DeleteMapping("/card/{cardId}")
	public ResponseEntity<Boolean> withdrawCard(
			Authentication authentication,
			@PathVariable Byte cardId
	) {
		Byte userId = Byte.valueOf((String) Objects.requireNonNull(authentication.getPrincipal()));
		if (cardId == null)
			throw new IllegalArgumentException("입력값 오류");
		paymentService.withdrawCard(userId, cardId);
		return ResponseEntity.noContent().build();
	}
}