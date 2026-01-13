package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.Role;
import com.example.springskillaryback.domain.RoleEnum;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Byte> {
    Role findByRole(RoleEnum role);
}
