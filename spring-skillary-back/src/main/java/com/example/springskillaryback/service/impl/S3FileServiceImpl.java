package com.example.springskillaryback.service.impl;

import com.example.springskillaryback.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3FileServiceImpl implements FileService {

	private final S3Client s3Client;
	private final Environment environment;

	@Value("${aws.s3.bucket-name}")
	private String bucketName;

	@Value("${aws.s3.region}")
	private String region;

	@Value("${aws.s3.base-url:}")
	private String baseUrl;

	/** SPRING_PROFILES_ACTIVE 값 */
	private String getActiveProfile() {
		String profile = environment.getProperty("spring.profiles.active");
		return (profile != null && !profile.isEmpty()) ? profile : "dev";
	}

	/** 파일 업로드 */
	@Override
	public String uploadFile(MultipartFile file, String subDir) throws IOException {
		try {
			String fileName = generateFileName(file.getOriginalFilename());
			String profile = getActiveProfile();
			String objectKey = profile + "/" + subDir + "/" + fileName;

			PutObjectRequest putObjectRequest = PutObjectRequest.builder()
				.bucket(bucketName)
				.key(objectKey)
				.contentType(file.getContentType())
				.contentLength(file.getSize())
				.build();

			s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
			return buildFileUrl(objectKey);
		} catch (S3Exception e) {
			throw new IOException("S3 파일 업로드 실패: " + e.getMessage());
		}
	}

	/** 파일 삭제 */
	@Override
	public boolean deleteFile(String fileUrl) {
		if (!isS3Url(fileUrl)) {
			log.warn("[S3FileServiceImpl] S3 URL이 아닌 파일 삭제 시도: {}", fileUrl);
			return false;
		}

		try {
			String objectKey = extractObjectKey(fileUrl);
			DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
				.bucket(bucketName)
				.key(objectKey)
				.build();

			s3Client.deleteObject(deleteObjectRequest);
			log.info("[S3FileServiceImpl] 파일 삭제 성공: objectKey={}", objectKey);
			return true;
		} catch (S3Exception e) {
			log.error("[S3FileServiceImpl] 파일 삭제 실패: {}", e.getMessage(), e);
			return false;
		}
	}

	/** S3 URL인지 확인 */
	@Override
	public boolean isS3Url(String url) {
		return url != null && !url.isEmpty() && (url.contains(".amazonaws.com") || url.contains("s3."));
	}

	/** 파일명 UUID로 생성 */
	private String generateFileName(String originalFileName) {
		String extension = extractExtension(originalFileName);
		return UUID.randomUUID() + extension;
	}

	/** 파일 확장자 추출 */
	private String extractExtension(String fileName) {
		if (fileName == null || !fileName.contains(".")) {
			return "";
		}
		return fileName.substring(fileName.lastIndexOf("."));
	}

	/** 파일 URL 생성 */
	private String buildFileUrl(String objectKey) {
		if (baseUrl != null && !baseUrl.isEmpty()) {
			return baseUrl.endsWith("/") ? baseUrl + objectKey : baseUrl + "/" + objectKey;
		}
		return "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + objectKey;
	}

	/** 파일 URL에서 Object Key(=파일명) 추출 */
	private String extractObjectKey(String fileUrl) {
		String key;
		if (fileUrl.contains(".amazonaws.com/")) {
			int index = fileUrl.indexOf(".amazonaws.com/") + ".amazonaws.com/".length();
			key = fileUrl.substring(index);
		} else {
			key = fileUrl;
		}

		if (!key.startsWith("dev/") && !key.startsWith("prod/")) {
			return getActiveProfile() + "/" + key;
		}
		return key;
	}
}

