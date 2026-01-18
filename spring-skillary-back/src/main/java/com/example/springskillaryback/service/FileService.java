package com.example.springskillaryback.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface FileService {
	boolean deleteFile(String fileUrl);
	
	String uploadFile(MultipartFile file, String subDir) throws IOException;
	
	/** S3 URL인지 확인 */
	boolean isS3Url(String url);
}

