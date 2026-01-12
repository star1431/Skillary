package com.example.springskillaryback.common.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record EmailVerificationConfirmRequest(
        @NotBlank
        @Email
        String email,
        @NotBlank
        @Pattern(regexp = "\\\\d{6}", message = "verification code must be 6 digits")
        String code
) {
}
