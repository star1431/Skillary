# ========================================
# Stage 1: 의존성 설치 및 빌드
# ========================================
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# Next.js 빌드
RUN npm run build

# ========================================
# Stage 2: 프로덕션 실행
# ========================================
FROM node:20-alpine AS runner

WORKDIR /app

# 보안: non-root 유저 생성
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 필요한 파일만 복사
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 환경변수 설정
ENV NODE_ENV=production
ENV PORT=3000

# 권한 설정
RUN chown -R nextjs:nodejs /app

# non-root 유저로 전환
USER nextjs

EXPOSE 3000

# 프로덕션 서버 실행
CMD ["node", "server.js"]