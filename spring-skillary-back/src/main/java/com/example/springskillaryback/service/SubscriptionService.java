package com.example.springskillaryback.service;

import com.example.springskillaryback.domain.Subscribe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.springskillaryback.domain.SubscriptionPlan;
import com.example.springskillaryback.domain.User;

public interface SubscriptionService {
	SubscriptionPlan createSubscription(Byte userId, String planName, String description, int price);

	Page<SubscriptionPlan> pagingSubscriptionPlan(Byte userId, int page, int size);

	Subscribe subscribe(User user, SubscriptionPlan subscriptionPlan);

	void deletePlan(byte userId, byte planId);

	void deleteSubscribe(byte userId, byte planId);

	Page<Subscribe> pagingSubscribes(byte userId, Pageable pageable);
}
