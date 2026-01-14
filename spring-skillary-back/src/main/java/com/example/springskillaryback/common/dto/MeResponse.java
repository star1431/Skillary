package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.Role;

import java.util.Set;

public record MeResponse (
        Byte userId,
        String email,
        String nickname,
        Set<Role> roles
){}
