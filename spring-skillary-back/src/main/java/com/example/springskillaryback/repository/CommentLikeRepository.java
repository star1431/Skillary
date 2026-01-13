package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.CommentLike;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentLikeRepository extends JpaRepository<CommentLike, Byte> {
	boolean existsByComment_CommentIdAndUser_UserId(Byte commentId, Byte userId);
	
	void deleteByComment_CommentIdAndUser_UserId(Byte commentId, Byte userId);
	
	long countByComment_CommentId(Byte commentId);
}

