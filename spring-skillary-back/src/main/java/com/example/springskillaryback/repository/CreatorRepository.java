package com.example.springskillaryback.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.example.springskillaryback.domain.Creator;
import com.example.springskillaryback.domain.User;

import java.util.List;
import java.util.Optional;

public interface CreatorRepository extends JpaRepository<Creator, Byte> {
	Optional<Creator> findByUser(User user);
	
	/** 여러 User ID로 Creator 조회 */
	List<Creator> findByUser_UserIdIn(List<Byte> userIds);

    boolean existsByUser_UserId(Byte userUserId);

    Optional<Creator> findByUser_UserId(Byte userId);

    /** 크리에이터 전체 목록(생성일 내림차순) */
    @Query("SELECT c FROM Creator c ORDER BY c.createdAt DESC")
    List<Creator> findAllByOrderByCreatedAtDesc();

    /** 추천 크리에이터 목록(구독자 수 내림차순) */
    @Query("SELECT c FROM Creator c WHERE c.isDeleted = false ORDER BY c.followCount DESC")
    List<Creator> findRecommendedCreators();
}