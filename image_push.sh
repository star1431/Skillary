#!/bin/bash

# 1. 변수 설정 (사용자 계정명)
DOCKER_USER="seonghun120614"
TAG="latest"

docker buildx build \
    --platform linux/amd64 \
    -t $DOCKER_USER/nginx-skillary:$TAG ./nginx-skillary-proxy \
    --push

docker buildx build \
    --platform linux/amd64 \
    -t $DOCKER_USER/next-skillary:$TAG ./next-skillary-front \
    --push

docker buildx build \
    --platform linux/amd64 \
    -t $DOCKER_USER/spring-skillary:$TAG ./spring-skillary-back \
    --push

docker buildx build \
    --platform linux/amd64 \
    -t $DOCKER_USER/mysql-skillary:$TAG ./mysql-skillary-db \
    --push

git add .
git commit -m "⚙️ 설정: CI/CD 자속적 배포"
git push

echo "✅ 모든 이미지 푸시가 완료되었습니다!"