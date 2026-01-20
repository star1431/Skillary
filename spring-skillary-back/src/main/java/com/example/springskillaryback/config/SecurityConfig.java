package com.example.springskillaryback.config;

import org.springframework.beans.factory.annotation.Value;
import com.example.springskillaryback.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
	@Value("${CORS_ALLOWED_ORIGINS}")
	private List<String> allowedOrigins;
  
  private final JwtAuthenticationFilter jwtAuthenticationFilter;
  
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) {
		// 요청 권한 설정
		return http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/creators/me").authenticated() // creator/me
                        .requestMatchers(HttpMethod.GET, "/api/creators", "/api/creators/*", "/api/creators/recommended").permitAll() // creators, creators/{id}, /creators/recommended
                        .requestMatchers("/error", "/api/auth/register", "/api/auth/login"
                                , "/api/auth/send-confirm", "/api/auth/send-code", "/api/auth/check-nickname"
                                , "/api/auth/refresh", "/api/auth/logout"
                                , "/api/contents/**", "/api/subscriptions/**"
                        ).permitAll()
                        .anyRequest().authenticated()
				)
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.csrf(AbstractHttpConfigurer::disable)
				.formLogin(AbstractHttpConfigurer::disable)
				.httpBasic(AbstractHttpConfigurer::disable)
                .addFilterBefore(jwtAuthenticationFilter,
                        org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class)
                .sessionManagement(sm ->
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .exceptionHandling(eh -> eh
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)) //
                )
				.build();
	}

	// CORS 설정을 위한 Bean 추가
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(List.of("http://localhost:3000")); // 프론트 주소 허용
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(List.of("*"));
		configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);
  
    configuration.setExposedHeaders(List.of("Authorization", "Set-Cookie"));

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
  }
}