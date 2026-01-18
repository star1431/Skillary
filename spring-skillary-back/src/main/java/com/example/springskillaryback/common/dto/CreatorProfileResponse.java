package com.example.springskillaryback.common.dto;

public record CreatorProfileResponse(
        Byte creatorId,
        String displayName,
        String introduction,
        String profile,
        Byte followCount
) {}