package com.example.springskillaryback.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Table(name = "creators")
@Entity
@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Creator {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Byte creatorId;

//	@Column(length = 100, nullable = false, unique = true)
//	private String displayName;

    private String introduction;

	private String profile; // url (사진)

    private String bankName;

    private String accountNumber;

    @Builder.Default
    private Byte followCount = 0;

    @Builder.Default
	private boolean isDeleted = false;

	@CreationTimestamp
	private LocalDateTime createdAt;

	@UpdateTimestamp
	private LocalDateTime updatedAt;

	@OneToOne
	@JoinColumn(name = "user_id", unique = true)
	private User user;

    @Builder.Default
	@OneToMany(orphanRemoval = true)
	@JoinColumn(name = "creator_id")
	Set<SubscriptionPlan> plans = new HashSet<>();

    @Builder.Default
	@OneToMany(orphanRemoval = true)
	@JoinColumn(name = "creator_id")
	List<CreatorSettlement> settlements = new ArrayList<>();

    @Builder.Default
	@OneToMany
	@JoinColumn(name = "creator_id", nullable = false)
	List<Content> contents = new ArrayList<>();
}