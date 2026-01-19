package com.example.springskillaryback.config;

import com.example.springskillaryback.common.util.TossPaymentsClient;
import com.example.springskillaryback.config.properties.TossPaymentsProperty;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;


@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(TossPaymentsProperty.class)
public class TossPaymentsConfig {
	private final TossPaymentsProperty tossPaymentsProperty;

	@Bean
	public TossPaymentsClient tossPaymentsClient(
			RestTemplate restTemplate
	) {
		return new TossPaymentsClient(
				restTemplate,
				tossPaymentsProperty.getSecretKey()
		);
	}

}