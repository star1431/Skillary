package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Byte> {
	Optional<Post> findByContent_ContentId(Byte contentId);
}
