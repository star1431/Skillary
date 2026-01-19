package com.example.springskillaryback.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

import static jakarta.persistence.EnumType.STRING;

@Table(name = "payments")
@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Payment {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Byte paymentId;

	@Column(nullable = false, unique = true)
	private String paymentKey;

	@Column(nullable = false)
	private int credit;

	@JoinTable(name = "order_id")
	@OneToOne
	private Order order;

	@Enumerated(STRING)
    @Column(length = 20, nullable = false)
	private CreditMethodEnum creditMethod = CreditMethodEnum.CARD;

	@Enumerated(STRING)
    @Column(length = 20, nullable = false)
	private CreditStatusEnum creditStatus = CreditStatusEnum.PAID;

    @Column(nullable = false)
	private LocalDateTime paidAt = LocalDateTime.now();

	@CreationTimestamp
	private LocalDateTime createdAt;

	@ManyToOne
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	public Payment(String paymentKey, int amount, Order order, CreditMethodEnum creditMethod, User user) {
		this.paymentKey = paymentKey;
		this.order = order;
		this.credit = amount;
		this.creditMethod = creditMethod;
		this.user = user;
	}

	public Creator getCreator() {
		return this.order.getCreator();
	}
}