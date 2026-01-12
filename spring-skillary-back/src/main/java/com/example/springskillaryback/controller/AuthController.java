package com.example.springskillaryback.controller;

import com.example.springskillaryback.common.dto.EmailVerificationConfirmRequest;
import com.example.springskillaryback.common.dto.EmailVerificationRequest;
import com.example.springskillaryback.service.EmailVerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/email")
@RequiredArgsConstructor
public class AuthController {
    private final EmailVerificationService emailVerificationService;

    @PostMapping("/send")
    public ResponseEntity<Void> sendVerificationCode(@Valid @RequestBody EmailVerificationRequest request) {
        try {
            emailVerificationService.sendVerificationCode(request.email());
            return ResponseEntity.accepted().build();
        } catch (Exception exception) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<Void> verifyCode(@Valid @RequestBody EmailVerificationConfirmRequest request) {
        try {
            boolean verified = emailVerificationService.verifyCode(request.email(), request.code());
            if (!verified) {
                return ResponseEntity.badRequest().build();
            }
            return ResponseEntity.ok().build();
        } catch (Exception exception) {
            return ResponseEntity.internalServerError().build();
        }
    }
}