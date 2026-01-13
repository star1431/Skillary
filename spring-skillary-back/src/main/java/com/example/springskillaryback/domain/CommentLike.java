package com.example.springskillaryback.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Table(
	name = "comment_likes",
	uniqueConstraints = @UniqueConstraint(
		columnNames = {"comment_id", "user_id"}
	)
)
@Entity
@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CommentLike {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Byte likeId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "comment_id", nullable = false)
	private Comment comment;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;
}

