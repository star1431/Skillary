package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import java.time.Instant;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Byte> {
    Optional<RefreshToken> findByUserId(Byte userId);

    void deleteByUserId(Byte userId);

    boolean existsByUserIdAndExpiresAtAfter(Byte userId, Instant now);

    void deleteAllByUserId(Byte userId);
}
