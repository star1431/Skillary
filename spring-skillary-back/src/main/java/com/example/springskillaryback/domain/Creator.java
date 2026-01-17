package com.example.springskillaryback.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

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

	@Column(length = 100, nullable = false, unique = true)
	@Setter
	private String displayName;

    @Setter
    private String introduction;

	@Setter
	private String profile; // url (사진)

    @Setter
    private String bankName;

    @Setter
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
	@OneToMany(mappedBy = "creator") // [임시] 로컬 작업중 매핑오류 임시 수정
	List<Content> contents = new ArrayList<>();

}