package com.example.springskillaryback.service.impl;

import com.example.springskillaryback.config.EmailVerificationProperties;
import com.example.springskillaryback.domain.EmailVerification;
import com.example.springskillaryback.repository.EmailVerificationRepository;
import com.example.springskillaryback.service.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

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
    private final Clock clock = Clock.systemDefaultZone();

    @Override
    public void sendVerificationCode(String email) {
        String code = generateCode();
        LocalDateTime expiresAt = LocalDateTime.now(clock).plusMinutes(properties.getCodeExpiryMinutes());
        emailVerificationRepository.deleteByEmail(email);
        emailVerificationRepository.save(new EmailVerification(email, code, expiresAt));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setFrom(properties.getFrom());
        message.setSubject(properties.getSubject());
        message.setText("인증 코드: " + code + "\n만료 시간: " + properties.getCodeExpiryMinutes() + "분");
        mailSender.send(message);
    }

    @Override
    public boolean verifyCode(String email, String code) {
        Optional<EmailVerification> entry = emailVerificationRepository.findByEmail(email);
        if (entry.isEmpty()) {
            return false;
        }
        EmailVerification verification = entry.get();
        if (LocalDateTime.now(clock).isAfter(verification.getExpiresAt())) {
            emailVerificationRepository.deleteByEmail(email);
            return false;
        }
        boolean matches = verification.getCode().equals(code);
        if (matches) {
            emailVerificationRepository.deleteByEmail(email);
        }
        return matches;
    }

    private String generateCode() {
        int code = RANDOM.nextInt(CODE_RANGE);
        return String.format("%06d", code);
    }
}
