package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.CategoryEnum;

/**
 * 추천 크리에이터 응답 DTO
 * - 루트 페이지의 '추천 크리에이터' 섹션용
 * - 구독자 수 순으로 정렬
 */
public record RecommendedCreatorResponse(
        Byte creatorId,
        String displayName,
        String introduction,
        CategoryEnum category,
        String profile,
        Byte followCount,
        long contentCount,
        boolean isDeleted
) {}
