package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.ContentLike;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContentLikeRepository extends JpaRepository<ContentLike, Byte> {
	boolean existsByContent_ContentIdAndUser_UserId(Byte contentId, Byte userId);
	
	void deleteByContent_ContentIdAndUser_UserId(Byte contentId, Byte userId);
}

