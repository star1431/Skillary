package com.example.springskillaryback.service.impl;

import com.example.springskillaryback.common.dto.ContentRequestDto;
import com.example.springskillaryback.common.dto.ContentResponseDto;
import com.example.springskillaryback.domain.Content;
import com.example.springskillaryback.domain.Creator;
import com.example.springskillaryback.domain.Post;
import com.example.springskillaryback.domain.PostFile;
import com.example.springskillaryback.domain.SubscriptionPlan;
import com.example.springskillaryback.repository.ContentRepository;
import com.example.springskillaryback.repository.CreatorRepository;
import com.example.springskillaryback.repository.SubscriptionPlanRepository;
import com.example.springskillaryback.service.ContentService;
import com.example.springskillaryback.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ContentServiceImpl implements ContentService {
	private final ContentRepository contentRepository;
	private final CreatorRepository creatorRepository;
	private final SubscriptionPlanRepository subscriptionPlanRepository;
	private final FileService fileService;

	/** 콘텐츠 생성 */
	@Override
	public ContentResponseDto createContent(ContentRequestDto requestDto, Byte creatorId) {
		Creator creator = creatorRepository.findById(creatorId)
			.orElseThrow(() -> new IllegalArgumentException("크리에이터 없음"));

		SubscriptionPlan plan = null;
		if (requestDto.planId() != null) {
			plan = subscriptionPlanRepository.findById(requestDto.planId())
				.orElseThrow(() -> new IllegalArgumentException("플랜 없음"));
		}

		Content content = Content.builder()
			.title(requestDto.title())
			.category(requestDto.category())
			.creator(creator)
			.plan(plan)
			.thumbnailUrl(requestDto.thumbnailUrl())
			.build();

		Content savedContent = contentRepository.save(content);

		Post post = Post.builder()
			.body(requestDto.body())
			.creator(creator)
			.content(savedContent)
			.build();

		createPostFiles(post, requestDto.postFiles());
		savedContent.setPost(post);

		return ContentResponseDto.from(savedContent);
	}

	/** 콘텐츠 수정 */
	@Override
	public ContentResponseDto updateContent(Byte contentId, ContentRequestDto requestDto, Byte creatorId) {
		Content content = contentRepository.findById(contentId)
			.orElseThrow(() -> new IllegalArgumentException("콘텐츠 없음"));

		if (!content.getCreator().getCreatorId().equals(creatorId)) {
			throw new IllegalArgumentException("권한 없음");
		}

		SubscriptionPlan plan = null;
		if (requestDto.planId() != null) {
			plan = subscriptionPlanRepository.findById(requestDto.planId())
				.orElseThrow(() -> new IllegalArgumentException("플랜 없음"));
		}

		content.setTitle(requestDto.title());
		content.setCategory(requestDto.category());
		content.setPlan(plan);
		content.setThumbnailUrl(requestDto.thumbnailUrl());

		if (content.getPost() != null) {
			Post post = content.getPost();
			post.setBody(requestDto.body());
			post.getFileList().clear();
			createPostFiles(post, requestDto.postFiles());
		}

		Content savedContent = contentRepository.save(content);
		return ContentResponseDto.from(savedContent);
	}

	/** 콘텐츠 목록 조회 */
	@Override
	@Transactional(readOnly = true)
	public Slice<ContentResponseDto> getContents(int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
		Slice<Content> contents = contentRepository.findAllWithRelations(pageable);
		return contents.map(ContentResponseDto::from);
	}

	/** 콘텐츠 단건 조회 */
	@Override
	@Transactional(readOnly = true)
	public ContentResponseDto getContent(Byte contentId) {
		Content content = contentRepository.findById(contentId)
			.orElseThrow(() -> new IllegalArgumentException("콘텐츠 없음"));
		return ContentResponseDto.from(content);
	}

	/** 콘텐츠 삭제 */
	@Override
	public void deleteContent(Byte contentId, Byte creatorId) {
		Content content = contentRepository.findById(contentId)
			.orElseThrow(() -> new IllegalArgumentException("콘텐츠 없음"));

		if (!content.getCreator().getCreatorId().equals(creatorId)) {
			throw new IllegalArgumentException("권한 없음");
		}

		// 관련 파일 삭제 (S3)
		deleteAssociatedFiles(content);

		// 콘텐츠 삭제
		contentRepository.delete(content);
	}

	/** PostFile 리스트 생성 */
	private void createPostFiles(Post post, List<String> postFiles) {
		if (postFiles != null && !postFiles.isEmpty()) {
			List<PostFile> fileList = new ArrayList<>();
			for (String url : postFiles) {
				fileList.add(PostFile.builder()
					.post(post)
					.url(url)
					.build());
			}
			post.setFileList(fileList);
		}
	}

	/** 콘텐츠와 연관된 파일들 삭제 */
	private void deleteAssociatedFiles(Content content) {
		if (content.getPost() != null) {
			for (PostFile file : content.getPost().getFileList()) {
				if (fileService.isS3Url(file.getUrl())) {
					fileService.deleteFile(file.getUrl());
				}
			}
		}

		if (content.getThumbnailUrl() != null && fileService.isS3Url(content.getThumbnailUrl())) {
			fileService.deleteFile(content.getThumbnailUrl());
		}
	}

}

