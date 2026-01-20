package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.CategoryEnum;

// 크리에이터 프로필 조회 응답 DTO (creator 단건)
public record CreatorProfileResponse(
        Byte creatorId,
        String displayName,
        String introduction,
        CategoryEnum category,
        String profile,
        Byte followCount,
        boolean isDeleted
) {}