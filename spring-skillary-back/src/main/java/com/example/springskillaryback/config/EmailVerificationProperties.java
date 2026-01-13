package com.example.springskillaryback.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Validated 
@ConfigurationProperties(prefix = "app.mail") 
public class EmailVerificationProperties {
    @NotBlank
    private String from; 

    @NotBlank
    private String subject;

    @Min(1) // 인증 코드 만료 시간 (분)
    private int codeExpiryMinutes = 10;
}