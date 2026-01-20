package com.example.springskillaryback.service;

import com.example.springskillaryback.common.dto.CreateCreatorRequest;
import com.example.springskillaryback.common.dto.CreatorDetailResponse;
import com.example.springskillaryback.common.dto.CreatorProfileResponse;
import com.example.springskillaryback.common.dto.MyCreatorResponse;
import com.example.springskillaryback.common.dto.RecommendedCreatorResponse;
import com.example.springskillaryback.common.dto.UpdateCreatorRequest;

import java.util.List;

public interface CreatorService {
    Byte createCreator(Byte userId, CreateCreatorRequest request);

    MyCreatorResponse getMyCreator(Byte userId);

    void updateCreator(Byte userId, UpdateCreatorRequest request);

    // 크리에이터 목록
    List<CreatorProfileResponse> listCreators();

    // 크리에이터 상세 조회
    CreatorDetailResponse getCreatorDetail(Byte creatorId);

    void deleteCreator(Byte creatorId);

    // 추천 크리에이터 목록 (구독자 수 순)
    List<RecommendedCreatorResponse> getRecommendedCreators();
}
