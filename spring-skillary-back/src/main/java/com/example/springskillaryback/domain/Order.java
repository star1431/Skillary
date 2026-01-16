package com.example.springskillaryback.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

import static jakarta.persistence.EnumType.STRING;

@Entity
@Table(name = "orders")
@NoArgsConstructor
@Getter
public class Order {
	@Id
	@Column(columnDefinition = "BINARY(16)")
	private UUID orderId;

	@PrePersist
	public void createOrderId() {
		this.orderId = UUID.randomUUID();
	}

	@Column(nullable = false)
	private int amount;

	@Enumerated(STRING)
	@Column(nullable = false)
	private OrderStatusEnum status = OrderStatusEnum.PENDING; // schema.sql DEFAULT 수정 필요

	@CreationTimestamp
	private LocalDateTime createdAt;

	@Column(nullable = false)
	private LocalDateTime expiredAt;

	@ManyToOne
	private User user;

	@ManyToOne
	@JoinColumn(name = "plan_id")
	private SubscriptionPlan subscriptionPlan;

	@ManyToOne
	@JoinColumn(name = "content_id")
	private Content content;

	@OneToOne(mappedBy = "order")
	private Payment payment;

	public Order(int amount, User user, SubscriptionPlan subscriptionPlan, LocalDateTime expiredAt) {
		this.amount = amount;
		this.user = user;
		this.subscriptionPlan = subscriptionPlan;
		this.expiredAt = expiredAt;
	}

	public Order(int amount, User user, Content content, LocalDateTime expiredAt) {
		this.amount = amount;
		this.user = user;
		this.content = content;
		this.expiredAt = expiredAt;
	}

	public boolean verifyWith(int credit) {
		return LocalDateTime.now().isBefore(this.expiredAt)
				&& this.amount == credit;
	}

	public void complete() {
		status = OrderStatusEnum.PAID;
	}

	public void expire() {
		status = OrderStatusEnum.EXPIRED;
	}

	public boolean isNotPending() {
		return this.status != OrderStatusEnum.PENDING;
	}

	public boolean isPaid() {
		return this.status == OrderStatusEnum.PAID;
	}
}