package com.example.springskillaryback.service;

import com.example.springskillaryback.domain.Subscribe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.springskillaryback.domain.SubscriptionPlan;
import com.example.springskillaryback.domain.User;

import java.util.List;

public interface SubscriptionService {
	Subscribe subscribe(byte userId, byte creatorId);

	void deleteSubscribe(byte userId, byte planId);

	Page<Subscribe> pagingSubscribes(byte userId, Pageable pageable);
  
  List<Subscribe> pagingSubscribes(byte userId);
}
