package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Byte> {
	boolean existsByPaymentKey(String paymentKey);
}
