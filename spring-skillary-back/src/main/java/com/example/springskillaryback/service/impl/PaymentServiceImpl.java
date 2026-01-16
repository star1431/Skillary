package com.example.springskillaryback.service.impl;

import com.example.springskillaryback.common.util.TossPaymentsClient;
import com.example.springskillaryback.domain.Card;
import com.example.springskillaryback.domain.CardStatusEnum;
import com.example.springskillaryback.domain.Content;
import com.example.springskillaryback.domain.CreditMethodEnum;
import com.example.springskillaryback.domain.CreditStatusEnum;
import com.example.springskillaryback.domain.Order;
import com.example.springskillaryback.domain.OrderStatusEnum;
import com.example.springskillaryback.domain.Payment;
import com.example.springskillaryback.domain.Subscribe;
import com.example.springskillaryback.domain.SubscribeStatusEnum;
import com.example.springskillaryback.domain.SubscriptionPlan;
import com.example.springskillaryback.domain.User;
import com.example.springskillaryback.repository.CardRepository;
import com.example.springskillaryback.repository.ContentRepository;
import com.example.springskillaryback.repository.OrderRepository;
import com.example.springskillaryback.repository.PaymentRepository;
import com.example.springskillaryback.repository.SubscribeRepository;
import com.example.springskillaryback.repository.SubscriptionPlanRepository;
import com.example.springskillaryback.repository.UserRepository;
import com.example.springskillaryback.service.PaymentService;
import com.example.springskillaryback.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
	private final PaymentRepository paymentRepository;
	private final OrderRepository orderRepository;
	private final SubscriptionPlanRepository subscriptionPlanRepository;
	private final UserRepository userRepository;
	private final TossPaymentsClient tossPaymentsClient;
	private final SubscriptionService subscriptionService;
	private final ContentRepository contentRepository;
	private final CardRepository cardRepository;

	@Override
	public String getCustomerKey(String email) {
		User user = findUserOrElseThrow(email);
		return user.getCustomerKey().toString();
	}

	@Override
	public Card createCard(String email, String customerKey, String authKey) {
		User user = findUserOrElseThrow(email);
		if (!user.getCustomerKey().toString().equals(customerKey))
			throw new IllegalArgumentException("로그인부터 다시 이용해주세요");

		JsonNode response = tossPaymentsClient.issueBillingKey(authKey, customerKey);

		String billingKey = response.path("billingKey").asString();
		String cardNumber = response.path("cardNumber").asString();
		String cardCompany = response.path("cardCompany").asString();
		String cardType = response.path("card").path("cardType").asString();
		String ownerType = response.path("card").path("ownerType").asString();

		cardRepository.resetDefaultStatus(user.getUserId().toString());
		Card card = new Card(cardCompany, cardNumber, cardType, ownerType, billingKey, user);
		cardRepository.save(card);
		return user.addCard(card);
	}

	@Override
	@Transactional(readOnly = true)
	public Page<Card> pagingCard(int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		return cardRepository.findAll(pageable);
	}

	@Override
	@Transactional(readOnly = true)
	public Page<Order> pagingOrder(int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		return orderRepository.findAll(pageable);
	}

	@Override
	public Order saveSubscriptionOrder(String email, byte planId) {
		User user = findUserOrElseThrow(email);
		SubscriptionPlan plan = findPlanOrElseThrow(planId);
		if (user.isSubscribed(plan))
			throw new RuntimeException("이미 구독중인 상품입니다.");

		return orderRepository.save(new Order(
				plan.getPrice(),
				user,
				plan,
				LocalDateTime.now().plusMinutes(10)
		));
	}

	@Override
	public Order saveSingleOrder(String email, byte contentId) {
		User user = findUserOrElseThrow(email);
		Content content = findContentOrElseThrow(contentId);
		if (user.hasContent(content))
			throw new RuntimeException("해당 품목은 이미 구매하였습니다.");
		return orderRepository.save(new Order(
				content.getPrice(),
				user,
				content,
				LocalDateTime.now().plusMinutes(10)
		));
	}

	@Override
	public Payment completeBillingPayment(
			String email,
			String customerKey,
			String orderId,
			String planName,
			int credit
	) {
		Order order = findOrderOrElseThrow(orderId);
		User user = findUserOrElseThrow(email);
		SubscriptionPlan plan = order.getSubscriptionPlan();

		if (plan == null || plan.getPrice() != credit || !user.getCustomerKey().toString().equals(customerKey)
		    || !order.getUser().equals(user) || order.isPaid())
			throw new IllegalArgumentException("잘못된 주문 정보입니다.");

		Card defaultCard = cardRepository.findByUserAndIsDefaultTrue(user)
		                                 .orElseThrow(() -> new RuntimeException("등록된 기본 카드가 없습니다."));

		var tossResponse = tossPaymentsClient.payWithBillingKey(
				user.getIdempotencyKey().toString(),
				defaultCard.getBillingKey(),
				customerKey,
				orderId,
				planName,
				credit
		);

		Payment payment = Payment.builder()
		                         .user(order.getUser())
		                         .paymentKey(tossResponse.path("paymentKey").asString())
		                         .order(order)
		                         .creditStatus(CreditStatusEnum.PAID)
		                         .credit(tossResponse.path("totalAmount").asInt())
		                         .creditMethod(CreditMethodEnum.fromMethod(tossResponse.path("method").asString()))
		                         .paidAt(LocalDateTime.now())
		                         .build();

		paymentRepository.save(payment);
		order.complete();
		subscriptionService.subscribe(user, plan);
		return payment;
	}

	@Override
	public Content completeSinglePayment(
			String paymentKey,
			String orderId,
			int credit
	) {
		Order order = findOrderOrElseThrow(orderId);

		if (!order.verifyWith(credit))
			throw new RuntimeException("주문 정보가 왜곡됐습니다.");

		if (order.getCreatedAt().plusMinutes(10).isAfter(LocalDateTime.now()))
			throw new IllegalArgumentException("이미 만료된 주문입니다.");
		if (order.isPaid())
			throw new IllegalArgumentException("이미 처리된 주문입니다.");
		if (order.isNotPending())
			throw new IllegalArgumentException("해당 주문은 처리될 수 없습니다.");

		var tossResponse = tossPaymentsClient.confirm(
				order.getUser().getIdempotencyKey().toString(),
				paymentKey,
				orderId,
				credit
		);

		Payment payment = Payment.builder()
		                         .user(order.getUser())
		                         .paymentKey(tossResponse.path("paymentKey").asString())
		                         .order(order)
		                         .creditStatus(CreditStatusEnum.PAID)
		                         .credit(tossResponse.path("totalAmount").asInt())
		                         .creditMethod(CreditMethodEnum.fromMethod(tossResponse.path("method").asString()))
		                         .paidAt(LocalDateTime.now())
		                         .build();

		paymentRepository.save(payment);
		order.complete();

		return order.getContent();
	}

	@Override
	@Transactional(readOnly = true)
	public Page<Payment> pagingPayments(int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		return paymentRepository.findAll(pageable);
	}

	@Override
	@Transactional(readOnly = true)
	public Payment retrivePayment(byte paymentId) {
		return paymentRepository.findById(paymentId)
		                        .orElseThrow(() -> new IllegalArgumentException("등록되지 않은 지불 정보입니다."));
	}

	@Override
	public boolean withdrawPayment(byte paymentId, String cancelReason) {
		Payment payment = findPaymentOrElseThrow(paymentId);

		if (payment.getCreditStatus() == CreditStatusEnum.CANCELED)
			throw new IllegalStateException("이미 취소된 결제입니다.");

		var tossResponse = tossPaymentsClient.withdraw(
				payment.getUser().getIdempotencyKey().toString(),
				payment.getPaymentKey(), cancelReason);

		if ("CANCELED".equals(tossResponse.path("status").asString())) {
			payment.cancel();
			return true;
		}

		return false;
	}

	@Override
	public boolean withdrawCard(byte cardId) {
		Card card = cardRepository.findById(cardId).
				orElseThrow(() -> new IllegalArgumentException("시스템에 등록되지 않은 카드입니다."));
		int statusCode = tossPaymentsClient.deleteBillingKey(card.getUser().getIdempotencyKey().toString(),
		                                                     card.getBillingKey()).value();
		if (statusCode == 200) {
			cardRepository.delete(card);
			return true;
		}
		return false;
	}

	@Override
	@Transactional(readOnly = true)
	public Order retrieveOrder(String orderId) {
		return findOrderOrElseThrow(orderId);
	}

	private SubscriptionPlan findPlanOrElseThrow(byte planId) {
		return subscriptionPlanRepository.findById(planId)
		                                 .orElseThrow(() -> new IllegalArgumentException("등록되지 않은 플랜입니다."));
	}

	private User findUserOrElseThrow(String email) {
		return userRepository.findByEmail(email)
		                     .orElseThrow(() -> new IllegalArgumentException("등록되지 않은 유저입니다."));
	}

	private Order findOrderOrElseThrow(String orderId) {
		return orderRepository.findById(UUID.fromString(orderId))
		                                    .orElseThrow(() -> new IllegalArgumentException("등록되지 않은 주문정보입니다."));
	}

	private Content findContentOrElseThrow(byte contentId) {
		return contentRepository.findById(contentId)
		                        .orElseThrow(() -> new IllegalArgumentException("등록되지 않은 컨텐트입니다."));
	}

	private Payment findPaymentOrElseThrow(byte paymentId) {
		return paymentRepository.findById(paymentId)
		                        .orElseThrow(() -> new IllegalArgumentException("등록되지 않은 지불 정보입니다."));
	}

	@Transactional
	@Scheduled(fixedDelay = 60000) // 1분마다 실행
	public void expireOrders() {
		// PENDING 상태이면서 생성 시간이 10분 전인 주문들을 찾아서 EXPIRED로 변경
		List<Order> expiredOrders = orderRepository.findAllByStatus(OrderStatusEnum.PENDING);
		expiredOrders.stream()
		             .filter(order -> order.getExpiredAt().isBefore(LocalDateTime.now()))
		             .forEach(Order::expire);
	}
}