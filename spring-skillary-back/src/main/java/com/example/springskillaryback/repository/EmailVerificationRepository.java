package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    Optional<EmailVerification> findByEmail(String email);

    @Modifying
    @Transactional
    void deleteByEmail(String email);

    //만료된 인증 코드 조회
    @Query(value = "SELECT * FROM email_verifications WHERE created_at < :thresholdTime", nativeQuery = true) 
    List<EmailVerification> findByCreatedAtBefore(@Param("thresholdTime") LocalDateTime thresholdTime); 
    //createdAt이 현재 시각 기준 10분 이전인 이메일 인증 코드를 조회

    //만료된 인증 코드 삭제
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM email_verifications WHERE created_at < :thresholdTime", nativeQuery = true)
    void deleteByCreatedAtBefore(@Param("thresholdTime") LocalDateTime thresholdTime); 
    //createdAt이 현재 시각 기준 10분 이전인 이메일 인증 코드를 삭제
}