package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.VerifiedEmail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VerifiedEmailRepository extends JpaRepository<VerifiedEmail, Long> {
    Optional<VerifiedEmail> findByEmail(String email);

    void deleteByEmail(String email);
}