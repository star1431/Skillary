package com.example.springskillaryback.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.springskillaryback.domain.CategoryEnum;
import com.example.springskillaryback.domain.Content;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ContentRepository extends JpaRepository<Content, Byte> {
	Optional<Content> findByTitle(String title);

    /** 크리에이터 콘텐츠 수 */
	long countByCreator_CreatorId(Byte creatorId);

	/** 콘텐츠 전체 목록 */
	@EntityGraph(attributePaths = {"creator", "plan"})
	@Query("SELECT c FROM Content c ORDER BY c.createdAt DESC")
	Slice<Content> findAllForList(Pageable pageable);

	/** 크리에이터 기준 목록 */
	@EntityGraph(attributePaths = {"creator", "plan"})
	@Query("SELECT c FROM Content c WHERE c.creator.creatorId = :creatorId ORDER BY c.createdAt DESC")
	Slice<Content> findByCreatorIdForList(Byte creatorId, Pageable pageable);

	/** 카테고리 기준 목록 */
	@EntityGraph(attributePaths = {"creator", "plan"})
	@Query("SELECT c FROM Content c WHERE c.category = :category")
	Slice<Content> findByCategoryForList(CategoryEnum category, Pageable pageable);

	/** 라이크 수 기준 목록 */
	@EntityGraph(attributePaths = {"creator", "plan"})
	@Query("SELECT c FROM Content c ORDER BY c.likeCount DESC, c.createdAt DESC")
	Slice<Content> findPopularForList(Pageable pageable);

    /** 상세 */
	@EntityGraph(attributePaths = {"creator", "plan", "post", "post.fileList"})
	@Query("SELECT c FROM Content c WHERE c.contentId = :contentId")
	Optional<Content> findByIdForDetail(Byte contentId);

	/** 스케줄시간 기준 삭제예정일 조회 */
	@Query("SELECT c FROM Content c WHERE c.deletedAt IS NOT NULL AND c.deletedAt <= :now")
	List<Content> findContentsForScheduled(LocalDateTime now);
}