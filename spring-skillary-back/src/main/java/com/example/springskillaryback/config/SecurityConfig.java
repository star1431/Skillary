package com.example.springskillaryback.config;

import com.example.springskillaryback.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) {
		return http
//                .securityMatcher("/api/**")
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .anyRequest().authenticated()
                )
                .cors(cors -> cors.configurationSource(configurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
				.formLogin(AbstractHttpConfigurer::disable)
				.httpBasic(AbstractHttpConfigurer::disable)
                .addFilterBefore(jwtAuthenticationFilter,
                        org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class)
				.build();
	}

    @Bean
    public CorsConfigurationSource configurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowCredentials(true);
        // 허용 도메인
        configuration.setAllowedOriginPatterns(List.of(
//                "http://localhost:3000",
//                "http://localhost:8080",
//                "http://127.0.0.1:3000"
        ));

        // 허용 HTTP 메서드
        configuration.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE"
        ));

        // 허용 헤더
        configuration.setAllowedHeaders(List.of(
                "Authorization", "Content-Type"
        ));

        // 노출 헤더
        configuration.setExposedHeaders(List.of(
                "Authorization", "Set-Cookie"
        ));

        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

}