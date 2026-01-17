package com.example.springskillaryback.service;

import com.example.springskillaryback.domain.Subscribe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SubscriptionService {
	Subscribe subscribe(byte userId, byte creatorId);

	void deleteSubscribe(byte userId, byte planId);

	Page<Subscribe> pagingSubscribes(byte userId, Pageable pageable);
}
