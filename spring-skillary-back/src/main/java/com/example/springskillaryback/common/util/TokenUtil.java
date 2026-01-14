package com.example.springskillaryback.common.util;

import org.springframework.stereotype.Component;

import com.example.springskillaryback.domain.Creator;
import com.example.springskillaryback.domain.User;
import com.example.springskillaryback.repository.CreatorRepository;
import com.example.springskillaryback.repository.UserRepository;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class TokenUtil {
	private final CookieUtil cookieUtil;
	private final JwtTokenizer jwtTokenizer;
	private final UserRepository userRepository;
	private final CreatorRepository creatorRepository;

	/** AT 토큰에서 userId 추출 */
	public Byte getUserIdFromToken(HttpServletRequest request) {
        // null 반환시 토큰 없음 or 파싱 실패로 컨트롤단에서 별도 401 처리 필요
		String token = cookieUtil.getAccessToken(request);
		if (token == null || token.isBlank()) {
			return null;
		}
		try {
			Claims claims = jwtTokenizer.parseClaims(token);
			return Byte.valueOf(claims.getSubject());
		} catch (Exception e) {
			return null;
		}
	}

	/** AT 토큰에서 creatorId 추출 */
	public Byte getCreatorIdFromToken(HttpServletRequest request) {
        // null 반환시 토큰 없음 or 파싱 실패로 컨트롤단에서 별도 401 처리 필요
		Byte userId = getUserIdFromToken(request);
		if (userId == null) {
			return null;
		}
		try {
			User user = userRepository.findById(userId).orElse(null);
			if (user == null) {
				return null;
			}
			Creator creator = creatorRepository.findByUser(user).orElse(null);
			return creator != null ? creator.getCreatorId() : null;
		} catch (Exception e) {
			return null;
		}
	}
}

