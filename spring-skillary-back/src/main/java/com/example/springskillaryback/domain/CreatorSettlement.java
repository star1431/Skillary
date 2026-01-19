package com.example.springskillaryback.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

import static jakarta.persistence.EnumType.STRING;

@Table(name = "creator_settlements")
@Entity
@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class CreatorSettlement {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Byte creatorSettlementId;

	@Column(nullable = false)
	private int grossAmount;

	@Column(nullable = false)
	private int platformFee;

	@Column(nullable = false)
	private int payoutAmount;

    @Builder.Default
	@Enumerated(STRING)
    @Column(length = 20, nullable = false)
	private SettlementStatusEnum settlementStatus = SettlementStatusEnum.PENDING;

	@CreationTimestamp
	private LocalDateTime createdAt;

	@ManyToOne
	private Creator creator;

	@ManyToOne
	private SettlementRun settlementRun;

	public CreatorSettlement(int grossAmount,
	                         int platformFee,
	                         int payoutAmount,
	                         Creator creator,
	                         SettlementRun settlementRun) {
		this.grossAmount = grossAmount;
		this.platformFee = platformFee;
		this.payoutAmount = payoutAmount;
		this.creator = creator;
		this.settlementRun = settlementRun;
	}

	public CreatorSettlement(Creator creator, SettlementRun settlementRun) {
		this.grossAmount = 0;
		this.platformFee = 0;
		this.payoutAmount = 0;
		this.creator = creator;
		this.settlementRun = settlementRun;
		settlementRun.getSettlements().add(this);
		creator.getSettlements().add(this);
	}

	public void calculating() {
		this.settlementStatus = SettlementStatusEnum.CALCULATING;
	}

	public void fail() {
		this.settlementStatus = SettlementStatusEnum.FAILED;
	}

	public void complete() {
		this.settlementStatus = SettlementStatusEnum.PAID;
	}

	public void update(
			int amount,
			int platformFee,
			int payoutAmount
	) {
		this.grossAmount += amount;
		this.platformFee += platformFee;
		this.payoutAmount += payoutAmount;
		this.settlementRun.accumulate(amount);
	}

	public boolean isSettled() {
		return this.settlementStatus == SettlementStatusEnum.PAID;
	}
}