package com.example.springskillaryback.controller;

import com.example.springskillaryback.common.dto.CreateCreatorRequest;
import com.example.springskillaryback.common.dto.CreatorDetailResponse;
import com.example.springskillaryback.common.dto.CreatorProfileResponse;
import com.example.springskillaryback.common.dto.MyCreatorResponse;
import com.example.springskillaryback.common.dto.RecommendedCreatorResponse;
import com.example.springskillaryback.common.dto.UpdateCreatorRequest;
import com.example.springskillaryback.service.CreatorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/creators")
public class CreatorController {
    private final CreatorService creatorService;

    @PostMapping
    public ResponseEntity<Void> createCreator(Authentication authentication,
                                              @Valid @RequestBody CreateCreatorRequest request) {
        Byte userId = Byte.valueOf((String) authentication.getPrincipal());
        try {
            creatorService.createCreator(userId, request);
            return ResponseEntity.status(201).build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().header("X-Error-Message", e.getMessage()).build();
        }
    }

    // 크리에이터 목록 조회
    @GetMapping
    public ResponseEntity<List<CreatorProfileResponse>> listCreators() {
        return ResponseEntity.ok(creatorService.listCreators());
    }

    // 크리에이터 상세 조회
    @GetMapping("/{creatorId}")
    public ResponseEntity<CreatorDetailResponse> getCreatorDetail(@PathVariable Byte creatorId) {
        try {
            return ResponseEntity.ok(creatorService.getCreatorDetail(creatorId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/me")
    public ResponseEntity<MyCreatorResponse> getMyCreator(Authentication authentication) {
        Byte userId = Byte.valueOf((String) authentication.getPrincipal());
        return ResponseEntity.ok(creatorService.getMyCreator(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<Void> updateCreator(Authentication authentication,
                                              @Valid @RequestBody UpdateCreatorRequest request) {
        Byte userId = Byte.valueOf((String) authentication.getPrincipal());
        creatorService.updateCreator(userId, request);
        return ResponseEntity.noContent().build();
    }

    // 소프트 삭제 (isDeleted = true)
    @DeleteMapping("/{creatorId}")
    public ResponseEntity<Void> deleteCreator(@PathVariable Byte creatorId) {
        try {
            creatorService.deleteCreator(creatorId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 추천 크리에이터 목록 (구독자 수 순, 삭제되지 않은 것만)
    @GetMapping("/recommended")
    public ResponseEntity<List<RecommendedCreatorResponse>> getRecommendedCreators() {
        return ResponseEntity.ok(creatorService.getRecommendedCreators());
    }
}
