package com.example.springskillaryback.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

import static jakarta.persistence.EnumType.STRING;

@Table(name = "subscribes")
@Entity
@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Subscribe {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Byte subscribeId;

	@Enumerated(STRING)
    @Column(length = 20, nullable = false)
	private SubscribeStatusEnum subscribeStatus;

	@CreationTimestamp
	private LocalDateTime createdAt;

	private LocalDateTime startAt;

	private LocalDateTime endAt;

	@ManyToOne
	@JoinColumn(name = "plan_id", nullable = false)
	private SubscriptionPlan subscriptionPlan;

	@ManyToOne
	private User user;

	public Subscribe(SubscriptionPlan subscriptionPlan, User user) {
		this.subscriptionPlan = subscriptionPlan;
		this.user = user;
		this.subscribeStatus = SubscribeStatusEnum.ACTIVE;
		this.startAt = LocalDateTime.now();
	}
}