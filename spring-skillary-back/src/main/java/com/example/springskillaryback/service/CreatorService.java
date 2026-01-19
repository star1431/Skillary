package com.example.springskillaryback.service;

import com.example.springskillaryback.common.dto.CreateCreatorRequest;
import com.example.springskillaryback.common.dto.MyCreatorResponse;
import com.example.springskillaryback.common.dto.UpdateCreatorRequest;

public interface CreatorService {
    Byte createCreator(Byte userId, CreateCreatorRequest request);

    MyCreatorResponse getMyCreator(Byte userId);

    void updateCreator(Byte userId, UpdateCreatorRequest request);
}
