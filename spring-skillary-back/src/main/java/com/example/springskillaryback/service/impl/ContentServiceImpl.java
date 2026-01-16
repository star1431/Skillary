package com.example.springskillaryback.service.impl;

import com.example.springskillaryback.common.dto.ContentLikeResponseDto;
import com.example.springskillaryback.common.dto.ContentListResponseDto;
import com.example.springskillaryback.common.dto.ContentRequestDto;
import com.example.springskillaryback.common.dto.ContentResponseDto;
import com.example.springskillaryback.common.dto.PostResponseDto;
import com.example.springskillaryback.domain.CategoryEnum;
import com.example.springskillaryback.domain.Content;
import com.example.springskillaryback.domain.Creator;
import com.example.springskillaryback.domain.Post;
import com.example.springskillaryback.domain.PostFile;
import com.example.springskillaryback.domain.SubscriptionPlan;
import com.example.springskillaryback.domain.ContentLike;
import com.example.springskillaryback.domain.User;
import com.example.springskillaryback.repository.ContentLikeRepository;
import com.example.springskillaryback.repository.ContentRepository;
import com.example.springskillaryback.repository.CreatorRepository;
import com.example.springskillaryback.repository.SubscriptionPlanRepository;
import com.example.springskillaryback.repository.UserRepository;
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

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ContentServiceImpl implements ContentService {
	private final ContentRepository contentRepository;
	private final CreatorRepository creatorRepository;
	private final SubscriptionPlanRepository subscriptionPlanRepository;
	private final FileService fileService;
	private final ContentLikeRepository contentLikeRepository;
	private final UserRepository userRepository;

	/** 콘텐츠 생성 */
	@Override
	public ContentResponseDto createContent(ContentRequestDto requestDto, Byte userId) {
		Creator creator = creatorRepository.findByUser_UserId(userId)
			.orElseThrow(() -> new IllegalStateException("크리에이터 없음"));

		// 구독, 단건 검증 처리
		contentValid(requestDto.planId(), requestDto.price());

		SubscriptionPlan plan = null;
		if (requestDto.planId() != null) {
			plan = subscriptionPlanRepository.findById(requestDto.planId())
				.orElseThrow(() -> new IllegalArgumentException("플랜 없음"));
		}

		Content content = Content.builder()
			.title(requestDto.title())
			.category(requestDto.category())
            .description(requestDto.description())
			.creator(creator)
			.plan(plan)
			.price(requestDto.price())
			.thumbnailUrl(requestDto.thumbnailUrl())
			.build();

		Content savedContent = contentRepository.save(content);

		Post post = null;
		if (requestDto.post() != null) {
			post = Post.builder()
				.body(requestDto.post().body())
				.creator(creator)
				.content(savedContent)
				.build();

			createPostFiles(post, requestDto.post().postFiles());
			savedContent.setPost(post);
		}

		return toDto(savedContent, false);
	}

	/** 콘텐츠 수정 */
	@Override
	public ContentResponseDto updateContent(Byte contentId, ContentRequestDto requestDto, Byte userId) {
		Content content = contentRepository.findByIdForDetail(contentId)
			.orElseThrow(() -> new IllegalArgumentException("콘텐츠 없음"));

		Creator creator = creatorRepository.findByUser_UserId(userId)
			.orElseThrow(() -> new IllegalStateException("크리에이터 없음"));
		
		if (!content.getCreator().getCreatorId().equals(creator.getCreatorId())) {
			throw new IllegalArgumentException("권한 없음");
		}

		Byte checkPlanId = content.getPlan() != null ? content.getPlan().getPlanId() : null;
		if(requestDto.planId() != null) checkPlanId = requestDto.planId();
		Integer checkPrice = content.getPrice();
		if(requestDto.price() != null) checkPrice = requestDto.price();

		// 구독, 단건 검증 처리
		contentValid(checkPlanId, checkPrice);

		// plan price 관련 요청값 반영
		if (requestDto.planId() != null) {
			SubscriptionPlan plan = subscriptionPlanRepository.findById(requestDto.planId())
				.orElseThrow(() -> new IllegalArgumentException("플랜 없음"));
			content.setPlan(plan);
			content.setPrice(null);
		} else if (requestDto.price() != null) {
			content.setPrice(requestDto.price());
			content.setPlan(null);
		}

        if(requestDto.title() != null) content.setTitle(requestDto.title());
        if(requestDto.description() != null) content.setDescription(requestDto.description());
        if(requestDto.category() != null) content.setCategory(requestDto.category());
        
        // 썸네일 이미지 수정 시
        if(requestDto.thumbnailUrl() != null && !requestDto.thumbnailUrl().equals(content.getThumbnailUrl())) {
            if(fileService.isS3Url(content.getThumbnailUrl())) {
                fileService.deleteFile(content.getThumbnailUrl());
            }
            content.setThumbnailUrl(requestDto.thumbnailUrl());
        }

        // 본문 수정시
		if (requestDto.post() != null) {
			if (content.getPost() != null) {
				Post post = content.getPost();
				post.setBody(requestDto.post().body());
				updatePostFiles(post, requestDto.post().postFiles());
			} else {
				Post post = Post.builder()
					.body(requestDto.post().body())
					.creator(content.getCreator())
					.content(content)
					.build();
				createPostFiles(post, requestDto.post().postFiles());
				content.setPost(post);
			}
		}

		Content savedContent = contentRepository.save(content);
		return toDto(savedContent, false);
	}

	/** 콘텐츠 전체 목록 조회 */
	@Override
	@Transactional(readOnly = true)
	public Slice<ContentListResponseDto> getContents(int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
		Slice<Content> contents = contentRepository.findAllForList(pageable);
		return contents.map(this::toListDto);
	}

	/** 인기 콘텐츠 목록 조회 (라이크 수 기준) */
	@Override
	@Transactional(readOnly = true)
	public Slice<ContentListResponseDto> getPopularContents(int page, int size) {
		Pageable pageable = PageRequest.of(page, size);
		Slice<Content> contents = contentRepository.findPopularForList(pageable);
		return contents.map(this::toListDto);
	}

	/** 크리에이터 기준 목록 조회 */
	@Override
	@Transactional(readOnly = true)
	public Slice<ContentListResponseDto> getContentsByCreator(Byte creatorId, int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
		Slice<Content> contents = contentRepository.findByCreatorIdForList(creatorId, pageable);
		return contents.map(this::toListDto);
	}

	/** 카테고리 기준 목록 조회 */
	@Override
	@Transactional(readOnly = true)
	public Slice<ContentListResponseDto> getContentsByCategory(CategoryEnum category, int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
		Slice<Content> contents = contentRepository.findByCategoryForList(category, pageable);
		return contents.map(this::toListDto);
	}

	/** 콘텐츠 상세 조회 (포스트, 댓글 포함) */
	@Override
	@Transactional(readOnly = true)
	public ContentResponseDto getContent(Byte contentId, Byte userId) {
		Content content = contentRepository.findByIdForDetail(contentId)
			.orElseThrow(() -> new IllegalArgumentException("콘텐츠 없음"));
		
		// 현재 사용자가 콘텐츠 소유자인지 확인
		boolean isOwner = false;
		if (userId != null) {
			Creator creator = creatorRepository.findByUser_UserId(userId).orElse(null);
			if (creator != null && content.getCreator().getCreatorId().equals(creator.getCreatorId())) {
				isOwner = true;
			}
		}
		
		return toDto(content, isOwner);
	}

	/** getContent에서 분리 - 조회수 증가 */
	@Override
	public void incrementViewCount(Byte contentId) {
        Content content = contentRepository.findById(contentId)
            .orElseThrow(() -> new IllegalArgumentException("콘텐츠 없음"));
        content.setViewCount(content.getViewCount() + 1);
        contentRepository.save(content);
	}

	/** 콘텐츠 삭제 */
	@Override
	public void deleteContent(Byte contentId, Byte userId) {
		Content content = contentRepository.findById(contentId)
			.orElseThrow(() -> new IllegalArgumentException("콘텐츠 없음"));

		Creator creator = creatorRepository.findByUser_UserId(userId)
			.orElseThrow(() -> new IllegalStateException("크리에이터 없음"));
		
		if (!content.getCreator().getCreatorId().equals(creator.getCreatorId())) {
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

	/** 포스트 내 파일 수정 처리 */
	private void updatePostFiles(Post post, List<String> newPostFiles) {
		if (newPostFiles == null) {
			newPostFiles = new ArrayList<>();
		}

		List<PostFile> prevFiles = post.getFileList();
		if (prevFiles == null) {
			prevFiles = new ArrayList<>();
		}

		// 기존 파일 중 새로운 리스트에 없는 파일
		List<PostFile> filesToRemove = new ArrayList<>();
		for (PostFile file : prevFiles) {
			if (!newPostFiles.contains(file.getUrl())) {
				// S3 파일 삭제
				if (fileService.isS3Url(file.getUrl())) {
					fileService.deleteFile(file.getUrl());
				}
				filesToRemove.add(file);
			}
		}
		prevFiles.removeAll(filesToRemove);

		// 새로운 파일 중 기존에 없는 파일만 추가
		List<String> addUrls = prevFiles.stream()
			.map(PostFile::getUrl)
			.toList();

		for (String url : newPostFiles) {
			if (!addUrls.contains(url)) {
				prevFiles.add(PostFile.builder()
					.post(post)
					.url(url)
					.build());
			}
		}

		post.setFileList(prevFiles);
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

    /** 구독, 단건 검증 처리 */
	private void contentValid(Byte planId, Integer price) {
		boolean hasPlanId = planId != null;
		boolean hasPrice = price != null;
        
		// 둘 다 존재하는 경우 불가능
		if (hasPlanId && hasPrice) {
			throw new IllegalArgumentException("플랜과 단건 가격 동시 존재 불가능");
		}
		if (hasPrice && price <= 0) {
			throw new IllegalArgumentException("단건 가격 0원보다 높아야 함");
		}
	}

	/** dto 변환 */
	private ContentResponseDto toDto(Content content, Boolean isOwner) {
		Creator creator = content.getCreator();
		Post post = content.getPost();
		
		PostResponseDto postDto = null;
		if (post != null) {
			List<String> postFiles = post.getFileList().stream()
				.map(PostFile::getUrl)
				.toList();
			postDto = new PostResponseDto(
				post.getPostId(),
				post.getBody(),
				postFiles
			);
		}
		
		return new ContentResponseDto(
			content.getContentId(),
			content.getTitle(),
			content.getDescription(),
			content.getCategory(),
			creator.getCreatorId(),
			creator.getDisplayName(),
			content.getPlan() != null ? content.getPlan().getPlanId() : null,
			content.getPrice(),
			content.getThumbnailUrl(),
			content.getCreatedAt(),
			content.getUpdatedAt(),
			content.getViewCount(),
			postDto,
			isOwner
		);
	}

	/** 콘텐츠 좋아요 토글 */
	@Override
	public ContentLikeResponseDto toggleLike(Byte contentId, Byte userId) {
		Content content = contentRepository.findById(contentId)
			.orElseThrow(() -> new IllegalArgumentException("콘텐츠 없음"));

		User user = userRepository.findById(userId)
			.orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

		// 이미 눌렀는지 확인
		boolean exists = contentLikeRepository.existsByContent_ContentIdAndUser_UserId(contentId, userId);
		boolean isLiked;

		if (exists) {
			// Content의 likes 리스트에서 해당 좋아요를 찾아서 제거
			content.getLikes().removeIf(like -> like.getUser().getUserId().equals(userId));
			contentLikeRepository.deleteByContent_ContentIdAndUser_UserId(contentId, userId);
			content.setLikeCount(content.getLikeCount() - 1);
			isLiked = false;
		} else {
			ContentLike like = ContentLike.builder()
				.content(content)
				.user(user)
				.build();
			contentLikeRepository.save(like);
			// Content의 likes 리스트에 추가
			content.getLikes().add(like);
			content.setLikeCount(content.getLikeCount() + 1);
			isLiked = true;
		}

		contentRepository.save(content);
		
		return new ContentLikeResponseDto(content.getLikeCount(), isLiked);
	}

	/** 리스트dto 변환 */
	private ContentListResponseDto toListDto(Content content) {
		Creator creator = content.getCreator();
		
		return new ContentListResponseDto(
			content.getContentId(),
			content.getTitle(),
			content.getDescription(),
			content.getCategory(),
			creator.getCreatorId(),
			creator.getDisplayName(),
			creator.getProfile(),
			content.getPlan() != null ? content.getPlan().getPlanId() : null,
			content.getPrice(),
			content.getThumbnailUrl(),
			content.getCreatedAt(),
			content.getUpdatedAt(),
			content.getViewCount(),
			content.getLikeCount()
		);
	}
}

