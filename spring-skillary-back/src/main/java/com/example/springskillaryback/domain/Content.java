package com.example.springskillaryback.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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
import java.util.HashSet;
import java.util.Set;
import java.util.ArrayList;
import java.util.List;

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

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

	@Column(length = 20, nullable = false)
	private CategoryEnum category;

	@CreationTimestamp
	private LocalDateTime createdAt;

	@LastModifiedDate
	private LocalDateTime updatedAt;

	@Column(name = "view_counts", nullable = false)
	@Builder.Default
	private Integer viewCount = 0;

	@Column(name = "like_counts", nullable = false)
	@Builder.Default
	private Integer likeCount = 0;

	@OneToMany(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<ContentLike> likes = new ArrayList<>();

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "plan_id")
	private SubscriptionPlan plan;

	@Column(nullable = true)
	private Integer price; // price plan 동시 x <- 서비스단 검증

	@OneToOne(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true)
	private Post post;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "creator_id", nullable = false)
	private Creator creator;

	private String thumbnailUrl;

    @Column(nullable = true)
	private LocalDateTime deletedAt;
}