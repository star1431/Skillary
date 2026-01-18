package com.example.springskillaryback.repository;

import org.springframework.data.jpa.repository.JpaRepository;
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

}