package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.Subscribe;
import com.example.springskillaryback.domain.SubscribeStatusEnum;
import com.example.springskillaryback.domain.SubscriptionPlan;
import com.example.springskillaryback.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscribeRepository extends JpaRepository<Subscribe, Byte> {
	boolean existsBySubscribeStatusAndSubscriptionPlanAndUser(
			SubscribeStatusEnum subscribeStatusEnum,
			SubscriptionPlan subscriptionPlan,
			User user
	);
}
