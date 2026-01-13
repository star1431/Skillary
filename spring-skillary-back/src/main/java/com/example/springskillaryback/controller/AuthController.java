package com.example.springskillaryback.controller;

import com.example.springskillaryback.common.dto.LoginRequest;
import com.example.springskillaryback.common.util.CookieUtil;
import com.example.springskillaryback.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final CookieUtil cookieUtil;

    @PostMapping("/login")
    public ResponseEntity<Void> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        String accessToken = authService.login(request.email(), request.password());
        cookieUtil.addAccessTokenCookie(response, accessToken);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<Void> refresh(HttpServletRequest request, HttpServletResponse response) {
        String accessToken = cookieUtil.getAccessToken(request);
        try {
            String newAccessToken = authService.refresh(accessToken);
            cookieUtil.addAccessTokenCookie(response, newAccessToken);

            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            cookieUtil.clearAccessTokenCookie(response);

            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        String accessToken = cookieUtil.getAccessToken(request);
        try {
            authService.logout(accessToken);
        } catch (RuntimeException ignored) {
        } finally {
            cookieUtil.clearAccessTokenCookie(response);
        }

        return ResponseEntity.noContent().build();
    }
}