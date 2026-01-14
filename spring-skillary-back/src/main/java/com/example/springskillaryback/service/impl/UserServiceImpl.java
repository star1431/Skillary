package com.example.springskillaryback.service.impl;

import com.example.springskillaryback.common.dto.MeResponse;
import com.example.springskillaryback.domain.User;
import com.example.springskillaryback.repository.UserRepository;
import com.example.springskillaryback.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    @Override
    @Transactional(readOnly = true)
    public MeResponse me(Byte userId) {
        User user = userRepository.findByIdWithRoles(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        return new MeResponse(user.getUserId(), user.getEmail(), user.getNickname(), user.getRoles());
    }
}
