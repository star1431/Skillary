package com.example.springskillaryback.service;

public interface AuthService {
	void register(String email, String password, String nickname);

	String login(String email, String password);

	void sendCode(String email);

	boolean verifyCode(String email, String code);

    boolean isNicknameAvailable(String nickname);

	void logout(String refreshToken);

	String refresh(String accessToken);
}
