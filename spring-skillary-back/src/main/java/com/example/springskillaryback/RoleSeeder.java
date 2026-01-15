package com.example.springskillaryback;

import com.example.springskillaryback.domain.Role;
import com.example.springskillaryback.domain.RoleEnum;
import com.example.springskillaryback.repository.RoleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoleSeeder implements ApplicationRunner {
    private final RoleRepository roleRepository;

    @Override
    @Profile("local")
    @Transactional
    public void run(ApplicationArguments args) {
        seed(RoleEnum.ROLE_USER);
        seed(RoleEnum.ROLE_ADMIN);
        seed(RoleEnum.ROLE_CREATOR);
    }

    private void seed(RoleEnum roleEnum) {
        if (roleRepository.findByRole(roleEnum) != null) return;
        roleRepository.save(new Role(null, roleEnum));
    }
}