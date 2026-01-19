package com.example.springskillaryback.common.dto;

import com.example.springskillaryback.domain.CreatorSettlement;

import java.time.LocalDate;

public record CreatorSettlementResponseDto(
		byte creatorSettlementId,
		int totalAmount,
		int netAmount,
		int platformFee,
		boolean isSettled,
		LocalDate startAt,
		LocalDate endAt
) {
	public static CreatorSettlementResponseDto from(CreatorSettlement settlement) {
		return new CreatorSettlementResponseDto(
				settlement.getCreatorSettlementId(),
				settlement.getGrossAmount(),
				settlement.getPayoutAmount(),
				settlement.getPlatformFee(),
				settlement.isSettled(),
				settlement.getSettlementRun().getPeriodStart(),
				settlement.getSettlementRun().getPeriodEnd()
		);
	}
}