package com.example.springskillaryback.domain;

public enum CategoryEnum {
    // 노션 enum 값 적용
	EXERCISE("운동"),
	SPORTS("스포츠"),
	COOKING("요리"),
	STUDY("스터디"),
	ART("예술/창작"),
	MUSIC("음악"),
	PHOTO_VIDEO("사진/영상"),
	IT("개발/IT"),
	GAME("게임"),
	ETC("기타");

	private final String label;

	CategoryEnum(String label) {
		this.label = label;
	}

	public String getLabel() {
		return label;
	}
}
