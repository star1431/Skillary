package com.example.springskillaryback.common.dto;

import jakarta.validation.constraints.Size;

public record CreateCreatorRequest(
        // 선택: null 허용 (프론트에서 빈 값이면 null로 내려와도 OK)
        @Size(max = 500)
        String introduction,

        String profile,        // 선택
        String bankName,       // 선택
        String accountNumber   // 선택
) {}