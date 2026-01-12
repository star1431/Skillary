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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Table(name = "posts")
@Entity
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Post {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Byte postId;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String body;

	@OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<PostFile> fileList = new ArrayList<>(); // 본문에 삽입된 이미지/영상 리스트 (순서대로)

	@OneToOne
	@JoinColumn(name = "content_id", nullable = false)
	private Content content;

	@OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
	@Builder.Default
	private List<Comment> comments = new ArrayList<>();

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "creator_id", nullable = false)
	private Creator creator;
}