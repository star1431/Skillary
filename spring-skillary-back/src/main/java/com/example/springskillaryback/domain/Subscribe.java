package com.example.springskillaryback.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
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

    @Builder.Default
	@Enumerated(STRING)
    @Column(length = 20, nullable = false)
	private SubscribeStatusEnum subscribeStatus = SubscribeStatusEnum.INACTIVE;

	@CreationTimestamp
	private LocalDateTime createdAt;

	private LocalDateTime startAt;

	private LocalDateTime endAt;

	@ManyToOne(fetch = FetchType.LAZY) // 지연 로딩 권장
	@JoinColumn(name = "user_id", nullable = false) // 외래 키 주인
	private User user;

	@ManyToOne
	@JoinColumn(name = "plan_id", nullable = false)
	private SubscriptionPlan subscriptionPlan;

	public Subscribe(User user, SubscriptionPlan subscriptionPlan) {
		this.user = user;
		this.subscriptionPlan = subscriptionPlan;
		this.subscribeStatus = SubscribeStatusEnum.ACTIVE;
		this.startAt = LocalDateTime.now();
	}

	public boolean isActive() {
		return this.subscribeStatus == SubscribeStatusEnum.ACTIVE;
	}

	public void inactive() {
		this.subscribeStatus = SubscribeStatusEnum.INACTIVE;
		this.endAt = LocalDateTime.now();
	}
}