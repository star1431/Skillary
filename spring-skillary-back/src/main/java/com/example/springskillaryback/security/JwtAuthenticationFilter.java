package com.example.springskillaryback.security;

import com.example.springskillaryback.common.util.CookieUtil;
import com.example.springskillaryback.common.util.JwtTokenizer;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final CookieUtil cookieUtil;
    private final JwtTokenizer jwtTokenizer;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return request.getRequestURI().startsWith("/api/auth/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws IOException, ServletException {
        String token = cookieUtil.getAccessToken(request);
        if (token == null || token.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            Claims claims = jwtTokenizer.parseClaims(token);
            String userId = claims.getSubject();

            var auth = new UsernamePasswordAuthenticationToken( // TODO: JWTAuthentication 수정 (시간 나면)
                    userId, null, Set.of(new SimpleGrantedAuthority("ROLE_USER"))
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
//            log.info("JWT 인증 성공 uri={}, userId={}", request.getRequestURI(), userId);

        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) {
            // 401 처리
            SecurityContextHolder.clearContext();
//            log.warn("JWT 인증 실패 uri={}, msg={}, token(head)={}",
//                    request.getRequestURI(),
//                    e.getMessage(),
//                    token.length() > 15 ? token.substring(0, 15) : token
//            );
        }

        filterChain.doFilter(request, response);
    }
}
