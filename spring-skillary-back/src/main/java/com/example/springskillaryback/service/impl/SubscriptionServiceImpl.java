package com.example.springskillaryback.service.impl;

import com.example.springskillaryback.domain.Creator;
import com.example.springskillaryback.domain.Subscribe;
import com.example.springskillaryback.domain.SubscribeStatusEnum;
import com.example.springskillaryback.domain.SubscriptionPlan;
import com.example.springskillaryback.domain.User;
import com.example.springskillaryback.repository.SubscribeRepository;
import com.example.springskillaryback.repository.SubscriptionPlanRepository;
import com.example.springskillaryback.repository.UserRepository;
import com.example.springskillaryback.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {
	private final UserRepository userRepository;
	private final SubscribeRepository subscribeRepository;
	private final SubscriptionPlanRepository subscriptionPlanRepository;

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

		creator.deletePlan(planId);
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
		return subscribeRepository.findAllBySubscribeStatusAndUser(
				SubscribeStatusEnum.ACTIVE,
				user, pageable);
	}

	private User findUserOrElseThrow(byte userId) {
		return userRepository.findById(userId)
		                     .orElseThrow(() -> new IllegalArgumentException("시스템에 등록되어 있지 않습니다."));
	}

	private SubscriptionPlan findPlanOrElseThrow(byte planId) {
		return subscriptionPlanRepository.findById(planId)
				.orElseThrow(() -> new IllegalArgumentException("시스템에 등록되어 있지 않습니다."));
	}
}