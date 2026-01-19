package com.example.springskillaryback.controller;

import com.example.springskillaryback.common.dto.CreatorSettlementResponseDto;
import com.example.springskillaryback.common.dto.SettlementRunResponseDto;
import com.example.springskillaryback.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/settlements")
public class SettlementController {
	private final SettlementService settlementService;

	@GetMapping
	public ResponseEntity<Page<CreatorSettlementResponseDto>> pagingCreatorSettlements(
			Authentication authentication,
			@RequestParam(defaultValue = "0") Integer page,
			@RequestParam(defaultValue = "10") Integer size
	) {
		Byte userId = Byte.valueOf((String) Objects.requireNonNull(authentication.getPrincipal()));
		return ResponseEntity.ok(settlementService.pagingCreatorSettlements(userId, page, size)
		                                          .map(CreatorSettlementResponseDto::from));
	}

	@GetMapping("/{settlementId}")
	public ResponseEntity<CreatorSettlementResponseDto> retrieveCreatorSettlement(
			Authentication authentication,
			@PathVariable Byte settlementId
	) {
		Byte userId = Byte.valueOf((String) Objects.requireNonNull(authentication.getPrincipal()));
		return ResponseEntity.ok(CreatorSettlementResponseDto.from(
				settlementService.retrieveCreatorSettlement(userId, settlementId)
		));
	}

	@GetMapping("/admin")
	public ResponseEntity<Page<SettlementRunResponseDto>> pagingSettlementRuns(
		Authentication authentication,
		@RequestParam(defaultValue = "0") Integer page,
		@RequestParam(defaultValue = "10") Integer size
	) {
		Byte userId = Byte.valueOf((String) Objects.requireNonNull(authentication.getPrincipal()));
		return ResponseEntity.ok(settlementService.pagingSettlementRuns(userId, page, size)
				                         .map(SettlementRunResponseDto::from));
	}
}