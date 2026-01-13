package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Byte> {
    boolean existsByUserIdAndExpiresAtAfter(Byte userId, Instant now);

    void deleteAllByUserId(Byte userId);
}
