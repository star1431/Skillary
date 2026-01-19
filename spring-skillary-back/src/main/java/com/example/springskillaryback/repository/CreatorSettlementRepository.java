package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.Creator;
import com.example.springskillaryback.domain.CreatorSettlement;
import com.example.springskillaryback.domain.SettlementRun;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CreatorSettlementRepository extends JpaRepository<CreatorSettlement, Byte> {
	Page<CreatorSettlement> findAllByCreator(Creator creator, Pageable pageable);

	Optional<CreatorSettlement> findByCreatorAndSettlementRun(Creator creator, SettlementRun settlementRun);
}
