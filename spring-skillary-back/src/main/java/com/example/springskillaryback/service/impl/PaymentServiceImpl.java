package com.example.springskillaryback.service.impl;

import com.example.springskillaryback.common.dto.CompleteBillingRequestDto;
import com.example.springskillaryback.common.dto.CompletePaymentRequestDto;
import com.example.springskillaryback.common.util.TossPaymentsClient;
import com.example.springskillaryback.domain.Card;
import com.example.springskillaryback.domain.Content;
import com.example.springskillaryback.domain.CreditMethodEnum;
import com.example.springskillaryback.domain.CreditStatusEnum;
import com.example.springskillaryback.domain.Order;
import com.example.springskillaryback.domain.OrderStatusEnum;
import com.example.springskillaryback.domain.Payment;
import com.example.springskillaryback.domain.SubscriptionPlan;
import com.example.springskillaryback.domain.User;
import com.example.springskillaryback.repository.CardRepository;
import com.example.springskillaryback.repository.ContentRepository;
import com.example.springskillaryback.repository.OrderRepository;
import com.example.springskillaryback.repository.PaymentRepository;
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

@Slf4j
@Service
@Transactional
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
	public String getCustomerKey(Byte userId) {
		User user = findUserOrElseThrow(userId);
		return user.getCustomerKey()
		           .toString();
	}

	@Override
	public Card createCard(Byte userId, String customerKey, String authKey) {
		User user = findUserOrElseThrow(userId);
		if (!user.getCustomerKey()
		         .toString()
		         .equals(customerKey))
			throw new IllegalArgumentException("로그인부터 다시 이용해주세요");

		JsonNode response = tossPaymentsClient.issueBillingKey(authKey, customerKey);

		String billingKey = response.path("billingKey")
		                            .asString();
		String cardNumber = response.path("cardNumber")
		                            .asString();
		String cardCompany = response.path("cardCompany")
		                             .asString();
		String cardType = response.path("card")
		                          .path("cardType")
		                          .asString();
		String ownerType = response.path("card")
		                           .path("ownerType")
		                           .asString();

		cardRepository.resetDefaultStatus(user.getUserId()
		                                      .toString());
		Card card = new Card(cardCompany, cardNumber, cardType, ownerType, billingKey, user);
		cardRepository.save(card);
		return user.addCard(card);
	}

	@Override
	@Transactional(readOnly = true)
	public Page<Card> pagingCards(Byte userId, int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt")
		                                                   .descending());
		User user = findUserOrElseThrow(userId);
		return cardRepository.findAllByUser(user, pageable);
	}

	@Override
	@Transactional(readOnly = true)
	public Page<Order> pagingOrders(Byte userId, int page, int size) {
		User user = findUserOrElseThrow(userId);
		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt")
		                                                   .descending());
		return orderRepository.findAllByUser(user, pageable);
	}

	@Override
	public Order billingOrder(Byte userId, byte planId) {
		User user = findUserOrElseThrow(userId);
		SubscriptionPlan plan = findPlanOrElseThrow(planId);

		if (user.isSubscribed(plan))
			throw new RuntimeException("이미 구독중인 상품입니다.");

		return orderRepository.save(new Order(
				plan.getPrice(),
				user,
				plan
		));
	}

	@Override
	public Order paymentOrder(Byte userId, byte contentId) {
		User user = findUserOrElseThrow(userId);
		Content content = findContentOrElseThrow(contentId);

		if (user.hasContent(content))
			throw new RuntimeException("해당 품목은 이미 구매하였습니다.");

		return orderRepository.save(new Order(
				content.getPrice(),
				user,
				content
		));
	}

	@Override
	public Payment completeBilling(
			Byte userId,
			CompleteBillingRequestDto completeBillingRequestDto
	) {
		Order order = findOrderOrElseThrow(completeBillingRequestDto.orderId());
		User user = findUserOrElseThrow(userId);

		if (
				!order.isSamePrice(completeBillingRequestDto.subscriptionFee())
				|| !order.isOwnedBy(user)
				|| order.isNotPending()
				|| !user.verifyWith(completeBillingRequestDto.customerKey())
		)
			throw new IllegalArgumentException("잘못된 주문 정보입니다.");

		if (order.isExpired()) {
			order.expire();
			throw new IllegalArgumentException("이미 만료된 주문입니다.");
		}

		Card defaultCard = cardRepository.findByUserAndIsDefaultTrue(user)
		                                 .orElseThrow(() -> new RuntimeException("등록된 기본 카드가 없습니다."));

		var tossResponse = tossPaymentsClient.payWithBillingKey(
				user.getIdempotencyKey().toString(),
				defaultCard.getBillingKey(),
				completeBillingRequestDto.customerKey(),
				completeBillingRequestDto.orderId(),
				completeBillingRequestDto.planName(),
				completeBillingRequestDto.subscriptionFee()
		);

		String paymentKey = tossResponse.path("paymentKey").asString();
		int amount = tossResponse.path("totalAmount").asInt();
		var creditMethod = CreditMethodEnum.fromMethod(tossResponse.path("method").asString());

		if (paymentRepository.existsByPaymentKey(paymentKey)) {
			order.fail();
			throw new IllegalArgumentException("구독을 해지한 이후에 구독을 해주세요");
		}

		Payment payment = new Payment(paymentKey, amount, order, creditMethod, user);

		paymentRepository.save(payment);
		order.complete();
		subscriptionService.subscribe(user, order.getSubscriptionPlan());
		return payment;
	}

	@Override
	public Payment completePayment(
			Byte userId,
			CompletePaymentRequestDto completePaymentRequestDto
	) {
		Order order = findOrderOrElseThrow(completePaymentRequestDto.orderId());
		User user = findUserOrElseThrow(userId);

		if (
				!order.isSamePrice(completePaymentRequestDto.amount())
				|| order.isNotPending()
				|| !order.isOwnedBy(user)
		)
			throw new IllegalArgumentException("잘못된 주문 정보입니다.");

		if (order.isExpired())
			throw new IllegalArgumentException("이미 만료된 주문입니다.");

		var tossResponse = tossPaymentsClient.confirm(
				user.getIdempotencyKey().toString(),
				completePaymentRequestDto.paymentKey(),
				completePaymentRequestDto.orderId(),
				completePaymentRequestDto.amount()
		);

		String paymentKey = tossResponse.path("paymentKey").asString();
		int amount = tossResponse.path("totalAmount").asInt();
		CreditMethodEnum creditMethod = CreditMethodEnum.fromMethod(tossResponse.path("method").asString());

		if (paymentRepository.existsByPaymentKey(paymentKey)) {
			order.fail();
			throw new IllegalArgumentException("동일한 상품은 재주문 할 수 있는 기간 이후에 주문해주세요.");
		}

		Payment payment = new Payment(paymentKey, amount, order, creditMethod, user);

		paymentRepository.save(payment);
		order.complete();
		return payment;
	}

	@Override
	@Transactional(readOnly = true)
	public Page<Payment> pagingPayments(
			Byte userId,
			int page,
			int size
	) {
		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		return paymentRepository.findAll(pageable);
	}

	@Override
	public void withdrawCard(
			Byte userId,
			byte cardId
	) {
		User user = findUserOrElseThrow(userId);
		Card card = cardRepository.findById(cardId)
		                          .orElseThrow(() -> new IllegalArgumentException("시스템에 등록되지 않은 카드입니다."));

		if (!card.isOwnedBy(user))
			throw new IllegalArgumentException("가지고 있지 않은 카드입니다.");

		int statusCode = tossPaymentsClient.deleteBillingKey(
				card.getUser().getIdempotencyKey().toString(),
				card.getBillingKey()
		);

		if (statusCode == 200)
			cardRepository.delete(card);
	}

	@Override
	@Transactional(readOnly = true)
	public Order retrieveOrder(
			Byte userId,
			String orderId
	) {
		User user = findUserOrElseThrow(userId);
		Order order = findOrderOrElseThrow(orderId);
		if (!order.isOwnedBy(user))
			throw new IllegalArgumentException("주문자가 아닙니다.");
		if (order.isNotPending())
			throw new IllegalArgumentException("다시 주문을 생성해주세요.");
		return order;
	}

	private SubscriptionPlan findPlanOrElseThrow(byte planId) {
		return subscriptionPlanRepository.findById(planId)
		                                 .orElseThrow(() -> new IllegalArgumentException("등록되지 않은 플랜입니다."));
	}

	private User findUserOrElseThrow(Byte userId) {
		return userRepository.findById(userId)
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

	@Transactional
	@Scheduled(fixedDelay = 60000)
	public void expireOrders() {
		List<Order> expiredOrders = orderRepository.findAllByStatus(OrderStatusEnum.PENDING);
		expiredOrders.stream()
		             .filter(order -> order.getExpiredAt()
		                                   .isBefore(LocalDateTime.now()))
		             .forEach(Order::expire);
	}

	@Scheduled(cron = "0 0 3 * * *")
	public void deleteExpiredOrders() {
		log.info("만료된 주문 정보 삭제 작업을 시작합니다.");

		try {
			orderRepository.deleteByStatus(OrderStatusEnum.EXPIRED);
			log.info("만료된 주문 삭제가 성공적으로 완료되었습니다.");
		} catch (Exception e) {
			log.error("주문 삭제 작업 중 오류가 발생했습니다: {}", e.getMessage());
		}
	}
}