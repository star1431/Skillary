package com.example.springskillaryback.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

@Table(name = "subscription_plans")
@Entity
@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class SubscriptionPlan {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Byte planId;

	@Column(nullable = false, length = 100)
	private String name;

	@Column(nullable = false)
	private String description;

	@Column(nullable = false)
	private int price;

    @Builder.Default
	private boolean isActive = false;

	@CreationTimestamp
	private LocalDateTime createdAt;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "creator_id", nullable = false)
	private Creator creator;

	public SubscriptionPlan(String name, String description, int price, Creator creator) {
		this.name = name;
		this.description = description;
		this.price = price;
		this.creator = creator;
		this.isActive = true;
	}
}