package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Byte> {
    // SELECT c FROM Comment c WHERE c.post.postId = :postId
	List<Comment> findByPost_PostId(Byte postId);
}

