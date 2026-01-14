package com.example.springskillaryback.repository;

import com.example.springskillaryback.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Byte> {
	Optional<User> findByEmail(String email);

    @Query("""
        select u
        from User u
        left join fetch u.roles r
        where u.userId = :userId
    """)
    Optional<User> findByIdWithRoles(@Param("userId") Byte userId);
    Optional<User> findByNickname(String nickname);
    boolean existsByNickname(String nickname);
}
