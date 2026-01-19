package com.example.springskillaryback.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Getter
@Table(name = "idempotencyKeys")
@NoArgsConstructor
public class IdempotencyKey {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID idempotencyKeyId;

	@OneToOne
	@JoinColumn(name = "user_id")
	private User user;

	public IdempotencyKey(User user) {
		this.user = user;
	}
}