package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.Creator;
import com.example.springskillaryback.domain.SubscriptionPlan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Byte> {
	Page<SubscriptionPlan> findAllByCreator(Creator creator, Pageable pageable);
}
