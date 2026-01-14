package com.example.springskillaryback.service.impl;

import com.example.springskillaryback.domain.Subscribe;
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
	private final SubscribeRepository subscribeRepository;

	@Override
	public Subscribe subscribe(User user, SubscriptionPlan plan) {
		var subscribe = new Subscribe(plan, user);
		return subscribeRepository.save(subscribe);
	}

	@Override
	public void deleteSubscribe(byte userId, byte creatorId) {

	}

	@Override
	public List<Subscribe> pagingSubscribes(byte userId) {
		return List.of();
	}
}