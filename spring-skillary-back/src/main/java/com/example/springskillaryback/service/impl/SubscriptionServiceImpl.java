package com.example.springskillaryback.service.impl;

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
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.springskillaryback.domain.SubscriptionPlan;
import com.example.springskillaryback.domain.User;
import com.example.springskillaryback.repository.SubscribeRepository;
import com.example.springskillaryback.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {
	private final UserRepository userRepository;
	private final SubscribeRepository subscribeRepository;
	private final SubscriptionPlanRepository subscriptionPlanRepository;

	@Override
	public Subscribe subscribe(byte userId, byte planId) {
		User user = findUserOrElseThrow(userId);
		SubscriptionPlan plan = findPlanOrElseThrow(planId);
		if (user.getSubscribe(planId).isPresent())
			throw new IllegalArgumentException("해당 회원은 이미 구독을 하고 있습니다.");
		Subscribe subscribe = new Subscribe(user, plan);
		return subscribeRepository.save(subscribe);
	}

	@Override
	public void deleteSubscribe(byte userId, byte subscriptionPlan) {
		System.out.println("\n\n\n\n" + userId + "\n" + subscriptionPlan + "\n\n\n\n");
		User user = findUserOrElseThrow(userId);
		System.out.println("\n\n\n\n" + user + "\n\n\n\n");
		Subscribe subscribe = user.getSubscribe(subscriptionPlan)
		                          .orElseThrow(() -> new IllegalArgumentException("해당 회원은 구독하고 있지 않습니다."));
		System.out.println("\n\n\n\n" + subscribe + "\n\n\n\n");
		if (!subscribe.isActive())
			throw new IllegalArgumentException("구독 중이 아닙니다.");

		subscribe.inactive();
		System.out.println("\n\n\n\n" + subscribe.getSubscribeStatus() + "\n\n\n\n");
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