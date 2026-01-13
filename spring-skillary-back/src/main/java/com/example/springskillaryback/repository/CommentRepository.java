package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.Comment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Byte> {

	/** 포스트기준 댓글 */
	@EntityGraph(attributePaths = {"user", "parent", "children", "children.user"})
	List<Comment> findByPost_PostId(Byte postId);
	
	/** 댓글 단건 */
	@EntityGraph(attributePaths = {"user", "parent"})
	java.util.Optional<Comment> findById(Byte commentId);
}

