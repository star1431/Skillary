package com.example.springskillaryback.service;

import com.example.springskillaryback.domain.Card;
import com.example.springskillaryback.domain.Content;
import com.example.springskillaryback.domain.Order;
import com.example.springskillaryback.domain.Payment;
import com.example.springskillaryback.domain.Subscribe;
import org.springframework.data.domain.Page;

public interface PaymentService {
	String getCustomerKey(String email);

	Card createCard(String email, String customerKey, String authKey);

	Page<Card> pagingCard(int page, int size);

	Order saveSubscriptionOrder(String email, byte planId);

	Order saveSingleOrder(String email, byte contentId);

	Payment completeBillingPayment(String email, String customerKey, String orderId, String planName, int credit);

	Content completeSinglePayment(String paymentKey, String orderId, int credit);

	Page<Payment> pagingPayments(int page, int size);

	Payment retrivePayment(byte paymentId);

	boolean withdrawPayment(byte paymentId, String cancelReason);

	// activateSubscription 은 SubscriptionService 에서 해야 함 여기 선언하면 안돼요...........
}
