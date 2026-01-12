package com.example.springskillaryback.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
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
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@Table(name = "contents")
@Builder
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Content {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Byte contentId;

	@Column(nullable = false, length = 100)
	private String title;

	@Column(length = 20, nullable = false)
	private CategoryEnum category;

	@CreationTimestamp
	private LocalDateTime createdAt;

	@LastModifiedDate
	private LocalDateTime updatedAt;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "plan_id")
	private SubscriptionPlan plan;

	@OneToOne(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true)
	private Post post;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "creator_id", nullable = false)
	private Creator creator;

	private String thumbnailUrl; // 썸네일 이미지 URL
}