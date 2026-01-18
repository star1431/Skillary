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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

import static jakarta.persistence.EnumType.STRING;

@Table(name = "orders")
@Entity
@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Order {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Byte orderId;

	@Column(nullable = false)
	private int amount;

	@Enumerated(STRING)
	@Column(nullable = false)
	private OrderStatusEnum status;

	@CreationTimestamp
	private LocalDateTime createdAt;

	@Column(nullable = false)
	private LocalDateTime expiredAt;

	@ManyToOne
	private User user;

	@OneToOne
	@JoinColumn(name = "plan_id")
	private SubscriptionPlan subscriptionPlan;

	@ManyToOne
    @OnDelete(action = OnDeleteAction.SET_NULL) // 스케줄러 유료콘텐츠 삭제시 필요
    @JoinColumn(name = "content_id")
	private Content content;

	@OneToOne
	@JoinColumn(name = "payment_id")
	private Payment payment;
}