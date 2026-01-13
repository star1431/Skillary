package com.example.springskillaryback.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

// import java.time.LocalDateTime;

// @Entity
// @Getter
// @NoArgsConstructor
// @Table(name = "refresh_tokens")
// public class RefreshToken {
//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     @Column(nullable = false, unique = true)
//     private String token;

//     @Column(nullable = false)
//     private Byte userId;

//     @Column(nullable = false)
//     private LocalDateTime expiresAt; // 리프레시 토큰 만료 시간

//     @CreationTimestamp
//     private LocalDateTime createdAt; // 리프레시 토큰 생성 시간

//     public RefreshToken(String token, Byte userId, LocalDateTime expiresAt) {
//         this.token = token;
//         this.userId = userId;
//         this.expiresAt = expiresAt; // 리프레시 토큰 만료 시간
//     }
// }
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
