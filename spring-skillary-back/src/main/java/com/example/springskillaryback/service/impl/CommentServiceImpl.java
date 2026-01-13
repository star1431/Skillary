package com.example.springskillaryback.service.impl;

import com.example.springskillaryback.common.dto.CommentRequestDto;
import com.example.springskillaryback.common.dto.CommentResponseDto;
import com.example.springskillaryback.domain.Comment;
import com.example.springskillaryback.domain.Content;
import com.example.springskillaryback.domain.Post;
import com.example.springskillaryback.domain.User;
import com.example.springskillaryback.repository.CommentRepository;
import com.example.springskillaryback.repository.ContentRepository;
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
	private final ContentRepository contentRepository;
	private final UserRepository userRepository;

	/** 댓글 추가 */
	@Override
	public Comment addComment(Byte contentId, Byte userId, CommentRequestDto commentRequestDto) {

		Content content = contentRepository.findByIdWithPost(contentId)
			.orElseThrow(() -> new IllegalArgumentException("콘텐츠 없음"));

		Post post = content.getPost();
		if (post == null) {
			throw new IllegalArgumentException("포스트 없음");
		}

		User user = userRepository.findById(userId)
			.orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

		Comment comment = Comment.builder()
			.post(post)
			.user(user)
			.comment(commentRequestDto.comment())
			.likeCount(0)
			.build();

		return commentRepository.save(comment);
	}

	/** 댓글 목록 조회 */
	@Override
	@Transactional(readOnly = true)
	public List<CommentResponseDto> getComments(Byte contentId) {
		
		Content content = contentRepository.findByIdWithPost(contentId)
			.orElseThrow(() -> new IllegalArgumentException("콘텐츠 없음"));

		Post post = content.getPost();
		if (post == null) {
			return List.of();
		}

		// 해당 Post의 댓글 목록 조회 (대댓글 포함)
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
}

