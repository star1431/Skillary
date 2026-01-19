package com.example.springskillaryback.common.util;

import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicInteger;

@Component
public class AdminVirtualCredit {
	private final AtomicInteger TOTAL_AMOUNT = new AtomicInteger(1_000_000);

	public int get() {
		return TOTAL_AMOUNT.get();
	}

	public int add(int amount) {
		return TOTAL_AMOUNT.addAndGet(amount);
	}

	public int subtract(int amount) {
		return TOTAL_AMOUNT.addAndGet(-amount);
	}
}