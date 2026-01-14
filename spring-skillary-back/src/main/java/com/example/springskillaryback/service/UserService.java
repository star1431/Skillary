package com.example.springskillaryback.service;

import com.example.springskillaryback.common.dto.MeResponse;

public interface UserService {
    MeResponse me(Byte userId);
}
