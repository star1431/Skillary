package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.Role;

import java.time.LocalDateTime;
import java.util.Set;

public record MeResponse (
        Byte userId,
        String email,
        String nickname,
        String profile,
        Byte subscribedCreatorCount,
        LocalDateTime createdAt,
        Set<Role> roles
){}
