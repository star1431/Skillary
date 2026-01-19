package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.Subscribe;
import com.example.springskillaryback.domain.SubscribeStatusEnum;
import com.example.springskillaryback.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.springskillaryback.domain.SubscriptionPlan;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SubscribeRepository extends JpaRepository<Subscribe, Byte> {

	Page<Subscribe> findAllByUser(User user, Pageable pageable);

	boolean existsBySubscribeStatusAndSubscriptionPlanAndUser(
			SubscribeStatusEnum subscribeStatusEnum,
			SubscriptionPlan subscriptionPlan,
			User user
	);

	@Query("SELECT s FROM Subscribe s " +
	       "WHERE s.endAt <= :targetDateTime " +
	       "AND s.subscribeStatus IN (" +
	       "com.example.springskillaryback.domain.SubscribeStatusEnum.ACTIVE, " +
	       "com.example.springskillaryback.domain.SubscribeStatusEnum.INACTIVE)")
	List<Subscribe> findByEndAtBeforeAndStatusActiveOrInactive(
			@Param("targetDateTime") LocalDateTime targetDateTime
	);
}
