package com.example.springskillaryback.domain;

public enum CreditMethodEnum {
	CARD("카드"),
	VIRTUAL_BANK("가상 계좌"),
	SIMPLE_CREDIT("간편결제"),
	PHONE("휴대폰"),
	DEPOSIT("계좌이체"),
	COUPON("문화상품권"),
	BOOK_COUPON("도서 상품권"),
	GAME_COUPON("게임 문화상품권");

	private String method;

	CreditMethodEnum(String method) {
		this.method = method;
	}

	public static CreditMethodEnum fromMethod(String value) {
		for (CreditMethodEnum type : CreditMethodEnum.values()) {
			if (type.method.equals(value)) {
				return type;
			}
		}
		throw new IllegalArgumentException("일치하는 결제 수단이 없습니다: " + value);
	}
}
