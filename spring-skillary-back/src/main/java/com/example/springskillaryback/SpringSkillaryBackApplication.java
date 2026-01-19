package com.example.springskillaryback;

import com.example.springskillaryback.domain.CategoryEnum;
import com.example.springskillaryback.domain.Content;
import com.example.springskillaryback.domain.Creator;
import com.example.springskillaryback.domain.Post;
import com.example.springskillaryback.domain.SubscriptionPlan;
import com.example.springskillaryback.domain.User;
import com.example.springskillaryback.repository.ContentRepository;
import com.example.springskillaryback.repository.CreatorRepository;
import com.example.springskillaryback.repository.PostRepository;
import com.example.springskillaryback.repository.SubscriptionPlanRepository;
import com.example.springskillaryback.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import com.example.springskillaryback.domain.*;
import com.example.springskillaryback.repository.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class SpringSkillaryBackApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringSkillaryBackApplication.class, args);
	}

	@Bean
	@Profile("dev")
	public CommandLineRunner cml(
			SubscriptionPlanRepository subscriptionPlanRepository,
			CreatorRepository creatorRepository,
			UserRepository userRepository,
			ContentRepository contentRepository,
			PostRepository postRepository,
			PasswordEncoder passwordEncoder
	) {
		return args -> {
			var user2 = userRepository.save(User.builder()
			                                   .email("email@email.com")
			                                   .password(passwordEncoder.encode("123456abc!"))
			                                   .nickname("hello")
			                                   .build());
			var user = userRepository.save(User.builder()
			                                   .email("email2@email.com")
			                                   .password(passwordEncoder.encode("123456abc!"))
			                                   .nickname("hello")
			                                   .build());

            var user1 = userRepository.save(User.builder()
                                                .email("email1@email.com")
                                                .password(passwordEncoder.encode("123456abc!"))
                                                .nickname("hello2")
                                                .build());

			var creator = creatorRepository.save(Creator.builder()
			                                            .displayName("테스트 이름")
			                                            .user(user)
			                                            .build());

            var creator1 = creatorRepository.save(Creator.builder()
                                                        .displayName("크리에이터2")
                                                        .user(user1)
                                                        .build());

			var subscriptionPlan = subscriptionPlanRepository.save(SubscriptionPlan.builder()
			                                                                       .name("테스트플랜")
			                                                                       .price(100)
			                                                                       .description("test")
			                                                                       .creator(creator)
			                                                                       .build());
			var content = contentRepository.save(Content.builder()
			                                            .title("[유료] 테스트")
                                                        .description("콘텐츠소개")
			                                            .price(1000)
			                                            .creator(creator)
			                                            .description("test")
			                                            .category(CategoryEnum.IT)
			                                            .build());

            var post = postRepository.save(Post.builder()
                                                .body("본문 입니다.")
                                                .creator(creator)
                                                .content(content)
                                                .build());
            content.setPost(post);
            contentRepository.save(content);

            var content1 = contentRepository.save(Content.builder()
                                                        .title("[구독] 테스트")
                                                        .description("콘텐츠소개")
                                                        .plan(subscriptionPlan)
                                                        .creator(creator)
                                                        .category(CategoryEnum.IT)
                                                        .build());

            var post1 = postRepository.save(Post.builder()
                                                .body("본문 입니다.")
                                                .creator(creator)
                                                .content(content1)
                                                .build());
            content1.setPost(post1);
            contentRepository.save(content1);


            var content2 = contentRepository.save(Content.builder()
                                                        .title("[무료] 테스트")
                                                        .description("콘텐츠소개")
                                                        .creator(creator1)
                                                        .category(CategoryEnum.IT)
                                                        .build());

            var post2 = postRepository.save(Post.builder()
                                                .body("본문 입니다.")
                                                .creator(creator1)
                                                .content(content2)
                                                .build());
            content2.setPost(post2);
            contentRepository.save(content2);
		};
	}
}
