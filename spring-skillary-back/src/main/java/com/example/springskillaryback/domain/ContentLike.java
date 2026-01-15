package com.example.springskillaryback.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Table(
	name = "content_likes",
	uniqueConstraints = @UniqueConstraint(
		columnNames = {"content_id", "user_id"}
	)
)
@Entity
@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ContentLike {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Byte likeId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "content_id", nullable = false)
	private Content content;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;
}

