package com.example.springskillaryback.common.util;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;

import java.util.Base64;
import java.util.Map;

@RequiredArgsConstructor
public class TossPaymentsClient {
	private final static String CONFIRM_PAYMENT_REQUEST_URL = "https://api.tosspayments.com/v1/payments/confirm";
	private final static String WITHDRAWAL_REQUEST_URL = "https://api.tosspayments.com/v1/payments/%s/cancel";
	private final static String ISSUE_BILLING_URL = "https://api.tosspayments.com/v1/billing/authorizations/issue";
	private final static String CONFIRM_BILLING_REQUEST_URL = "https://api.tosspayments.com/v1/billing/%s";
	private final static String DELETE_BILLING_KEY_URL = "https://api.tosspayments.com/v1/billing/%s";

	private final RestTemplate restTemplate;
	private final String secretKey;

	public JsonNode issueBillingKey(
			String authKey,
			String customerKey
	) {
		HttpEntity<Map<String, String>> request = new HttpEntity<>(Map.of(
				"authKey", authKey,
				"customerKey", customerKey
		), createHeaders(null));

		/* 요청 전송 */
		ResponseEntity<JsonNode> response = restTemplate.postForEntity(
				ISSUE_BILLING_URL,
				request,
				JsonNode.class
		);

		return response.getBody();
	}

	public JsonNode payWithBillingKey(
			String idempotencyKey,
			String billingKey,
			String customerKey,
			String orderId,
			String orderName,
			int amount
	) {
		HttpEntity<Map<String, String>> request = new HttpEntity<>(Map.of(
				"amount", String.valueOf(amount),
				"orderId", orderId,
				"orderName", orderName,
				"customerKey", customerKey
		), createHeaders(idempotencyKey));

		ResponseEntity<JsonNode> response = restTemplate.postForEntity(
				CONFIRM_BILLING_REQUEST_URL.formatted(billingKey),
				request,
				JsonNode.class
		);

		return response.getBody();
	}

	public JsonNode confirm(
			String idempotencyKey,
			String paymentKey,
			String orderId,
			int amount
	) {
		HttpEntity<Map<String, String>> request = new HttpEntity<>(Map.of(
				"paymentKey", paymentKey,
				"orderId", orderId,
				"amount", String.valueOf(amount)
		), createHeaders(idempotencyKey));

		/* 요청 전송 */
		ResponseEntity<JsonNode> response = restTemplate.postForEntity(
				CONFIRM_PAYMENT_REQUEST_URL,
				request,
				JsonNode.class
		);

		return response.getBody();
	}

	public JsonNode withdraw(String idempotencyKey, String paymentKey, String cancelReason) {
		HttpEntity<Map<String, String>> request = new HttpEntity<>(Map.of(
				"cancelReason", cancelReason
		), createHeaders(idempotencyKey));

		/* 요청 전송 */
		ResponseEntity<JsonNode> response = restTemplate.postForEntity(
				WITHDRAWAL_REQUEST_URL.formatted(paymentKey),
				request,
				JsonNode.class
		);

		return response.getBody();
	}

	public int deleteBillingKey(String idempotencyKey, String billingKey) {
		HttpHeaders headers = createHeaders(idempotencyKey);
		HttpEntity<Void> entity = new HttpEntity<>(headers);

		ResponseEntity<JsonNode> response = restTemplate.exchange(
				DELETE_BILLING_KEY_URL.formatted(billingKey),
				HttpMethod.DELETE,
				entity,
				JsonNode.class
		);
		return response.getStatusCode().value();
	}

	private HttpHeaders createHeaders(String idempotencyKey) {
		HttpHeaders headers = new HttpHeaders();
		String encodedKey = Base64.getEncoder()
		                          .encodeToString((secretKey + ":").getBytes());
		headers.set("Authorization", "Basic " + encodedKey);
		if (idempotencyKey != null)
			headers.set("Idempotency-Key", idempotencyKey);
		headers.setContentType(MediaType.APPLICATION_JSON);
		return headers;
	}
}