package com.example.springskillaryback.service.impl;

import com.example.springskillaryback.common.dto.ContentLikeResponseDto;
import com.example.springskillaryback.common.dto.ContentListResponseDto;
import com.example.springskillaryback.common.dto.ContentRequestDto;
import com.example.springskillaryback.common.dto.ContentResponseDto;
import com.example.springskillaryback.common.dto.PostResponseDto;
import com.example.springskillaryback.common.dto.ContentDeletePreviewDto;
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
import com.example.springskillaryback.domain.Order;
import com.example.springskillaryback.domain.OrderStatusEnum;
import com.example.springskillaryback.repository.OrderRepository;
import com.example.springskillaryback.repository.SubscribeRepository;
import com.example.springskillaryback.domain.SubscribeStatusEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

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
	private final OrderRepository orderRepository;
	private final SubscribeRepository subscribeRepository;

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
            savedContent = contentRepository.save(savedContent);
		}

        return toDto(savedContent, false, false, false);
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

		// 구독, 단건 동시 설정 검증 처리
		contentValid(requestDto.planId(), requestDto.price());

		boolean hasPlanId = content.getPlan() != null;
		boolean hasPrice = content.getPrice() != null;
		boolean isFree = !hasPlanId && !hasPrice;

		boolean reqPlan = requestDto.planId() != null;
		boolean reqPrice = requestDto.price() != null;
		boolean reqFree = !reqPlan && !reqPrice;

		if (hasPlanId) {
			if (reqFree || reqPrice) throw new IllegalStateException("구독 콘텐츠는 다른 과금 유형으로 변경 불가");
			// 구독 플랜 변경 불가
			if (reqPlan && !content.getPlan().getPlanId().equals(requestDto.planId())) {
				throw new IllegalStateException("구독 콘텐츠는 다른 플랜으로 변경 불가");
			}
		}

		if (hasPrice) {
            if (reqFree || reqPlan) throw new IllegalStateException("유료 콘텐츠는 다른 과금 유형으로 변경 불가");
            // 금액 변경 불가
            if (reqPrice && !content.getPrice().equals(requestDto.price())) {
                throw new IllegalStateException("유료 콘텐츠의 가격은 변경 불가");
            }
		}
		if (isFree && (reqPlan || reqPrice)) throw new IllegalStateException("무료 콘텐츠는 다른 과금 유형으로 변경 불가");


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
		return toDto(savedContent, false, false, false);
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
	public Slice<ContentListResponseDto> getContentsByCategory(CategoryEnum category, int page, int size, String sort) {
		Pageable pageable;
		if ("popular".equals(sort)) {
			// popular : 인기순 (like)
			pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "likeCount", "createdAt"));
		} else {
			// latest : 최신순 (createdAt)
			pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
		}
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
		boolean isPurchased = false;
		boolean isSubscribed = false;
		
		if (userId != null) {
			User user = userRepository.findById(userId).orElse(null);
			if (user != null) {
				Creator creator = creatorRepository.findByUser_UserId(userId).orElse(null);
				if (creator != null && content.getCreator().getCreatorId().equals(creator.getCreatorId())) {
					isOwner = true;
				}
				
				// 단건 체크
				if (content.getPrice() != null) {
					List<Order> paidOrders = orderRepository.findByContentIdAndStatus(contentId, OrderStatusEnum.PAID);
					isPurchased = paidOrders.stream()
						.anyMatch(order -> order.getUser().getUserId().equals(userId));
				}
				
				// 구독 체크
				if (content.getPlan() != null) {
					isSubscribed = subscribeRepository.existsBySubscribeStatusAndSubscriptionPlanAndUser(
						SubscribeStatusEnum.ACTIVE,
						content.getPlan(),
						user
					);
				}
			}
		}
		
		return toDto(content, isOwner, isPurchased, isSubscribed);
	}

	/** getContent에서 분리 - 조회수 증가 */
	@Override
	public void incrementViewCount(Byte contentId) {
        Content content = contentRepository.findById(contentId)
            .orElseThrow(() -> new IllegalArgumentException("콘텐츠 없음"));
        content.setViewCount(content.getViewCount() + 1);
        contentRepository.save(content);
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

	/** 삭제 전 확인 */
	@Override
	public ContentDeletePreviewDto getDeletePreview(Byte contentId, Byte userId) {
		Content content = contentRepository.findById(contentId)
			.orElseThrow(() -> new IllegalArgumentException("콘텐츠 없음"));

		Creator creator = creatorRepository.findByUser_UserId(userId)
			.orElseThrow(() -> new IllegalStateException("크리에이터 없음"));
		
		if (!content.getCreator().getCreatorId().equals(creator.getCreatorId())) {
			throw new IllegalArgumentException("권한 없음");
		}

		LocalDateTime deletedAt = calcDeletedAt(contentId);
		return new ContentDeletePreviewDto(deletedAt != null, deletedAt);
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

		LocalDateTime deletedAt = calcDeletedAt(contentId);

		if (deletedAt != null) {
			// 단건결제 - soft 삭제 처리
			content.setDeletedAt(deletedAt);
			contentRepository.save(content);
			log.info("[ContentService] 삭제 예정일 설정: contentId={}, deletedAt={}", contentId, deletedAt);
		} else {
            // 나머지는 hard 삭제
			deleteAssociatedFiles(content);
			contentRepository.delete(content);
		}
	}

    /** 삭제 예정일 값 처리 */
    private LocalDateTime calcDeletedAt(Byte contentId) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("콘텐츠 없음"));

        // 단건결제 콘텐츠인지 확인
        if (content.getPrice() != null) {
            List<Order> paidOrders = orderRepository.findByContentIdAndStatus(contentId, OrderStatusEnum.PAID);

            if (!paidOrders.isEmpty()) {
                // 테스트용 - 1분뒤
                // LocalDateTime deletedAt = LocalDateTime.now().plusMinutes(1);
                LocalDateTime deletedAt = null;

                // payment paid_at 최신일
                LocalDateTime latestPayDate = paidOrders.stream()
                        .map(order -> order.getPayment().getPaidAt())
                        .filter(date -> date != null)
                        .max(LocalDateTime::compareTo)
                        .orElse(LocalDateTime.now());

                // paid_at 최신일 기준 - 정산 10일 이전,이후 건 분기
                int paymentDay = latestPayDate.toLocalDate().getDayOfMonth();
                LocalDate paymentDate = latestPayDate.toLocalDate();
                if (paymentDay <= 9) {
                    deletedAt = paymentDate.plusMonths(2).withDayOfMonth(10).atTime(0, 0, 0);
                } else {
                    deletedAt = paymentDate.plusMonths(3).withDayOfMonth(10).atTime(0, 0, 0);
                }

                return deletedAt;
            }
        }
        return null;
    }

	/** 콘텐츠 단건결제 삭제 스케줄러 */
    @Scheduled(cron = "5 0 0 10 * ?") // 10일 00:00:05
    // @Scheduled(fixedDelay = 60000) // 테스트용 - 1분
	public void deleteScheduledContents() {
        log.info("[ContentService] deleteScheduledContents 스케줄러 진행");

		LocalDateTime now = LocalDateTime.now();
		List<Content> contentDeleteList = contentRepository.findContentsForScheduled(now);
        if(!contentDeleteList.isEmpty()) {
            for (Content content : contentDeleteList) {
                try {
                    // 관련 파일 삭제 후 콘텐츠 삭제
                    deleteAssociatedFiles(content);
                    contentRepository.delete(content);
                    log.info("[ContentService] 단건결제 스케줄 삭제 확인 : contentId={}, deletedAt={}",
                            content.getContentId(), content.getDeletedAt());
                } catch (Exception e) {
                    log.error("[ContentService] 단건결제 스케줄 삭제 오류 확인 : contentId={}, deletedAt={} error={}",
                        content.getContentId(), content.getDeletedAt(), e.getMessage());
                }
            }
        }
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
	private ContentResponseDto toDto(Content content, Boolean isOwner, Boolean isPurchased, Boolean isSubscribed) {
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
			content.getDeletedAt(),
			content.getViewCount(),
			content.getLikeCount(),
			postDto,
			isOwner,
			isPurchased,
			isSubscribed
		);
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
			content.getDeletedAt(),
			content.getViewCount(),
			content.getLikeCount()
		);
	}
}

