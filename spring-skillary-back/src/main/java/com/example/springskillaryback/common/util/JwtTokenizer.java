package com.example.springskillaryback.common.util;

// import com.example.springskillaryback.config.JwtProperties;
// import io.jsonwebtoken.Claims;
// import io.jsonwebtoken.ExpiredJwtException;
// import io.jsonwebtoken.Jwts;
// import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

// import javax.crypto.SecretKey;
// import java.nio.charset.StandardCharsets;
// import java.time.Instant;
// import java.time.temporal.ChronoUnit;
// import java.util.Date;

// @Component
// public class JwtTokenizer {

// private final JwtProperties properties;
// private final SecretKey secretKey;

// public JwtTokenizer(JwtProperties properties) {
//     this.properties = properties;
//     // HMAC-SHA 알고리즘용 SecretKey 객체 생성
//     this.secretKey = Keys.hmacShaKeyFor(properties.getSecret().getBytes(StandardCharsets.UTF_8));
// }

// public String createAccessToken(String subject) {
//     // 토큰 생성 시점 시간
//     Instant now = Instant.now();
//     // 토큰 만료 시간 설정
//     Instant expiresAt = now.plus(properties.getAccessExpiryMinutes(), ChronoUnit.MINUTES);
//     return Jwts.builder()
//             .subject(subject)
//             .issuedAt(Date.from(now))
//             .expiration(Date.from(expiresAt))
//             // 서명 생성
//             .signWith(secretKey)
//             .compact();
// }

// public String createRefreshToken(String subject) {
//     Instant now = Instant.now();
//     // 리프레시 토큰 만료 시간 설정
//     Instant expiresAt = now.plus(properties.getRefreshExpiryDays(), ChronoUnit.DAYS);
//     return Jwts.builder()
//             .subject(subject)
//             .issuedAt(Date.from(now))
//             .expiration(Date.from(expiresAt))
//             // 서명 생성
//             .signWith(secretKey)
//             .compact();
// }

// public Claims parseClaims(String token, boolean allowExpired) {
//     try {
//         return Jwts.parser()
//                 .verifyWith(secretKey)
//                 .build()
//                 .parseSignedClaims(token)
//                 .getPayload();
//     } catch (ExpiredJwtException exception) {
//         if (allowExpired) {
//             return exception.getClaims();
//         }
//         throw exception;
//     }
// }
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