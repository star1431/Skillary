package com.example.springskillaryback.service;

import com.example.springskillaryback.domain.Subscribe;
import com.example.springskillaryback.domain.SubscriptionPlan;
import com.example.springskillaryback.domain.User;

import java.util.List;

public interface SubscriptionService {
	Subscribe subscribe(User user, SubscriptionPlan plan);

	void deleteSubscribe(byte userId, byte creatorId);

	List<Subscribe> pagingSubscribes(byte userId);
}
