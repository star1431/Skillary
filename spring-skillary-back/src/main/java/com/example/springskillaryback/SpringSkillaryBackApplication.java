package com.example.springskillaryback;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@RequiredArgsConstructor
public class SpringSkillaryBackApplication {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

	public static void main(String[] args) {
		SpringApplication.run(SpringSkillaryBackApplication.class, args);
	}

}
