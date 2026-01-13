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
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {
    @NotBlank
    private String secret;

    @Min(1) // 액세스 토큰 만료 (분)
    private int accessExpiryMinutes = 30;

    @Min(1) // 리프레시 토큰 만료 (일)
    private int refreshExpiryDays = 30;
}