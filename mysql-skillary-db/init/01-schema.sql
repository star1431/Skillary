USE skillarydb;

-- ============================================================
-- 1. users (다른 테이블들이 참조)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    user_id TINYINT PRIMARY KEY AUTO_INCREMENT,
    customer_key BINARY(16) NOT NULL UNIQUE,
    idempotency_key BINARY(16) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    nickname VARCHAR(100) NOT NULL UNIQUE,
    profile TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    subscribed_creator_count TINYINT DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 2. roles
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
    role_id TINYINT PRIMARY KEY AUTO_INCREMENT,
    `role` VARCHAR(50) NOT NULL UNIQUE,
    INDEX role_idx (`role`)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 3. email_verifications
-- ============================================================
CREATE TABLE IF NOT EXISTS email_verifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 4. verified_emails
-- ============================================================
CREATE TABLE IF NOT EXISTS verified_emails (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 5. refresh_tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id TINYINT PRIMARY KEY AUTO_INCREMENT,
    user_id TINYINT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_refresh_tokens_user_id
        FOREIGN KEY (user_id) REFERENCES users (user_id)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 6. creators
-- ============================================================
CREATE TABLE IF NOT EXISTS creators (
    creator_id TINYINT PRIMARY KEY AUTO_INCREMENT,
    display_name VARCHAR(100) NOT NULL UNIQUE,
    introduction TEXT,
    profile TEXT,
    bank_name VARCHAR(100),
    account_number VARCHAR(100),
    follow_count TINYINT DEFAULT 0,
    category VARCHAR(20) NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id TINYINT NOT NULL UNIQUE,
    CONSTRAINT fk_creators_user_id
        FOREIGN KEY (user_id) REFERENCES users (user_id)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 7. subscription_plans
-- ============================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
    plan_id TINYINT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price INT NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    creator_id TINYINT NOT NULL,
    CONSTRAINT fk_subscription_plans_creator_id
        FOREIGN KEY (creator_id) REFERENCES creators (creator_id)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 8. settlement_runs
-- ============================================================
CREATE TABLE IF NOT EXISTS settlement_runs (
    run_id TINYINT PRIMARY KEY AUTO_INCREMENT,
    run_status VARCHAR(20) NOT NULL DEFAULT 'READY',
    total_amount INT NOT NULL DEFAULT 0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    executed_at TIMESTAMP NULL,
    INDEX idx_status (run_status),
    INDEX idx_period (period_start, period_end)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 9. contents
-- ============================================================
CREATE TABLE IF NOT EXISTS contents (
    content_id TINYINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    view_counts INT NOT NULL DEFAULT 0,
    like_counts INT NOT NULL DEFAULT 0,
    plan_id TINYINT NULL,
    price INT NULL,
    creator_id TINYINT NOT NULL,
    thumbnail_url VARCHAR(500),
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_contents_plan_id
        FOREIGN KEY (plan_id) REFERENCES subscription_plans (plan_id),
    CONSTRAINT fk_contents_creator_id
        FOREIGN KEY (creator_id) REFERENCES creators (creator_id),
    INDEX idx_contents_category_created (category, created_at DESC)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 10. posts
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
    post_id TINYINT PRIMARY KEY AUTO_INCREMENT,
    body TEXT NOT NULL,
    content_id TINYINT NOT NULL,
    creator_id TINYINT NOT NULL,
    CONSTRAINT fk_posts_content_id
        FOREIGN KEY (content_id) REFERENCES contents (content_id),
    CONSTRAINT fk_posts_creator_id
        FOREIGN KEY (creator_id) REFERENCES creators (creator_id)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 11. post_files
-- ============================================================
CREATE TABLE IF NOT EXISTS post_files (
    file_id TINYINT PRIMARY KEY AUTO_INCREMENT,
    post_id TINYINT NOT NULL,
    url VARCHAR(500) NOT NULL,
    CONSTRAINT fk_post_files_post_id
        FOREIGN KEY (post_id) REFERENCES posts (post_id)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 12. comments
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
    comment_id TINYINT PRIMARY KEY AUTO_INCREMENT,
    parent_comment_id TINYINT NULL,
    like_count INT NOT NULL DEFAULT 0,
    `comment` TEXT NOT NULL,
    post_id TINYINT NOT NULL,
    user_id TINYINT NOT NULL,
    creator_id TINYINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_comments_parent
        FOREIGN KEY (parent_comment_id) REFERENCES comments (comment_id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_post
        FOREIGN KEY (post_id) REFERENCES posts (post_id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_user
        FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT fk_comments_creator
        FOREIGN KEY (creator_id) REFERENCES creators (creator_id)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 13. comment_likes
-- ============================================================
CREATE TABLE IF NOT EXISTS comment_likes (
    like_id TINYINT PRIMARY KEY AUTO_INCREMENT,
    comment_id TINYINT NOT NULL,
    user_id TINYINT NOT NULL,
    CONSTRAINT fk_comment_likes_comment
        FOREIGN KEY (comment_id) REFERENCES comments (comment_id),
    CONSTRAINT fk_comment_likes_user
        FOREIGN KEY (user_id) REFERENCES users (user_id),
    UNIQUE KEY uk_comment_likes_comment_user (comment_id, user_id)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 14. content_likes
-- ============================================================
CREATE TABLE IF NOT EXISTS content_likes (
    like_id TINYINT PRIMARY KEY AUTO_INCREMENT,
    content_id TINYINT NOT NULL,
    user_id TINYINT NOT NULL,
    CONSTRAINT fk_content_likes_content
        FOREIGN KEY (content_id) REFERENCES contents (content_id),
    CONSTRAINT fk_content_likes_user
        FOREIGN KEY (user_id) REFERENCES users (user_id),
    UNIQUE KEY uk_content_likes_content_user (content_id, user_id)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 15. creator_settlements
-- ============================================================
CREATE TABLE IF NOT EXISTS creator_settlements (
    creator_settlement_id TINYINT PRIMARY KEY AUTO_INCREMENT,
    gross_amount INT NOT NULL,
    platform_fee INT NOT NULL,
    payout_amount INT NOT NULL,
    settlement_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creator_id TINYINT NOT NULL,
    run_id TINYINT NULL,
    CONSTRAINT fk_creator_settlements_creator_id
        FOREIGN KEY (creator_id) REFERENCES creators (creator_id),
    CONSTRAINT fk_creator_settlements_run_id
        FOREIGN KEY (run_id) REFERENCES settlement_runs (run_id),
    INDEX idx_creator_settlement_status_created (settlement_status, created_at DESC)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 16. subscribes
-- ============================================================
CREATE TABLE IF NOT EXISTS subscribes (
    subscribe_id TINYINT PRIMARY KEY AUTO_INCREMENT,
    subscribe_status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_at TIMESTAMP NULL,
    end_at TIMESTAMP NULL,
    user_id TINYINT NOT NULL,
    plan_id TINYINT NOT NULL,
    CONSTRAINT fk_subscribes_user_id
        FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT fk_subscribes_plan_id
        FOREIGN KEY (plan_id) REFERENCES subscription_plans (plan_id)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 17. idempotency_keys
-- ============================================================
CREATE TABLE IF NOT EXISTS idempotency_keys (
    idempotency_key_id CHAR(36) PRIMARY KEY,
    user_id TINYINT NULL,
    CONSTRAINT fk_idempotency_keys_user_id
        FOREIGN KEY (user_id) REFERENCES users (user_id)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 18. orders (order_id UUID = BINARY(16))
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    order_id BINARY(16) PRIMARY KEY,
    amount INT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATE NULL,
    expired_at TIMESTAMP NOT NULL,
    user_id TINYINT NOT NULL,
    plan_id TINYINT NULL,
    content_id TINYINT NULL,
    CONSTRAINT fk_orders_user_id
        FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT fk_orders_plan_id
        FOREIGN KEY (plan_id) REFERENCES subscription_plans (plan_id),
    CONSTRAINT fk_orders_content_id
        FOREIGN KEY (content_id) REFERENCES contents (content_id) ON DELETE SET NULL
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 19. payments
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    payment_id TINYINT PRIMARY KEY AUTO_INCREMENT,
    payment_key VARCHAR(255) NOT NULL UNIQUE,
    credit INT NOT NULL,
    order_id BINARY(16) NULL UNIQUE,
    credit_method VARCHAR(20) NOT NULL DEFAULT 'CARD',
    credit_status VARCHAR(20) NOT NULL DEFAULT 'PAID',
    paid_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id TINYINT NOT NULL,
    CONSTRAINT fk_payments_order_id
        FOREIGN KEY (order_id) REFERENCES orders (order_id),
    CONSTRAINT fk_payments_user_id
        FOREIGN KEY (user_id) REFERENCES users (user_id),
    INDEX idx_payments_method_status (credit_method, credit_status),
    INDEX idx_payments_status_created (credit_status, created_at DESC),
    INDEX idx_payments_paid_at (paid_at DESC)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 20. cards
-- ============================================================
CREATE TABLE IF NOT EXISTS cards (
    card_id TINYINT PRIMARY KEY AUTO_INCREMENT,
    card_name VARCHAR(100) NOT NULL,
    card_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id TINYINT NOT NULL,
    card_number VARCHAR(100) NOT NULL,
    card_company VARCHAR(100) NOT NULL,
    card_type VARCHAR(50) NOT NULL,
    owner_type VARCHAR(50) NOT NULL,
    billing_key VARCHAR(255) NULL UNIQUE,
    CONSTRAINT fk_cards_user_id
        FOREIGN KEY (user_id) REFERENCES users (user_id)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 21. user_role (User ↔ Role M:N)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_role (
    user_id TINYINT NOT NULL,
    role_id TINYINT NOT NULL,
    CONSTRAINT fk_user_role_user_id
        FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT fk_user_role_role_id
        FOREIGN KEY (role_id) REFERENCES roles (role_id)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 22. user_content (User ↔ Content M:N)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_content (
    user_id TINYINT NOT NULL,
    content_id TINYINT NOT NULL,
    CONSTRAINT fk_user_content_user_id
        FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT fk_user_content_content_id
        FOREIGN KEY (content_id) REFERENCES contents (content_id)
)
ENGINE=InnoDB
DEFAULT CHARACTER SET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
