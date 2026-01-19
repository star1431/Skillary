package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.Card;
import com.example.springskillaryback.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CardRepository extends JpaRepository<Card, Byte> {
	boolean existsByBillingKey(String billingKey);

	Optional<Card> findByUserAndIsDefaultTrue(User user);

	Page<Card> findAllByUser(User user, Pageable pageable);

	@Modifying
	@Query("UPDATE Card c SET c.isDefault = false WHERE c.user.userId = :userId")
	void resetDefaultStatus(
			@Param("userId") String userId);
}
