package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.SettlementRun;

import java.time.LocalDate;

public record SettlementRunResponseDto(
		byte runId,
		int totalAmount,
		boolean isSettled,
		LocalDate startAt,
		LocalDate endAt
) {
	public static SettlementRunResponseDto from(SettlementRun settlement) {
		return new SettlementRunResponseDto(
				settlement.getRunId(),
				settlement.getTotalAmount(),
				settlement.isSettled(),
				settlement.getPeriodStart(),
				settlement.getPeriodEnd()
		);
	}
}
