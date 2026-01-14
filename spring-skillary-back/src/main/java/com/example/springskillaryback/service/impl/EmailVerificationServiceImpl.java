package com.example.springskillaryback.service.impl;

import com.example.springskillaryback.config.EmailVerificationProperties;
import com.example.springskillaryback.domain.EmailVerification;
import com.example.springskillaryback.domain.VerifiedEmail;
import com.example.springskillaryback.repository.EmailVerificationRepository;
import com.example.springskillaryback.repository.VerifiedEmailRepository;
import com.example.springskillaryback.service.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmailVerificationServiceImpl implements EmailVerificationService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int CODE_RANGE = 1_000_000;

    private final JavaMailSender mailSender;
    private final EmailVerificationProperties properties;
    private final EmailVerificationRepository emailVerificationRepository;
    private final VerifiedEmailRepository verifiedEmailRepository;
    private final Clock clock = Clock.systemDefaultZone();

    @Override
    @Transactional
    public void sendVerificationCode(String email) {
        String code = generateCode();
        LocalDateTime expiresAt = LocalDateTime.now(clock).plusMinutes(properties.getCodeExpiryMinutes());
        
        // 기존 데이터 삭제 + flush로 즉시 DB 반영
        Optional<EmailVerification> existing = emailVerificationRepository.findByEmail(email);
        if (existing.isPresent()) {
            emailVerificationRepository.delete(existing.get());
            emailVerificationRepository.flush(); // ⭐ 즉시 DB에 반영
        }
        
        // 새 데이터 저장
        emailVerificationRepository.save(new EmailVerification(email, code, expiresAt));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setFrom(properties.getFrom());
        message.setSubject(properties.getSubject());
        message.setText("인증 코드: " + code + "\n만료 시간: " + properties.getCodeExpiryMinutes() + "분");
        
        System.out.println("✅ 인증코드 발송: email=" + email + ", code=" + code);
        mailSender.send(message);
    }

    @Override
    @Transactional
    public boolean verifyCode(String email, String code) {
        System.out.println("🔍 인증코드 확인 시작: email=" + email + ", 입력코드=" + code);
        
        Optional<EmailVerification> entry = emailVerificationRepository.findByEmail(email);
        if (entry.isEmpty()) {
            System.err.println("❌ DB에 해당 이메일 없음: " + email);
            return false;
        }
        
        EmailVerification verification = entry.get();
        System.out.println("📝 DB 저장된 코드: " + verification.getCode() + ", 만료시간: " + verification.getExpiresAt());
        
        if (LocalDateTime.now(clock).isAfter(verification.getExpiresAt())) {
            System.err.println("❌ 인증코드 만료됨");
            emailVerificationRepository.delete(verification);
            emailVerificationRepository.flush();
            return false;
        }
        
        boolean matches = verification.getCode().equals(code);
        System.out.println("🔍 코드 비교: DB=" + verification.getCode() + ", 입력=" + code + ", 일치=" + matches);
        
        if (matches) {
            System.out.println("✅ 인증 성공! verified_emails에 저장...");
            // verified_emails 테이블에 저장
            Optional<VerifiedEmail> existingVerified = verifiedEmailRepository.findByEmail(email);
            if (existingVerified.isPresent()) {
                verifiedEmailRepository.delete(existingVerified.get());
                verifiedEmailRepository.flush();
            }
            verifiedEmailRepository.save(new VerifiedEmail(email));
            verifiedEmailRepository.flush();
            
            // email_verifications에서 삭제
            emailVerificationRepository.delete(verification);
            emailVerificationRepository.flush();
        }
        return matches;
    }

    private String generateCode() {
        int code = RANDOM.nextInt(CODE_RANGE);
        return String.format("%06d", code);
    }
}
