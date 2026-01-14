package com.example.springskillaryback.controller;

import com.example.springskillaryback.common.dto.MeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class TestController {
    @GetMapping("/api/me")
    public ResponseEntity<MeResponse> me(Autentication autentication) {

    }
}
