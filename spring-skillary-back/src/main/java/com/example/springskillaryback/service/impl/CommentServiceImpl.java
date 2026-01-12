package com.example.springskillaryback.service.impl;

import com.example.springskillaryback.common.dto.CommentRequestDto;
import com.example.springskillaryback.domain.Comment;
import com.example.springskillaryback.domain.Post;
import com.example.springskillaryback.domain.User;
import com.example.springskillaryback.repository.CommentRepository;
import com.example.springskillaryback.repository.PostRepository;
import com.example.springskillaryback.repository.UserRepository;
import com.example.springskillaryback.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentServiceImpl implements CommentService {
	private final CommentRepository commentRepository;
	private final PostRepository postRepository;
	private final UserRepository userRepository;

	/** 댓글 추가 */
	@Override
	public Comment addComment(CommentRequestDto commentRequestDto) {
		Post post = postRepository.findById(commentRequestDto.postId())
			.orElseThrow(() -> new IllegalArgumentException("포스트 없음"));

		User user = userRepository.findById(commentRequestDto.userId())
			.orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

		Comment comment = Comment.builder()
			.post(post)
			.user(user)
			.comment(commentRequestDto.comment())
			.likeCount(0)
			.build();

		return commentRepository.save(comment);
	}

	/** 댓글 수정 */
	@Override
	public Comment updateComment(Byte commentId, CommentRequestDto commentRequestDto) {
		Comment comment = commentRepository.findById(commentId)
			.orElseThrow(() -> new IllegalArgumentException("댓글 없음"));

		if (!comment.getUser().getUserId().equals(commentRequestDto.userId())) {
			throw new IllegalArgumentException("권한 없음");
		}

		comment.setComment(commentRequestDto.comment());

		return commentRepository.save(comment);
	}

	/** 댓글 삭제 */
	@Override
	public void deleteComment(Byte commentId, CommentRequestDto commentRequestDto) {
		Comment comment = commentRepository.findById(commentId)
			.orElseThrow(() -> new IllegalArgumentException("댓글 없음"));

		if (!comment.getUser().getUserId().equals(commentRequestDto.userId())) {
			throw new IllegalArgumentException("권한 없음");
		}

		commentRepository.delete(comment);
	}
}

