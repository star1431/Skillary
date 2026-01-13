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

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "email_verifications")
public class EmailVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, length = 6)
    private String code;

    @Column(nullable = false)
    private LocalDateTime expiresAt; // 인증 코드 만료 시간

    @CreationTimestamp
    private LocalDateTime createdAt; // 인증 코드 생성 시간

    public EmailVerification(String email, String code, LocalDateTime expiresAt) {
        this.email = email; // 이메일
        this.code = code; // 인증 코드
        this.expiresAt = expiresAt; // 인증 코드 만료 시간
    }
}