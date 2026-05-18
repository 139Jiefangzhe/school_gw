# Medusa v2 多阶段构建
FROM node:20-alpine AS builder

WORKDIR /app

# 安装构建依赖
RUN apk add --no-cache python3 make g++

# 复制依赖文件
COPY package.json tsconfig.json medusa-config.ts ./

# The package set mixes "latest" Medusa packages with pinned React 18 dev deps.
# Use legacy peer resolution so the image can build reproducibly for staging.
RUN npm install --legacy-peer-deps

# 复制源代码
COPY src ./src

# 构建
RUN npm run build

# 生产阶段
FROM node:20-alpine AS production

WORKDIR /app

# 安装生产依赖
COPY package.json tsconfig.json medusa-config.ts ./
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# 复制构建产物
COPY --from=builder /app/.medusa ./.medusa
COPY --from=builder /app/src ./src

EXPOSE 9000

CMD ["npm", "start"]
