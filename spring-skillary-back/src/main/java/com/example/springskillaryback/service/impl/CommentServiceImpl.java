package com.example.springskillaryback.service.impl;

import com.example.springskillaryback.common.dto.CommentRequestDto;
import com.example.springskillaryback.common.dto.CommentResponseDto;
import com.example.springskillaryback.domain.Comment;
import com.example.springskillaryback.domain.CommentLike;
import com.example.springskillaryback.domain.Post;
import com.example.springskillaryback.domain.User;
import com.example.springskillaryback.repository.CommentLikeRepository;
import com.example.springskillaryback.repository.CommentRepository;
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

	/** 댓글 추가 */
	@Override
	public Comment addComment(Byte contentId, Byte userId, CommentRequestDto commentRequestDto) {

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

		Comment comment = Comment.builder()
			.post(post)
			.user(user)
			.comment(commentRequestDto.comment())
			.likeCount(0)
			.parent(parent)
			.build();

		return commentRepository.save(comment);
	}

	/** 댓글 목록 조회 */
	@Override
	@Transactional(readOnly = true)
	public List<CommentResponseDto> getComments(Byte contentId) {
		
		Post post = postRepository.findByContent_ContentId(contentId)
			.orElse(null);

		if (post == null) {
			return List.of();
		}
        // 대댓글 포함해서 
		List<Comment> comments = commentRepository.findByPost_PostId(post.getPostId());
		return comments.stream()
			.map(CommentResponseDto::from)
			.toList();
	}

	/** 댓글 수정 */
	@Override
	public Comment updateComment(Byte commentId, Byte userId, CommentRequestDto commentRequestDto) {
		Comment comment = commentRepository.findById(commentId)
			.orElseThrow(() -> new IllegalArgumentException("댓글 없음"));

		if (!comment.getUser().getUserId().equals(userId)) {
			throw new IllegalArgumentException("권한 없음");
		}

		comment.setComment(commentRequestDto.comment());

		return commentRepository.save(comment);
	}

	/** 댓글 삭제 */
	@Override
	public void deleteComment(Byte commentId, Byte userId) {
		Comment comment = commentRepository.findById(commentId)
			.orElseThrow(() -> new IllegalArgumentException("댓글 없음"));

		if (!comment.getUser().getUserId().equals(userId)) {
			throw new IllegalArgumentException("권한 없음");
		}

		commentRepository.delete(comment);
	}

	/** 댓글 좋아요 토글 */
	@Override
	public void toggleLike(Byte commentId, Byte userId) {
		Comment comment = commentRepository.findById(commentId)
			.orElseThrow(() -> new IllegalArgumentException("댓글 없음"));

		User user = userRepository.findById(userId)
			.orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

		// 이미 눌렀는지 확인
		boolean checking = commentLikeRepository.existsByComment_CommentIdAndUser_UserId(commentId, userId);

		if (checking) {
			commentLikeRepository.deleteByComment_CommentIdAndUser_UserId(commentId, userId);
			comment.setLikeCount(comment.getLikeCount() - 1);
		} else {
			CommentLike like = CommentLike.builder()
				.comment(comment)
				.user(user)
				.build();
			commentLikeRepository.save(like);
			comment.setLikeCount(comment.getLikeCount() + 1);
		}

		commentRepository.save(comment);
	}
}

