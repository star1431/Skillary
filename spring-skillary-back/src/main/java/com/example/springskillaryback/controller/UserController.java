package com.example.springskillaryback.controller;

import com.example.springskillaryback.common.dto.MeResponse;
import com.example.springskillaryback.common.dto.UpdateUserRequest;
import com.example.springskillaryback.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<MeResponse> getUser(Authentication authentication) {
        String userIdStr = (String) authentication.getPrincipal();
        Byte userId = Byte.valueOf(userIdStr);

        return ResponseEntity.ok(userService.me(userId));
    }

    // TODO: 유저 정보 수정
    @PutMapping("me")
    public ResponseEntity<Void> updateUser(Authentication authentication, @Valid @RequestBody UpdateUserRequest request) {
        Byte userId = Byte.valueOf((String) authentication.getPrincipal());
        try {
            userService.updateUser(userId, request.nickname(), request.profile());
            return ResponseEntity.noContent().build(); // 204
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().header("X-Error-Message", e.getMessage()).build();
        }
    }

    // 소프트 삭제 (isDeleted = true)
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUserId(@PathVariable Byte userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

}
