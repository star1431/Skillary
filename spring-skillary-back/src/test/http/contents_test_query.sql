
-- 유저 임시
insert into users (email, password, nickname, created_at, updated_at) VALUES
    ('user1@test.com', '1234', '일반사용자1', NOW(), NOW()),
    ('user2@test.com', '1234', '일반사용자2', NOW(), NOW()),
    ('creator1@test.com', '1234', '크리에이터1', NOW(), NOW()),
    ('creator2@test.com', '1234', '크리에이터2', NOW(), NOW());

-- 크리에이터 임시
insert into creators (display_name, profile, is_deleted, user_id, created_at, updated_at) VALUES
    ('운동 크리에이터', '운동 전문가입니다', false, 3, NOW(), NOW()),
    ('요리 크리에이터', '요리 전문가입니다', false, 4, NOW(), NOW());

-- 플랜 임시
insert into subscription_plans (name, price, is_active, creator_id, created_at) VALUES
    ('플랜1', 10000, true, 1, NOW()),
    ('플랜2', 20000, true, 1, NOW()),
    ('플랜3', 15000, true, 2, NOW());


select * from creators;
-- http 테스트 후
-- 콘텐츠 확인
select c.content_id, c.title, c.description, c.category, cr.display_name as creator_name
from contents c
         join creators cr on c.creator_id = cr.creator_id;

-- 포스트 확인
select p.post_id, p.body, c.title as content_title
from posts p
         join contents c on p.content_id = c.content_id;

-- 댓글 확인
select cm.comment_id, cm.comment, u.nickname as user_name, p.post_id
from comments cm
         join users u on cm.user_id = u.user_id
         join posts p on cm.post_id = p.post_id;
