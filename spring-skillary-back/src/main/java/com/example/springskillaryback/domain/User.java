package com.example.springskillaryback.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.annotation.LastModifiedBy;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Table(name = "users")
@Entity
@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Byte userId;

	@Column(nullable = false, unique = true, columnDefinition = "BINARY(16)")
	private UUID customerKey;
	@Column(nullable = false, unique = true, columnDefinition = "BINARY(16)")
	private UUID idempotencyKey;
	@PrePersist
	public void prePersist() {
		this.idempotencyKey = UUID.randomUUID();
		this.customerKey = UUID.randomUUID();
	}

	@Column(nullable = false, unique = true)
	private String email;

	@Column(nullable = false)
	private String password;

	@Setter
    @Column(nullable = false, unique = true, length = 100)
	private String nickname;

	@Setter
    private String profile; // 프로필 사진

	@CreationTimestamp
	private LocalDateTime createdAt;

	@LastModifiedBy
	private LocalDateTime updatedAt;

    @Builder.Default
    private Byte subscribedCreatorCount = 0;

    @Builder.Default
    @Setter
    private boolean isDeleted = false;

	@Builder.Default
	@ManyToMany
	@JoinTable(
			name = "user_content",
			joinColumns = @JoinColumn(name = "user_id"),
			inverseJoinColumns = @JoinColumn(name = "content_id")
	)
	private Set<Content> contents = new HashSet<>();

	@Builder.Default
	@ManyToMany
	@JoinTable(
			name = "user_role",
			joinColumns = @JoinColumn(name = "user_id"),
			inverseJoinColumns = @JoinColumn(name = "role_id")
	)
	private Set<Role> roles = new HashSet<>();

    @OneToOne(mappedBy = "user")
    private Creator creator;

	@Builder.Default
	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
	private Set<Subscribe> subscribes = new HashSet<>();

	@Builder.Default
	@OneToMany
	@JoinColumn(name = "user_id")
	private List<Comment> comments = new ArrayList<>();

	@Builder.Default
	@OneToMany
	@JoinColumn(name = "user_id")
	private List<Order> orders = new ArrayList<>();

	@Builder.Default
	@OneToMany
	@JoinColumn(name = "customer_key")
	private List<Card> cards = new ArrayList<>();
  
	public Optional<Subscribe> getSubscribe(byte planId) {
		return subscribes.stream()
		                 .filter(Subscribe::isActive)
		                 .filter(subscribe -> subscribe.getSubscriptionPlan()
		                                               .getPlanId()
		                                               .equals(planId))
		                 .findFirst();
	}

	public boolean hasContent(Content content) {
		return contents.contains(content);
	}

	public boolean isSubscribed(SubscriptionPlan plan) {
		return subscribes.stream()
		                 .anyMatch(subscribe -> subscribe.getSubscriptionPlan().equals(plan));
	}

	public Card addCard(Card card) {
		cards.add(card);
		return card;
	}

	public boolean verifyWith(String customerKey) {
		return this.customerKey.toString().equals(customerKey);
	}

	public boolean hasRole(RoleEnum role) {
		return roles.stream()
		            .anyMatch(r -> r.getRole().equals(role));
	}
}