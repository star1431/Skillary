package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.ContentLike;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContentLikeRepository extends JpaRepository<ContentLike, Byte> {

	/** 콘텐츠id and 유저id - like 존재 여부 */
	boolean existsByContent_ContentIdAndUser_UserId(Byte contentId, Byte userId);
	
	/** 콘텐츠id and 유저id - like 삭제 */
	void deleteByContent_ContentIdAndUser_UserId(Byte contentId, Byte userId);
}

