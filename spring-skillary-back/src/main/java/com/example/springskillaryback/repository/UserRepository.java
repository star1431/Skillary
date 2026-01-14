package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Byte> {
	Optional<User> findByEmail(String email);
}
