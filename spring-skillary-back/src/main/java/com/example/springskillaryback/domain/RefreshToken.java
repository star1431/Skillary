package com.example.springskillaryback.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Byte id;

    @Column(name = "user_id", nullable = false)
    private Byte userId;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Builder
    private RefreshToken(Byte userId, String token, Instant expiresAt) {
        this.userId = userId;
        this.token = token;
        this.expiresAt = expiresAt;
    }
}
