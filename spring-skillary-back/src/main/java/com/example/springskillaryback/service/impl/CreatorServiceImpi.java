package com.example.springskillaryback.service.impl;

import com.example.springskillaryback.common.dto.CreateCreatorRequest;
import com.example.springskillaryback.common.dto.MyCreatorResponse;
import com.example.springskillaryback.common.dto.UpdateCreatorRequest;
import com.example.springskillaryback.domain.Creator;
import com.example.springskillaryback.domain.Role;
import com.example.springskillaryback.domain.RoleEnum;
import com.example.springskillaryback.domain.User;
import com.example.springskillaryback.repository.ContentRepository;
import com.example.springskillaryback.repository.CreatorRepository;
import com.example.springskillaryback.repository.RoleRepository;
import com.example.springskillaryback.repository.UserRepository;
import com.example.springskillaryback.service.CreatorService;
import com.example.springskillaryback.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class CreatorServiceImpi implements CreatorService {
    private final CreatorRepository creatorRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ContentRepository contentRepository;
    private final UserService userService;

    @Override
    @Transactional
    public Byte createCreator(Byte userId, CreateCreatorRequest request) {
        User user = userRepository.findByIdWithRoles(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        if (creatorRepository.existsByUser_UserId(userId)) {
            throw new IllegalStateException("이미 크리에이터");
        }

        Role roleCreator = roleRepository.findByRole(RoleEnum.ROLE_CREATOR);
        if (roleCreator == null) throw new IllegalStateException("ROLE_CREATOR 없음");
        user.getRoles().add(roleCreator);

        Creator creator = Creator.builder()
                .displayName(user.getNickname())
                .introduction(request.introduction())
                .profile(request.profile())
                .bankName(request.bankName())
                .accountNumber(request.accountNumber())
                .user(user)
                .build();
        Creator saved = creatorRepository.save(creator);
        return saved.getCreatorId();
    }

    @Override
    @Transactional(readOnly = true)
    public MyCreatorResponse getMyCreator(Byte userId) {
        Creator c = creatorRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("크리에이터가 아닙니다"));

        long contentCount = contentRepository.countByCreator_CreatorId(c.getCreatorId());

        return new MyCreatorResponse(
                c.getCreatorId(),
                c.getProfile(),
                c.getUser() != null ? c.getUser().getNickname() : c.getDisplayName(),
                c.getIntroduction(),
                contentCount,
                c.getFollowCount(),
                c.getBankName(),
                c.getAccountNumber(),
                c.getCreatedAt(),
                c.isDeleted()
        );
    }

    @Override
    @Transactional
    public void updateCreator(Byte userId, UpdateCreatorRequest request) {
        userService.updateUser(userId, request.nickname(), request.profile());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        Creator c = creatorRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("크리에이터가 아닙니다"));

        // 동기화
        c.setDisplayName(user.getNickname());
        c.setProfile(user.getProfile());

        c.setIntroduction(normalizeOptional(request.introduction()));
        c.setBankName(normalizeOptional(request.bankName()));
        c.setAccountNumber(normalizeOptional(request.accountNumber()));
    }

    // 공백 -> null 로
    private String normalizeOptional(String value) {
        if (!StringUtils.hasText(value)) return null;
        return value.trim();
    }
}
