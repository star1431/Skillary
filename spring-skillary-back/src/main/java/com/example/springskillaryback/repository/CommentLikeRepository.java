package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.CommentLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentLikeRepository extends JpaRepository<CommentLike, Byte> {

	/** 댓글id and 유저id - like 존재 여부 */
	boolean existsByComment_CommentIdAndUser_UserId(Byte commentId, Byte userId);
	
	/** 댓글id and 유저id - like 삭제 */
	void deleteByComment_CommentIdAndUser_UserId(Byte commentId, Byte userId);
}

