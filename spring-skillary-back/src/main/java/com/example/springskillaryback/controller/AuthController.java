package com.example.springskillaryback.controller;

import com.example.springskillaryback.common.dto.EmailVerificationConfirmRequest;
import com.example.springskillaryback.common.dto.EmailVerificationRequest;
import com.example.springskillaryback.common.dto.RegisterRequest;
import com.example.springskillaryback.common.dto.TokensDto;
import com.example.springskillaryback.config.JwtProperties;
import com.example.springskillaryback.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private static final String ACCESS_TOKEN_COOKIE = "access_token";
    private final AuthService authService;
    private final JwtProperties jwtProperties;

    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest request) {
        try {
            TokensDto tokens = authService.register(request.email(), request.password(), request.nickname());
            return ResponseEntity.status(201)
                    .header("Set-Cookie", buildAccessCookie(tokens.accessToken()).toString())
                    .build();
        } catch (Exception exception) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/send-confirm")
    public ResponseEntity<Void> sendVerificationCode(@Valid @RequestBody EmailVerificationRequest request) {
        try {
            authService.sendCode(request.email());
            return ResponseEntity.status(201).build();
        } catch (Exception exception) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/send-code")
    public ResponseEntity<Void> verifyCode(@Valid @RequestBody EmailVerificationConfirmRequest request) {
        try {
            boolean verified = authService.verifyCode(request.email(), request.code());
            if (!verified) {
                return ResponseEntity.badRequest().build();
            }
            return ResponseEntity.status(201).build();
        } catch (Exception exception) {
            return ResponseEntity.internalServerError().build();
        }

}

@PostMapping("/refresh")
public ResponseEntity<Void> refresh(@CookieValue(name = ACCESS_TOKEN_COOKIE, required = false) String accessToken) {
    if (accessToken == null || accessToken.isBlank()) {
        return ResponseEntity.badRequest().build();
    }
    try {
        String newAccessToken = authService.refresh(accessToken);
        return ResponseEntity.status(201)
                .header("Set-Cookie", buildAccessCookie(newAccessToken).toString())
                .build();
    } catch (Exception exception) {
        return ResponseEntity.internalServerError().build();
    }
}

private ResponseCookie buildAccessCookie(String token) {
    return ResponseCookie.from(ACCESS_TOKEN_COOKIE, token)
            .httpOnly(true)
            .path("/")
            .maxAge(jwtProperties.getAccessExpiryMinutes() * 60L)
            .sameSite("Lax")
            .build();
}
}