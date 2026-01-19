package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.Subscribe;
import com.example.springskillaryback.domain.SubscribeStatusEnum;
import com.example.springskillaryback.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.springskillaryback.domain.SubscriptionPlan;
import com.example.springskillaryback.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscribeRepository extends JpaRepository<Subscribe, Byte> {

  Page<Subscribe> findAllBySubscribeStatusAndUser(SubscribeStatusEnum status, User user, Pageable pageable);

	boolean existsBySubscribeStatusAndSubscriptionPlanAndUser(
			SubscribeStatusEnum subscribeStatusEnum,
			SubscriptionPlan subscriptionPlan,
			User user
	);
}
