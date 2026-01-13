package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.Post;
import com.example.springskillaryback.domain.PostFile;

import java.util.List;

public record PostResponseDto(
		Byte postId,
		String body,
		List<String> postFiles,
		List<CommentResponseDto> comments
) {
	public static PostResponseDto from(Post post) {
		// PostFile 리스트를 URL 리스트로 변환
		List<String> postFiles = post.getFileList() != null
			? post.getFileList().stream()
				.map(PostFile::getUrl)
				.toList()
			: List.of();

		return new PostResponseDto(
			post.getPostId(),
			post.getBody(),
			postFiles,
			post.getComments() != null ? post.getComments().stream()
				.map(CommentResponseDto::from)
				.toList() : List.of()
		);
	}
}

