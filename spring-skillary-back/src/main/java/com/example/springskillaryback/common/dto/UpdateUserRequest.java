package com.example.springskillaryback.common.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Size(min = 4, max = 12, message = "닉네임은 4~12자여야 합니다")
        @Pattern(
                regexp = "^[가-힣a-zA-Z0-9_]+$",
                message = "닉네임은 한글/영문/숫자/밑줄(_)만 사용할 수 있습니다"
        )
        String nickname,
        String profile
) {}
// TODO: 유저랑 크리에이터 같이 처리(UpdateCreatorRequest)