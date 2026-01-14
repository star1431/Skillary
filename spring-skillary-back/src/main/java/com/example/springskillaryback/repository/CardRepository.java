package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.Card;
import com.example.springskillaryback.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CardRepository extends JpaRepository<Card, Byte> {
	Optional<Card> findByAuthKey(String authKey);
	Optional<Card> findByUserAndIsDefaultTrue(User user);
}
