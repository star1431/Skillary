package com.example.springskillaryback.service.impl;

import com.example.springskillaryback.common.dto.MeResponse;
import com.example.springskillaryback.domain.User;
import com.example.springskillaryback.repository.UserRepository;
import com.example.springskillaryback.service.FileService;
import com.example.springskillaryback.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final FileService fileService;
    private final Pattern NICKNAME_PATTERN = Pattern.compile("^[가-힣a-zA-Z0-9_]+$");

    @Override
    @Transactional(readOnly = true)
    public MeResponse me(Byte userId) {
        User user = userRepository.findByIdWithRoles(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        return new MeResponse(
                user.getUserId(),
                user.getEmail(),
                user.getNickname(),
                user.getProfile(),
                user.getSubscribedCreatorCount(),
                user.getCreatedAt(),
                user.getRoles()
        );
    }

    @Override
    @Transactional
    public void updateUser(Byte userId, String nickname, String profile) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        // 닉네임 부분 수정
        if (nickname != null) {
            if (!StringUtils.hasText(nickname)) throw new IllegalStateException("닉네임을 입력해주세요");
            String trimmed = nickname.trim();
            if (!trimmed.equals(nickname)) throw new IllegalStateException("닉네임 앞뒤에 공백을 사용할 수 없습니다");
            if (trimmed.length() < 4) throw new IllegalStateException("닉네임은 4자 이상이어야 합니다");
            if (trimmed.length() > 12) throw new IllegalStateException("닉네임은 12자 이하여야 합니다");
            if (!NICKNAME_PATTERN.matcher(trimmed).matches()) {
                throw new IllegalStateException("닉네임은 한글/영문/숫자/밑줄(_)만 사용할 수 있습니다");
            }
            if (!trimmed.equals(user.getNickname()) && userRepository.existsByNickname(trimmed)) {
                throw new IllegalStateException("이미 사용 중인 닉네임입니다");
            }
            user.setNickname(trimmed);
        }

        // 프로필 이미지(URL) 부분 수정
        if (profile != null) {
            String prevProfile = user.getProfile();
            String nextProfile = profile;

            // 공백 문자열이면 제거로 처리
            if (!StringUtils.hasText(nextProfile)) {
                nextProfile = null;
            }

            boolean changed = (prevProfile == null && nextProfile != null)
                    || (prevProfile != null && !prevProfile.equals(nextProfile));

            if (changed) {
                // 이전 프로필이 S3 URL이면 삭제
                if (prevProfile != null && fileService.isS3Url(prevProfile)) {
                    fileService.deleteFile(prevProfile);
                }
                user.setProfile(nextProfile);
            }
        }
    }

    @Override
    public void deleteUser(Byte userId) {
        // TODO: 회원 탈퇴
    }
}
