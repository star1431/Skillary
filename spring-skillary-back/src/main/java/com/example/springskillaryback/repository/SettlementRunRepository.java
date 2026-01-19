package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.SettlementRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface SettlementRunRepository extends JpaRepository<SettlementRun, Byte> {
	Optional<SettlementRun> findByPeriodStartAndPeriodEnd(LocalDate start, LocalDate end);

	@Query("SELECT s FROM SettlementRun s WHERE :targetDate BETWEEN s.periodStart AND s.periodEnd")
	Optional<SettlementRun> findByDateWithinPeriod(@Param("targetDate") LocalDate targetDate);
}
