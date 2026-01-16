package com.example.springskillaryback.common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateCreatorRequest(
        @NotBlank(message = "닉네임은 필수입니다")
        @Size(min = 4, max = 12, message = "닉네임은 4~12자여야 합니다")
        @Pattern(
                regexp = "^[가-힣a-zA-Z0-9_]+$",
                message = "닉네임은 한글/영문/숫자/밑줄(_)만 사용할 수 있습니다"
        )
        String nickname,
        String profile,
        // 크리에이터 전용(선택)
        @Size(max = 500, message = "소개는 500자 이하여야 합니다")
        String introduction,
        String bankName,
        String accountNumber
) {}
