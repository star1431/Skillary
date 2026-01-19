package com.example.springskillaryback.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static jakarta.persistence.EnumType.STRING;

@Entity
@Getter
@Table(name = "cards")
@NoArgsConstructor
public class Card {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Byte cardId;

	@Column(nullable = false)
	private String cardName;

	@Enumerated(STRING)
	@Column(nullable = false)
	private CardStatusEnum cardStatus = CardStatusEnum.ACTIVE;

	@Column(unique = true)
	private boolean isDefault;

	@CreationTimestamp
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@ManyToOne
	private User user;
	@Column(nullable = false)
	private String cardNumber;  // 마스킹된 카드번호

	@Column(nullable = false)
	private String cardCompany;

	@Column(nullable = false)
	private String cardType;  // 신용/체크

	@Column(nullable = false)
	private String ownerType;  // 개인/법인

	@Column(unique = true)
	private String billingKey;

	// 생성자도 수정
	public Card(String cardCompany, String cardNumber,
	            String cardType, String ownerType, String billingKey, User user) {
		this.cardName = cardCompany;  // 또는 cardCompany 필드 따로
		this.cardNumber = cardNumber;
		this.cardCompany = cardCompany;
		this.cardType = cardType;
		this.ownerType = ownerType;
		this.billingKey = billingKey;
		this.user = user;
		this.isDefault = true;
	}

	public boolean isOwnedBy(User user) {
		return this.user.equals(user);
	}
}