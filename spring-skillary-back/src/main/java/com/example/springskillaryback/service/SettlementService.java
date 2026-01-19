package com.example.springskillaryback.service;

import com.example.springskillaryback.domain.CreatorSettlement;
import com.example.springskillaryback.domain.SettlementRun;
import org.springframework.data.domain.Page;


public interface SettlementService {
	Page<CreatorSettlement> pagingCreatorSettlements(byte userId, int page, int size);

	Page<SettlementRun> pagingSettlementRuns(byte userId, int page, int size);

	CreatorSettlement retrieveCreatorSettlement(byte userId, byte settlementId);
}