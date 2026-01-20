package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.CategoryEnum;

import java.time.LocalDateTime;

public record MyCreatorResponse(
        Byte creatorId,
        String profile,
        String nickname,
        String introduction,
        long contentCount,
        CategoryEnum category,
        Byte followCount,
        String bankName,
        String accountNumber,
        LocalDateTime createdAt,
        boolean isDeleted
) {}