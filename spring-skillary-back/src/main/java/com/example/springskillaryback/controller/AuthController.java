package com.example.springskillaryback.controller;

// import com.example.springskillaryback.common.dto.EmailVerificationConfirmRequest;
// import com.example.springskillaryback.common.dto.EmailVerificationRequest;
// import com.example.springskillaryback.common.dto.RegisterRequest;
// import com.example.springskillaryback.common.dto.TokensDto;
// import com.example.springskillaryback.config.JwtProperties;
// import com.example.springskillaryback.service.AuthService;
// import jakarta.validation.Valid;
// import lombok.RequiredArgsConstructor;
// import org.springframework.http.ResponseEntity;
// import org.springframework.http.ResponseCookie;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.CookieValue;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;

// @RestController
// @RequestMapping("/api/auth")
// @RequiredArgsConstructor
// public class AuthController {
//     private static final String ACCESS_TOKEN_COOKIE = "access_token";
//     private final AuthService authService;
//     private final JwtProperties jwtProperties;

//     @PostMapping("/register")
//     public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest request) { // 회원 가입
//         try {
//             TokensDto tokens = authService.register(request.email(), request.password(), request.nickname()); // 회원 가입 서비스 호출
//             return ResponseEntity.status(201) // 201 Created 상태 코드 반환
//                     .header("Set-Cookie", buildAccessCookie(tokens.accessToken()).toString()) // 액세스 토큰 쿠키 설정
//                     .build();
//         } catch (Exception exception) {
//             return ResponseEntity.internalServerError().build(); // 500 Internal Server Error 상태 코드 반환
//         }
//     }

//     @PostMapping("/send-confirm")
//     public ResponseEntity<Void> sendVerificationCode(@Valid @RequestBody EmailVerificationRequest request) {
//         try {
//             authService.sendCode(request.email());
//             return ResponseEntity.status(201).build(); // 201 상태 코드 반환
//         } catch (Exception exception) {
//             exception.printStackTrace(); // 에러 로깅
//             System.err.println("❌ 인증코드 발송 실패: " + exception.getMessage());
//             return ResponseEntity.internalServerError().build(); // 500 상태 코드 반환
//         }
//     }

//     @PostMapping("/send-code")
//     public ResponseEntity<Void> verifyCode(@Valid @RequestBody EmailVerificationConfirmRequest request) {
//         try {
//             boolean verified = authService.verifyCode(request.email(), request.code());
//             if (!verified) {
//                 System.err.println("❌ 인증코드 불일치: email=" + request.email() + ", code=" + request.code());
//                 return ResponseEntity.badRequest().build();// 400 상태 코드 반환
//             }
//             System.out.println("✅ 인증코드 확인 성공: email=" + request.email());
//             return ResponseEntity.status(201).build(); // 201 상태 코드 반환
//         } catch (Exception exception) {
//             exception.printStackTrace(); // 에러 로깅
//             System.err.println("❌ 인증코드 확인 실패: " + exception.getMessage());
//             return ResponseEntity.internalServerError().build(); // 500 상태 코드 반환
//         }
//     }

//     @PostMapping("/refresh")
//     public ResponseEntity<Void> refresh(@CookieValue(name = ACCESS_TOKEN_COOKIE, required = false) String accessToken) {
//         if (accessToken == null || accessToken.isBlank()) {
//             return ResponseEntity.badRequest().build(); // 400 상태 코드 반환
//         }
//         try {
//             String newAccessToken = authService.refresh(accessToken);
//             return ResponseEntity.status(201)
//                     .header("Set-Cookie", buildAccessCookie(newAccessToken).toString())
//                     .build();
//         } catch (Exception exception) {
//             return ResponseEntity.internalServerError().build(); // 500 상태 코드 반환
//         }
//     }

//     private ResponseCookie buildAccessCookie(String token) {
//         return ResponseCookie.from(ACCESS_TOKEN_COOKIE, token) // 액세스 토큰 쿠키 설정
//                 .httpOnly(true)
//                 .path("/")
//                 .maxAge(jwtProperties.getAccessExpiryMinutes() * 60L) // 액세스 토큰 만료 시간 설정
//                 .sameSite("Lax") 
//                 .build();
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