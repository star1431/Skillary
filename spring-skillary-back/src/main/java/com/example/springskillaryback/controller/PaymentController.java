package com.example.springskillaryback.controller;

import com.example.springskillaryback.common.dto.CardRequestDto;
import com.example.springskillaryback.common.dto.CardResponseDto;
import com.example.springskillaryback.common.dto.CompleteBillingPaymentRequestDto;
import com.example.springskillaryback.common.dto.CompleteBillingPaymentResponseDto;
import com.example.springskillaryback.common.dto.CompleteSinglePaymentRequestDto;
import com.example.springskillaryback.common.dto.CompleteSinglePaymentResponseDto;
import com.example.springskillaryback.common.dto.CustomerKeyResponseDto;
import com.example.springskillaryback.common.dto.PaymentResponseDto;
import com.example.springskillaryback.common.dto.PlanOrderRequestDto;
import com.example.springskillaryback.common.dto.PlanOrderResponseDto;
import com.example.springskillaryback.common.dto.SingleOrderRequestDto;
import com.example.springskillaryback.common.dto.SingleOrderResponseDto;
import com.example.springskillaryback.domain.Content;
import com.example.springskillaryback.domain.Payment;
import com.example.springskillaryback.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {
	private final PaymentService paymentService;

	@PostMapping("/customer-key")
	public ResponseEntity<CustomerKeyResponseDto> getCustomerKey(
			@RequestBody
			String email
	) {
		String customerKey = paymentService.getCustomerKey(email);
		return ResponseEntity.ok(new CustomerKeyResponseDto(customerKey));
	}

	@PostMapping("/cards/create")
	public ResponseEntity<CardResponseDto> createCard(
			@Valid
			@RequestBody
			CardRequestDto cardRequestDto
	) {
		var email = cardRequestDto.email();
		var customerKey = cardRequestDto.customerKey();
		var authKey = cardRequestDto.authKey();
		var card = paymentService.createCard(email, customerKey, authKey);
		return ResponseEntity.status(HttpStatus.CREATED)
		                     .body(CardResponseDto.from(card));
	}

	@GetMapping("/cards")
	public ResponseEntity<Page<CardResponseDto>> pagingCard(
			@RequestParam(defaultValue = "0") Integer page,
			@RequestParam(defaultValue = "10") Integer size
	) {
		return ResponseEntity.ok(paymentService.pagingCard(page, size)
		                                       .map(CardResponseDto::from));
	}

	@PostMapping("/orders/single")
	public ResponseEntity<SingleOrderResponseDto> recordOrderSingle(
			@Valid
			@RequestBody
			SingleOrderRequestDto singleOrderRequestDto
	) {
		var email = singleOrderRequestDto.email();
		var contentId = singleOrderRequestDto.contentId();
		var order = paymentService.saveSingleOrder(email, contentId);
		return ResponseEntity.status(HttpStatus.CREATED)
		                     .body(SingleOrderResponseDto.from(order));
	}

	@PostMapping("/orders/plan")
	public ResponseEntity<PlanOrderResponseDto> recordOrderPlan(
			@Valid
			@RequestBody
			PlanOrderRequestDto planOrderRequestDto
	) {
		var email = planOrderRequestDto.email();
		var planId = planOrderRequestDto.planId();
		var order = paymentService.saveSubscriptionOrder(email, planId);
		return ResponseEntity.status(HttpStatus.CREATED)
		                     .body(PlanOrderResponseDto.from(order));
	}

	@PostMapping("/complete/single")
	public ResponseEntity<CompleteSinglePaymentResponseDto> completeSinglePayment(
			@Valid
			@RequestBody
			CompleteSinglePaymentRequestDto completeSinglePaymentRequestDto
	) {
		Content content = paymentService.completeSinglePayment(
				completeSinglePaymentRequestDto.paymentKey(),
				completeSinglePaymentRequestDto.orderId(),
				completeSinglePaymentRequestDto.amount());
		return ResponseEntity.status(HttpStatus.CREATED)
		                     .body(CompleteSinglePaymentResponseDto.from(content));
	}

	@PostMapping("/complete/billing")
	public ResponseEntity<CompleteBillingPaymentResponseDto> completeBillingPayment(
			@Valid
			@RequestBody
			CompleteBillingPaymentRequestDto completeBillingPaymentRequestDto
	) {
		log.info(completeBillingPaymentRequestDto.toString());
		Payment payment = paymentService.completeBillingPayment(
				completeBillingPaymentRequestDto.email(),
				completeBillingPaymentRequestDto.customerKey(),
				completeBillingPaymentRequestDto.orderId(),
				completeBillingPaymentRequestDto.planName(),
				completeBillingPaymentRequestDto.amount());

		return ResponseEntity.status(HttpStatus.CREATED)
		                     .body(CompleteBillingPaymentResponseDto.from(payment));
	}

	@GetMapping
	public ResponseEntity<Page<PaymentResponseDto>> pagingPayments(
			@RequestParam(defaultValue = "0") Integer page,
			@RequestParam(defaultValue = "10") Integer size
	) {
		Page<PaymentResponseDto> response = paymentService.pagingPayments(page, size)
		                                                  .map(PaymentResponseDto::from);
		return ResponseEntity.ok()
		                     .body(response);
	}

	@GetMapping("/{paymentId}")
	public ResponseEntity<PaymentResponseDto> retrievePayment(
			@PathVariable Byte paymentId
	) {
		if (paymentId == null)
			throw new IllegalArgumentException("입력값 오류");
		var result = PaymentResponseDto.from(paymentService.retrivePayment(paymentId));
		return ResponseEntity.ok()
		                     .body(result);
	}

	@DeleteMapping("/{paymentId}")
	public ResponseEntity<Boolean> withdrawPayment(
			@PathVariable Byte paymentId,
			@RequestParam String cancelReason
	) {
		if (paymentId == null || cancelReason.isEmpty())
			throw new IllegalArgumentException("입력값 오류");
		boolean result = paymentService.withdrawPayment(paymentId, cancelReason);
		return ResponseEntity.ok(result);
	}
}