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
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SpringSkillaryBackApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringSkillaryBackApplication.class, args);
	}


	@Bean
	public CommandLineRunner cml(
			SubscriptionPlanRepository subscriptionPlanRepository,
			CreatorRepository creatorRepository,
			UserRepository userRepository,
			ContentRepository contentRepository,
			PostRepository postRepository
	) {
		return args -> {
			var user = userRepository.save(User.builder()
					                    .email("email@email.com")
					                    .password("1234")
					                    .nickname("hello").build());
			var creator = creatorRepository.save(Creator.builder()
					                       .displayName("테스트 이름")
					                       .user(user)
					                       .build());
			var subscriptionPlan = subscriptionPlanRepository.save(SubscriptionPlan.builder()
					                                .name("테스트")
					                                .price(100)
													.description("test")
					                                .creator(creator)
					                                .build());
			var post = postRepository.save(Post.builder()
					                               .url("http://test.com")
					                               .body("본문 입니다.")
					                               .creator(creator)
					                               .build());
			var content = contentRepository.save(Content.builder()
					                                     .title("컨텐트 테스트")
					                                     .price(1000)
					                                     .post(post)
					                                     .creator(creator)
					                                     .category(CategoryEnum.IT)
					                                     .build());
		};
	}
}
