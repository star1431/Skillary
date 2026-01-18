package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.Order;
import com.example.springskillaryback.domain.OrderStatusEnum;
import com.example.springskillaryback.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
	List<Order> findAllByStatus(OrderStatusEnum orderStatus);

	Page<Order> findAllByUser(User user, Pageable pageable);

	@Modifying // 데이터를 수정/삭제할 때 필수
	@Transactional // 삭제 작업은 트랜잭션 내에서 실행되어야 함
	@Query("DELETE FROM Order o WHERE o.status = :status")
	void deleteByStatus(OrderStatusEnum status);

	/** 콘텐츠 단건결제 상태 - payment, order 조인 조회 */
	@Query("SELECT o FROM Order o LEFT JOIN FETCH o.payment WHERE o.content.contentId = :contentId AND o.status = :status")
	List<Order> findByContentIdAndStatus(Byte contentId, OrderStatusEnum status);
}
