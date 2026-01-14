package com.example.springskillaryback.controller;

import com.example.springskillaryback.common.dto.DuplicateCheckResponse;
import com.example.springskillaryback.common.dto.EmailVerificationConfirmRequest;
import com.example.springskillaryback.common.dto.EmailVerificationRequest;
import com.example.springskillaryback.common.dto.LoginRequest;
import com.example.springskillaryback.common.dto.RegisterRequest;
import com.example.springskillaryback.common.util.CookieUtil;
import com.example.springskillaryback.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final CookieUtil cookieUtil;

    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest request) { // 회원 가입
        try {
            authService.register(request.email(), request.password(), request.nickname()); // 회원 가입 서비스 호출
            return ResponseEntity.status(201).build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().header("X-Error-Message", e.getMessage()).build();
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().header("X-Error-Message", "이미 사용 중인 닉네임입니다").build();
        }
    }

    @GetMapping("/check-nickname")
    public ResponseEntity<DuplicateCheckResponse> checkNickname(@RequestParam("nickname") String nickname) {
        try {
            boolean available = authService.isNicknameAvailable(nickname);
            return ResponseEntity.ok(new DuplicateCheckResponse(available));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().header("X-Error-Message", e.getMessage()).build();
        }
    }

    @PostMapping("/send-confirm")
    public ResponseEntity<Void> sendVerificationCode(@Valid @RequestBody EmailVerificationRequest request) {
        try {
            authService.sendCode(request.email());
            return ResponseEntity.status(201).build(); // 201 상태 코드 반환
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().header("X-Error-Message", e.getMessage()).build();
        } catch (Exception exception) {
            exception.printStackTrace(); // 에러 로깅
            System.err.println("인증코드 발송 실패: " + exception.getMessage());
            return ResponseEntity.internalServerError().build(); // 500 상태 코드 반환
        }
    }

    @PostMapping("/send-code")
    public ResponseEntity<Void> verifyCode(@Valid @RequestBody EmailVerificationConfirmRequest request) {
        try {
            boolean verified = authService.verifyCode(request.email(), request.code());
            if (!verified) {
                System.err.println("인증코드 불일치: email=" + request.email() + ", code=" + request.code());
                return ResponseEntity.badRequest().build();// 400 상태 코드 반환
            }
            System.out.println("인증코드 확인 성공: email=" + request.email());
            return ResponseEntity.status(201).build(); // 201 상태 코드 반환
        } catch (Exception exception) {
            exception.printStackTrace(); // 에러 로깅
            System.err.println("인증코드 확인 실패: " + exception.getMessage());
            return ResponseEntity.internalServerError().build(); // 500 상태 코드 반환
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Void> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        String accessToken = authService.login(request.email(), request.password());
        cookieUtil.addAccessTokenCookie(response, accessToken);

        return ResponseEntity.status(201).build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<Void> refresh(HttpServletRequest request, HttpServletResponse response) {
        String accessToken = cookieUtil.getAccessToken(request);
        try {
            String newAccessToken = authService.refresh(accessToken);
            cookieUtil.addAccessTokenCookie(response, newAccessToken);

            return ResponseEntity.status(201).build();
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
