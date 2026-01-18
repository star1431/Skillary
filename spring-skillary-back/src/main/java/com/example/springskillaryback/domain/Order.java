package com.example.springskillaryback.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;
import java.util.UUID;

import static jakarta.persistence.EnumType.STRING;

@Table(name = "orders")
@Entity
@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class Order {
	private static final int EXPIRATION_MINUTES = 10;

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
    @OnDelete(action = OnDeleteAction.SET_NULL) // 스케줄러 유료콘텐츠 삭제시 필요
    @JoinColumn(name = "content_id")
	private Content content;

	@OneToOne(mappedBy = "order")
	private Payment payment;

	private Order(int amount, User user) {
		this.amount = amount;
		this.user = user;
		this.expiredAt = LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES);
	}

	public Order(int amount, User user, SubscriptionPlan subscriptionPlan) {
		this(amount, user);
		this.subscriptionPlan = subscriptionPlan;
	}

	public Order(int amount, User user, Content content) {
		this(amount, user);
		this.content = content;
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

	public void fail() {
		status = OrderStatusEnum.FAILED;
	}

	public boolean isNotPending() {
		return this.status != OrderStatusEnum.PENDING;
	}

	public boolean isPaid() {
		return this.status == OrderStatusEnum.PAID;
	}

	public boolean isPlan() {
		return this.subscriptionPlan != null;
	}

	public boolean isContent() {
		return this.content != null;
	}

	public boolean isSamePrice(int price) {
		if (this.subscriptionPlan != null)
			return this.subscriptionPlan.getPrice() == price;
		if (this.content != null)
			return this.content.getPrice() == price;
		return false;
	}

	public boolean isOwnedBy(User user) {
		return this.user.equals(user);
	}

	public boolean isExpired() {
		return this.expiredAt.isBefore(LocalDateTime.now());
	}
}