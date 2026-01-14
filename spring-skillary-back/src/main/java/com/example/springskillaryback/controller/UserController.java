package com.example.springskillaryback.controller;

import com.example.springskillaryback.common.dto.MeResponse;
import com.example.springskillaryback.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(Authentication authentication) {
        String userIdStr = (String) authentication.getPrincipal();
        Byte userId = Byte.valueOf(userIdStr);

        return ResponseEntity.ok(userService.me(userId));
    }
}
