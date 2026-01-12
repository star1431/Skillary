package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.Content;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ContentRepository extends JpaRepository<Content, Byte> {
	Optional<Content> findByTitle(String title);

	// n+1 이슈 : 연관 지연로딩 엔티티그래프로 fetch join 최적화
	@EntityGraph(attributePaths = {"creator", "post", "post.fileList", "post.comments", "post.comments.user"})
	@Query("SELECT c FROM Content c")
	Slice<Content> findAllWithRelations(Pageable pageable);

	@EntityGraph(attributePaths = {"creator", "post", "post.fileList", "post.comments", "post.comments.user"})
	Optional<Content> findById(Byte contentId);
}