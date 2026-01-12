package com.example.springskillaryback.controller;

import com.example.springskillaryback.common.dto.TokensDto;
import com.example.springskillaryback.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @TestConfiguration
    static class TestEmailVerificationConfig {
        @Bean
        AuthService authService() {
            return new AuthService() {
                @Override
                public TokensDto register(String email, String password, String nickname) {
                    return new TokensDto("refresh-token", "access-token"); // 리프레시 토큰, 액세스 토큰 반환
                }

                    @Override
                    public TokensDto login(String email, String password) {
                        return new TokensDto("refresh-token", "access-token"); // 리프레시 토큰, 액세스 토큰 반환
                    }

                        @Override
                        public void sendCode(String email) {
                            if ("fail@example.com".equals(email)) {
                                throw new IllegalStateException("mail error"); // 메일 오류 발생
                            }
                        }

                            @Override
                            public boolean verifyCode(String email, String code) {
                                if ("error@example.com".equals(email)) {
                                    throw new IllegalStateException("verification error"); // 인증 오류 발생
                                }
                                return "123456".equals(code); // 인증 코드 일치 여부 반환
                            }


                                @Override
                                public void logout(String refreshToken) {
                                }

                                    @Override
                                    public boolean withdrawal(String refreshToken) {
                                        return false; // 회원 탈퇴 여부 반환
                                    }


                                @Override
                                public String refresh(String accessToken) {
                                    return "access-token"; // 액세스 토큰 반환
                                }
                            };
                        }
                    }

                    @Autowired
                    private MockMvc mockMvc;

                    @Test
                    @DisplayName("이메일 인증 코드 전송 요청이 성공하면 201을 반환한다")
                    void sendVerificationCodeAccepted() throws Exception {
                        mockMvc.perform(post("/api/auth/send-confirm")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content("{\"email\":\"test@example.com\"}")) // 이메일 인증 코드 전송 요청
                                .andExpect(status().isCreated());
                    }

                    @Test
                    @DisplayName("이메일 인증 코드 전송 중 예외가 발생하면 500을 반환한다")
                    void sendVerificationCodeFails() throws Exception {
                        mockMvc.perform(post("/api/auth/send-confirm")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content("{\"email\":\"fail@example.com\"}")) // 이메일 인증 코드 전송 오류 발생
                                .andExpect(status().isInternalServerError());
                    }

                    @Test
                    @DisplayName("이메일 인증 코드가 유효하면 201을 반환한다")
                    void verifyCodeSuccess() throws Exception {
                        mockMvc.perform(post("/api/auth/send-code")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content("{\"email\":\"test@example.com\",\"code\":\"123456\"}")) // 이메일 인증 코드 유효 여부 반환
                                .andExpect(status().isCreated());
                    }

                    @Test
                    @DisplayName("이메일 인증 코드가 유효하지 않으면 400을 반환한다")
                    void verifyCodeInvalid() throws Exception {
                        mockMvc.perform(post("/api/auth/send-code")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content("{\"email\":\"test@example.com\",\"code\":\"000000\"}")) // 이메일 인증 코드 유효하지 않은 경우
                                .andExpect(status().isBadRequest());
                    }

                    @Test
                    @DisplayName("이메일 인증 검증 중 예외가 발생하면 500을 반환한다")
                    void verifyCodeFails() throws Exception {
                        mockMvc.perform(post("/api/auth/send-code")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content("{\"email\":\"error@example.com\",\"code\":\"123456\"}")) // 이메일 인증 코드 검증 오류 발생
                                .andExpect(status().isInternalServerError());
                    }
                }