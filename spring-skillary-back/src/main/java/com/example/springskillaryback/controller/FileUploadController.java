package com.example.springskillaryback.controller;

import com.example.springskillaryback.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j // s3 외부서비스 관련 로그로 확인 중
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileUploadController {

	private final FileService fileService;

	/** 이미지 업로드 */
	@PostMapping("/image")
	public ResponseEntity<String> uploadImage(
		@RequestParam("file") MultipartFile file,
		@RequestParam(value = "contentId", required = false) Byte contentId
	) {
		return uploadFile(file, contentId, "images", "이미지");
	}

	/** 영상 업로드 */
	@PostMapping("/video")
	public ResponseEntity<String> uploadVideo(
		@RequestParam("file") MultipartFile file,
		@RequestParam(value = "contentId", required = false) Byte contentId
	) {
		return uploadFile(file, contentId, "videos", "영상");
	}

	private ResponseEntity<String> uploadFile(MultipartFile file, Byte contentId, String subDir, String fileType) {
		if (file.isEmpty()) {
			return ResponseEntity.badRequest().body(fileType + " 파일 없음");
		}

		try {
			String fileUrl = fileService.uploadFile(file, subDir, contentId);
			log.info("[FileUploadController] {} 업로드 성공: contentId={}, url={}", fileType, contentId, fileUrl);
			return ResponseEntity.ok(fileUrl);
		} catch (IOException e) {
			log.error("[FileUploadController] {} 업로드 실패: {}", fileType, e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(fileType + " 업로드 실패");
		}
	}
}

