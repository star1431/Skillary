package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.CreditStatusEnum;
import com.example.springskillaryback.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Byte> {
	boolean existsByPaymentKey(String paymentKey);

	List<Payment> findAllByCreditStatusAndCreatedAtBetween(CreditStatusEnum creditStatusEnum, LocalDateTime start, LocalDateTime end);
}
