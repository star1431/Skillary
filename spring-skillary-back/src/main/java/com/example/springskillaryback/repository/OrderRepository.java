package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.Order;
import com.example.springskillaryback.domain.OrderStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
	List<Order> findAllByStatus(OrderStatusEnum orderStatus);

	@Modifying // 데이터를 수정/삭제할 때 필수
	@Transactional // 삭제 작업은 트랜잭션 내에서 실행되어야 함
	@Query("DELETE FROM Order o WHERE o.status = :status")
	void deleteByStatus(OrderStatusEnum status);
}
