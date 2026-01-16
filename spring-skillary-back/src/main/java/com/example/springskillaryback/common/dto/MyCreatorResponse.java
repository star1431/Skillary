package com.example.springskillaryback.common.dto;

import java.time.LocalDateTime;

public record MyCreatorResponse(
        Byte creatorId,
        String profile,
        String nickname,
        String introduction,
        long contentCount,
        Byte followCount,
        String bankName,
        String accountNumber,
        LocalDateTime createdAt,
        boolean isDeleted
) {}