package com.example.springskillaryback.common.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;


@Component
public class JwtTokenizer {
    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expire-time.access}")
    private Long accessExpireTime;

    @Value("${jwt.expire-time.refresh}")
    private Long refreshExpireTime;

    private SecretKey signingKey;

    @PostConstruct
    public void init() {
        this.signingKey = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    public String createAccessToken(Byte userId, String email) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(accessExpireTime)))
                .signWith(getSigningKey())
                .compact();
    }

    public String createRefreshToken(Byte userId, String email) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(refreshExpireTime)))
                .signWith(getSigningKey())
                .compact();
    }

    public Duration accessTokenMaxAge() {
        return Duration.ofSeconds(accessExpireTime);
    }

    public Instant refreshTokenExpiresAt() {
        return Instant.now().plusSeconds(refreshExpireTime);
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Claims parseClaimsAllowExpired(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            // 만료만 된 경우: 서명 검증은 통과했고, claims는 신뢰 가능
            return e.getClaims();
        } catch (SecurityException | MalformedJwtException e) {
            throw e; // 위조/깨진 토큰
        }
    }



    SecretKey getSigningKey() {
        return signingKey;
    }
}