package com.example.springskillaryback.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.annotation.LastModifiedBy;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Table(name = "users")
@Entity
@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Byte userId;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(nullable = false)
	private String password;

	@Setter
    @Column(nullable = false, unique = true, length = 100)
	private String nickname;

	@Setter
    private String profile; // 프로필 사진

	@CreationTimestamp
	private LocalDateTime createdAt;

	@LastModifiedBy
	private LocalDateTime updatedAt;

    @Builder.Default
    private Byte subscribedCreatorCount = 0;

	@Builder.Default
	@ManyToMany
	@JoinTable(
			name = "user_role",
			joinColumns = @JoinColumn(name = "user_id"),
			inverseJoinColumns = @JoinColumn(name = "role_id")
	)
	private Set<Role> roles = new HashSet<>();

    @OneToOne(mappedBy = "user")
    private Creator creator;

	@Builder.Default
	@OneToMany
	@JoinColumn(name = "user_id")
	private Set<Subscribe> subscribes = new HashSet<>();

	@Builder.Default
	@OneToMany
	@JoinColumn(name = "user_id")
	private List<Comment> comments = new ArrayList<>();

	@Builder.Default
	@OneToMany
	@JoinColumn(name = "user_id")
	private List<Order> orders = new ArrayList<>();

}