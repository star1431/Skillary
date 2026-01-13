package com.example.springskillaryback.service;

public interface AuthService {
//     TokensDto register(String email, String password, String nickname);
// 	TokensDto login(String email, String password);
	void register(String email, String password);

	String login(String email, String password);

	void sendCode(String email);

	boolean verifyCode(String email, String code);

	void logout(String refreshToken);

	boolean withdrawal(String refreshToken);

	String refresh(String accessToken);
}
