package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.CategoryEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 프로필 수정(유저+크리에이터 동시 수정) 요청 DTO
 *
 * 규칙:
 * - nickname: 필수 (user.nickname / creator.displayName 동기화)
 * - profile: 선택 (null이면 변경 안 함, 빈 문자열이면 제거(null 저장) - UserServiceImpl 정책과 동일)
 * - introduction/bankName/accountNumber: 선택 (null/빈 문자열 허용, 빈 문자열은 null로 정규화해서 저장)
 */
public record UpdateCreatorRequest(
        @NotBlank(message = "닉네임은 필수입니다")
        @Size(min = 4, max = 12, message = "닉네임은 4~12자여야 합니다")
        @Pattern(
                regexp = "^[가-힣a-zA-Z0-9_]+$",
                message = "닉네임은 한글/영문/숫자/밑줄(_)만 사용할 수 있습니다"
        )
        String nickname,

        String profile,

        CategoryEnum category,

        @Size(max = 500, message = "소개는 500자 이하여야 합니다")
        String introduction,

        String bankName,
        
        String accountNumber
) {}
