package com.example.springskillaryback.controller;

import com.example.springskillaryback.common.dto.CreateCreatorRequest;
import com.example.springskillaryback.common.dto.MyCreatorResponse;
import com.example.springskillaryback.common.dto.UpdateCreatorRequest;
import com.example.springskillaryback.service.CreatorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
