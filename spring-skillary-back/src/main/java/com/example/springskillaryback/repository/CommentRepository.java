package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.Comment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Byte> {

	/** 포스트기준 댓 */
	@EntityGraph(attributePaths = {"user", "creator", "parent", "children", "children.user", "children.creator", "likes", "likes.user", "children.likes", "children.likes.user"})
	List<Comment> findByPost_PostId(Byte postId);
	
	/** 댓글 단건 */
	@EntityGraph(attributePaths = {"user", "creator", "parent", "children", "likes", "likes.user"})
	java.util.Optional<Comment> findById(Byte commentId);
}

