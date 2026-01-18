package com.example.springskillaryback.common.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Slf4j
@Configuration
public class S3Util {

	@Value("${aws.access-key-id:}")
	private String accessKeyId;

	@Value("${aws.secret-access-key:}")
	private String secretAccessKey;

	@Value("${aws.s3.region:ap-northeast-2}")
	private String region;

	@Bean
	public S3Client s3Client() {
		// Access Key가 제공되면 사용
		if (hasCredentials()) {
			// Access Key 자격 증명 생성
			AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);
			
			S3Client client = S3Client.builder()
				.region(Region.of(region))
				.credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
				.build();
			log.info("[S3Config] S3Client 초기화 완료 (Access Key 사용)");
			return client;
		} else {
			// 기본 자격 증명 공급자 사용
			S3Client client = S3Client.builder()
				.region(Region.of(region))
				.credentialsProvider(DefaultCredentialsProvider.create())
				.build();
                log.info("[S3Config] S3Client 초기화 완료 (기본 공급자 사용)");
			return client;
		}
	}
    /** 자격 증명 확인 */
	private boolean hasCredentials() {
		return accessKeyId != null && !accessKeyId.isEmpty() &&
			secretAccessKey != null && !secretAccessKey.isEmpty();
	}
}

