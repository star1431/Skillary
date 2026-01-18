package com.example.springskillaryback.service.impl;

import com.example.springskillaryback.common.dto.CommentRequestDto;
import com.example.springskillaryback.common.dto.CommentResponseDto;
import com.example.springskillaryback.domain.Comment;
import com.example.springskillaryback.domain.CommentLike;
import com.example.springskillaryback.domain.Creator;
import com.example.springskillaryback.domain.Post;
import com.example.springskillaryback.domain.User;
import com.example.springskillaryback.repository.CommentLikeRepository;
import com.example.springskillaryback.repository.CommentRepository;
import com.example.springskillaryback.repository.CreatorRepository;
import com.example.springskillaryback.repository.PostRepository;
import com.example.springskillaryback.repository.UserRepository;
import com.example.springskillaryback.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentServiceImpl implements CommentService {
	private final CommentRepository commentRepository;
	private final PostRepository postRepository;
	private final UserRepository userRepository;
	private final CommentLikeRepository commentLikeRepository;
	private final CreatorRepository creatorRepository;

	/** 댓글 추가 */
	@Override
	public CommentResponseDto addComment(Byte contentId, Byte userId, CommentRequestDto commentRequestDto) {

		Post post = postRepository.findByContent_ContentId(contentId)
			.orElseThrow(() -> new IllegalArgumentException("포스트 없음"));

		User user = userRepository.findById(userId)
			.orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

		// 대댓글인 경우 부모 댓글 확인
		Comment parent = null;
		if (commentRequestDto.parentId() != null) {
			parent = commentRepository.findById(commentRequestDto.parentId())
				.orElseThrow(() -> new IllegalArgumentException("부모 댓글 없음"));

			// 부모 댓글이 같은 Post에 속하는지 확인
			if (!parent.getPost().getPostId().equals(post.getPostId())) {
				throw new IllegalArgumentException("부모 댓글이 다른 포스트임");
			}
		}

		Creator creator = creatorRepository.findByUser(user).orElse(null);
		
		Comment comment = Comment.builder()
			.post(post)
			.user(user)
			.creator(creator)
			.comment(commentRequestDto.comment())
			.parent(parent)
			.build();

		Comment savedComment = commentRepository.save(comment);
		
		return toDto(savedComment, userId);
	}

	/** 댓글 목록 조회 */
	@Override
	@Transactional(readOnly = true)
	public List<CommentResponseDto> getComments(Byte contentId, Byte currentUserId) {
		Post post = postRepository.findByContent_ContentId(contentId)
			.orElse(null);

		if (post == null) {
			return List.of();
		}

		List<Comment> comments = commentRepository.findByPost_PostId(post.getPostId());

		return comments.stream()
			.map(comment -> toDto(comment, currentUserId))
			.toList();
	}

	/** 댓글 수정 */
	@Override
	public CommentResponseDto updateComment(Byte commentId, Byte userId, CommentRequestDto commentRequestDto) {
		Comment comment = commentRepository.findById(commentId)
			.orElseThrow(() -> new IllegalArgumentException("댓글 없음"));

		if (!comment.getUser().getUserId().equals(userId)) {
			throw new IllegalArgumentException("권한 없음");
		}

		comment.setComment(commentRequestDto.comment());

		Comment savedComment = commentRepository.save(comment);
		
		return toDto(savedComment, userId);
	}

	/** 댓글 삭제 | 대댓글 o : soft, 대댓글 x : hard */
	@Override
	public void deleteComment(Byte commentId, Byte userId) {
		Comment comment = commentRepository.findById(commentId)
			.orElseThrow(() -> new IllegalArgumentException("댓글 없음"));

		if (!comment.getUser().getUserId().equals(userId)) {
			throw new IllegalArgumentException("권한 없음");
		}

		// 이미 삭제된 댓글인지 확인
		if (comment.getIsDeleted()) {
			throw new IllegalArgumentException("이미 삭제된 댓글");
		}

		// 대댓글이 있는지 확인
		boolean hasChildren = commentRepository.countByParentCommentId(commentId) > 0;
		
		if (hasChildren) {
			// 대댓글이 있는 경우: soft
			comment.setIsDeleted(true);
			commentRepository.save(comment);
		} else {
            Comment parent = comment.getParent();
			// 대댓글이 없는 경우: hard
			commentRepository.delete(comment);
            // 부모 댓글 soft삭제 상태 -> 자식 없는 경우 hard 진행
            if(parent != null && parent.getIsDeleted()) {
                long childLength = commentRepository.countByParentCommentId(parent.getCommentId());
                if(childLength == 0) {
                    commentRepository.delete(parent);
                }
            }
		}
	}

	/** 댓글 좋아요 토글 */
	@Override
	public void toggleLike(Byte commentId, Byte userId) {
		Comment comment = commentRepository.findById(commentId)
			.orElseThrow(() -> new IllegalArgumentException("댓글 없음"));

		User user = userRepository.findById(userId)
			.orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

		// 이미 눌렀는지 확인
		boolean exists = commentLikeRepository.existsByComment_CommentIdAndUser_UserId(commentId, userId);

		if (exists) {
			// Comment의 likes 리스트에서 해당 좋아요를 찾아서 제거 (영속성 컨텍스트 동기화)
			comment.getLikes().removeIf(like -> like.getUser().getUserId().equals(userId));
			commentLikeRepository.deleteByComment_CommentIdAndUser_UserId(commentId, userId);
			comment.setLikeCount(comment.getLikeCount() - 1);
		} else {
			CommentLike like = CommentLike.builder()
				.comment(comment)
				.user(user)
				.build();
			commentLikeRepository.save(like);
			// Comment의 likes 리스트에 추가 (양방향 관계 동기화)
			comment.getLikes().add(like);
			comment.setLikeCount(comment.getLikeCount() + 1);
		}

		commentRepository.save(comment);
	}
	
	/** dto 변환 */
	private CommentResponseDto toDto(Comment comment, Byte currentUserId) {
		// 현재 사용자가 좋아요 눌렀는지 확인
		Boolean likedByCurrentUser = null;
		if (currentUserId != null) {
			likedByCurrentUser = comment.getLikes().stream()
				.anyMatch(like -> like.getUser().getUserId().equals(currentUserId));
		}

		User user = comment.getUser();
		Creator creator = comment.getCreator();
		String displayName = creator != null ? creator.getDisplayName() : user.getNickname();
		String profileImageUrl = creator != null ? creator.getProfile() : null;
		Boolean isCreator = creator != null;

		return new CommentResponseDto(
			comment.getCommentId(),
			user.getUserId(),
			displayName,
			profileImageUrl,
			isCreator,
			comment.getComment(),
			comment.getLikeCount(),
			likedByCurrentUser,
			comment.getParent() != null ? comment.getParent().getCommentId() : null,
			comment.getCreatedAt(),
			comment.getIsDeleted()
		);
	}
}

