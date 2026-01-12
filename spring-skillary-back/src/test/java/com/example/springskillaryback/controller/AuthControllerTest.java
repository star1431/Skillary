package com.example.springskillaryback.controller;

import com.example.springskillaryback.service.EmailVerificationService;
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
        EmailVerificationService emailVerificationService() {
            return new EmailVerificationService() {
                @Override
                public void sendVerificationCode(String email) {
                    if ("fail@example.com".equals(email)) {
                        throw new IllegalStateException("mail error");
                    }
                }

                @Override
                public boolean verifyCode(String email, String code) {
                    if ("error@example.com".equals(email)) {
                        throw new IllegalStateException("verification error");
                    }
                    return "123456".equals(code);
                }
            };
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("이메일 인증 코드 전송 요청이 성공하면 202를 반환한다")
    void sendVerificationCodeAccepted() throws Exception {
        mockMvc.perform(post("/api/auth/email/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"test@example.com\"}"))
                .andExpect(status().isAccepted());
    }

    @Test
    @DisplayName("이메일 인증 코드 전송 중 예외가 발생하면 500을 반환한다")
    void sendVerificationCodeFails() throws Exception {
        mockMvc.perform(post("/api/auth/email/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"fail@example.com\"}"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("이메일 인증 코드가 유효하면 200을 반환한다")
    void verifyCodeSuccess() throws Exception {
        mockMvc.perform(post("/api/auth/email/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"test@example.com\",\"code\":\"123456\"}"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("이메일 인증 코드가 유효하지 않으면 400을 반환한다")
    void verifyCodeInvalid() throws Exception {
        mockMvc.perform(post("/api/auth/email/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"test@example.com\",\"code\":\"000000\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("이메일 인증 검증 중 예외가 발생하면 500을 반환한다")
    void verifyCodeFails() throws Exception {
        mockMvc.perform(post("/api/auth/email/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"error@example.com\",\"code\":\"123456\"}"))
                .andExpect(status().isInternalServerError());
    }
}