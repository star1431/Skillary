package com.example.springskillaryback.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.springskillaryback.domain.Order;
import com.example.springskillaryback.domain.OrderStatusEnum;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Byte> {

	/** 콘텐츠 단건결제 상태 - payment, order 조인 조회 */
	@Query("SELECT o FROM Order o LEFT JOIN FETCH o.payment WHERE o.content.contentId = :contentId AND o.status = :status")
	List<Order> findByContentIdAndStatus(Byte contentId, OrderStatusEnum status);
}
