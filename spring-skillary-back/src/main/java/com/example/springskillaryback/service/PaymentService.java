package com.example.springskillaryback.service;

import com.example.springskillaryback.common.dto.CompleteBillingRequestDto;
import com.example.springskillaryback.common.dto.CompletePaymentRequestDto;
import com.example.springskillaryback.domain.Card;
import com.example.springskillaryback.domain.Order;
import com.example.springskillaryback.domain.Payment;
import org.springframework.data.domain.Page;

public interface PaymentService {
	String getCustomerKey(Byte userId);

	/* Card */
	Card createCard(Byte userId, String customerKey, String authKey);

	Page<Card> pagingCards(Byte userId, int page, int size);

	void withdrawCard(Byte userId, byte cardId);

	/* Order */
	Order paymentOrder(Byte userId, byte contentId);

	Order billingOrder(Byte userId, byte planId);

	Page<Order> pagingOrders(Byte userId, int page, int size);

	Order retrieveOrder(Byte userId, String orderId);

	/* Payment */
	Page<Payment> pagingPayments(Byte userId, int page, int size);

	Payment completeBilling(Byte userId, CompleteBillingRequestDto completeBillingRequestDto);

	Payment completePayment(Byte userId, CompletePaymentRequestDto completePaymentRequestDto);
}
