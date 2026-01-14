package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.Comment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Byte> {

	/** 포스트기준 댓글 */
	@EntityGraph(attributePaths = {"user", "creator", "parent", "likes", "likes.user"})
	List<Comment> findByPost_PostId(Byte postId);
	
	/** 댓글 단건 */
	@EntityGraph(attributePaths = {"user", "creator", "parent", "likes", "likes.user"})
	java.util.Optional<Comment> findById(Byte commentId);
	
	/** 대댓글 개수 확인 (딜리트용) */
	long countByParentCommentId(Byte parentCommentId);
}

