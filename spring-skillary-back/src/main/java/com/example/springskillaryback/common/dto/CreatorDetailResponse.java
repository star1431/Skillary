package com.example.springskillaryback.common.dto;

import java.time.LocalDateTime;

// 크리에이터 상세 조회 응답 DTO (creator 단건)
public record CreatorDetailResponse(
        Byte creatorId,
        String displayName,
        String introduction,
        String profile,
        Byte followCount,
        LocalDateTime createdAt,
        boolean isDeleted
) {}

