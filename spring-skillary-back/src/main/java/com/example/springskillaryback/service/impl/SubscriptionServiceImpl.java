package com.example.springskillaryback.service.impl;

import com.example.springskillaryback.common.util.TossPaymentsClient;
import com.example.springskillaryback.domain.Card;
import com.example.springskillaryback.domain.Creator;
import com.example.springskillaryback.domain.CreditMethodEnum;
import com.example.springskillaryback.domain.Order;
import com.example.springskillaryback.domain.Payment;
import com.example.springskillaryback.domain.Subscribe;
import com.example.springskillaryback.domain.SubscribeStatusEnum;
import com.example.springskillaryback.domain.SubscriptionPlan;
import com.example.springskillaryback.domain.User;
import com.example.springskillaryback.repository.CardRepository;
import com.example.springskillaryback.repository.OrderRepository;
import com.example.springskillaryback.repository.PaymentRepository;
import com.example.springskillaryback.repository.SubscribeRepository;
import com.example.springskillaryback.repository.SubscriptionPlanRepository;
import com.example.springskillaryback.repository.UserRepository;
import com.example.springskillaryback.service.SubscriptionService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;


@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {
	private final OrderRepository orderRepository;
	private final UserRepository userRepository;
	private final SubscribeRepository subscribeRepository;
	private final SubscriptionPlanRepository subscriptionPlanRepository;
	private final CardRepository cardRepository;
	private final TossPaymentsClient tossPaymentsClient;
	private final PaymentRepository paymentRepository;

	@Override
	public SubscriptionPlan createSubscription(Byte userId, String planName, String description, int price) {
		User user = findUserOrElseThrow(userId);
		if (user.getCreator() == null)
			throw new IllegalArgumentException("크리에이터를 먼저 생성해주세요.");
		SubscriptionPlan subscriptionPlan = new SubscriptionPlan(planName, description, price, user.getCreator());
		subscriptionPlanRepository.save(subscriptionPlan);
		return subscriptionPlan;
	}

	@Override
	public SubscriptionPlan getSubscriptionPlan(Byte planId) {
		return subscriptionPlanRepository.findById(planId)
				.orElseThrow(() -> new IllegalArgumentException("시스템에 없는 플랜입니다."));
	}

	@Override
	public Page<SubscriptionPlan> pagingSubscriptionPlan(Byte userId, int page, int size) {
		Creator creator = findUserOrElseThrow(userId).getCreator();
		if (creator == null)
			throw new IllegalArgumentException("크리에이터를 먼저 생성해주세요.");
		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		return subscriptionPlanRepository.findAllByCreator(creator, pageable);
	}

	@Override
	public Subscribe subscribe(User user, SubscriptionPlan plan) {
		if (user.getSubscribe(plan.getPlanId()).isPresent())
			throw new IllegalArgumentException("해당 회원은 이미 구독을 하고 있습니다.");
		Subscribe subscribe = new Subscribe(user, plan);
		return subscribeRepository.save(subscribe);
	}

	@Override
	public void deletePlan(byte userId, byte planId) {
		Creator creator = findUserOrElseThrow(userId).getCreator();
		if (creator == null)
			throw new IllegalArgumentException("크리에이터를 먼저 생성해주세요.");

		SubscriptionPlan plan = subscriptionPlanRepository
				.findById(planId)
				.orElseThrow(() -> new EntityNotFoundException("플랜을 찾을 수 없습니다. ID: " + planId));

		plan.inactive();
	}

	@Override
	public void deleteSubscribe(byte userId, byte subscriptionPlan) {
		User user = findUserOrElseThrow(userId);
		Subscribe subscribe = user.getSubscribe(subscriptionPlan)
		                          .orElseThrow(() -> new IllegalArgumentException("해당 회원은 구독하고 있지 않습니다."));
		if (!subscribe.isActive())
			throw new IllegalArgumentException("구독 중이 아닙니다.");

		subscribe.inactive();
	}

	@Override
	public Page<Subscribe> pagingSubscribes(byte userId, Pageable pageable) {
		User user = findUserOrElseThrow(userId);
		return subscribeRepository.findAllByUser(user, pageable);
	}

	private User findUserOrElseThrow(byte userId) {
		return userRepository.findById(userId)
		                     .orElseThrow(() -> new IllegalArgumentException("시스템에 등록되어 있지 않습니다."));
	}

	private SubscriptionPlan findPlanOrElseThrow(byte planId) {
		return subscriptionPlanRepository.findById(planId)
				.orElseThrow(() -> new IllegalArgumentException("해당 플랜은 시스템에 등록되어 있지 않습니다"));
	}


	@Transactional
	@Scheduled(cron = "0 0 3 * * *")
	public void updateBillingPay() {
		log.info("정기 구독 갱신을 시작합니다.");
		// 만료된 목록 조회
		List<Subscribe> lst = subscribeRepository.findByEndAtBeforeAndStatusActiveOrInactive(LocalDateTime.now());

		for (Subscribe subscribe : lst) {
			try {
				// 1. INACTIVE 처리 로직
				if (subscribe.isInactive()
				    || subscribe.getSubscriptionPlan().isInactive()) {
					subscribe.cancel();
					continue; // 다음 사람으로 진행
				}

				// 2. 결제 준비
				User user = subscribe.getUser();
				Card defaultCard = cardRepository.findByUserAndIsDefaultTrue(user)
				                                 .orElseThrow(() -> new RuntimeException("등록된 기본 카드가 없습니다."));

				SubscriptionPlan plan = subscribe.getSubscriptionPlan();

				// 3. 신규 주문 생성 (영수증 역할)
				Order order = orderRepository.save(new Order(plan.getPrice(), user, plan));

				// 4. 토스 결제 요청 (멱등성 키로 OrderID 활용)
				var tossResponse = tossPaymentsClient.payWithBillingKey(
						order.getOrderId().toString(),
						defaultCard.getBillingKey(),
						user.getCustomerKey().toString(),
						order.getOrderId().toString(),
						plan.getName(),
						plan.getPrice()
				);

				// 5. 결제 성공 정보 저장
				String paymentKey = tossResponse.path("paymentKey").asString();
				int amount = tossResponse.path("totalAmount").asInt();
				var creditMethod = CreditMethodEnum.fromMethod(tossResponse.path("method").asString());

				paymentRepository.save(new Payment(paymentKey, amount, order, creditMethod, user));

				// 6. 주문 완료 처리 및 기존 구독 정보 갱신 (가장 중요)
				order.complete();
				subscribe.renew(); // endAt을 한 달 뒤로 미루는 메서드 (앞서 작성한 로직)

				log.info("✅ 결제 및 구독 갱신 완료: 유저 ID {}", user.getUserId());
			} catch (Exception e) {
				// 7. 실패 처리
				subscribe.fail(); // 상태를 FAILED 등으로 변경하여 다음 실행 시 중복 시도 방지
				log.error("❌ [구독 결제 실패] 유저 ID {}: {}", subscribe.getUser().getUserId(), e.getMessage());
			}
		}
	}
}