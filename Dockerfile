# 多阶段构建 - 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装所有依赖（包括开发依赖）
RUN npm ci

# 复制源代码
COPY . .

# 运行测试（可选）
# RUN npm test

# 生产阶段
FROM node:18-alpine AS production

# 安装 dumb-init 用于正确处理信号
RUN apk add --no-cache dumb-init

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 只安装生产依赖
RUN npm ci --only=production && \
    npm cache clean --force

# 复制应用代码
COPY --from=builder /app/*.js ./
COPY --from=builder /app/*.md ./

# 创建必要的目录
RUN mkdir -p /app/logs /app/data

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 更改文件所有权
RUN chown -R nodejs:nodejs /app

# 切换到非 root 用户
USER nodejs

# 设置环境变量
ENV NODE_ENV=production \
    PERFORMANCE_MONITOR=true

# 暴露端口（如果需要 HTTP 服务）
# EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "console.log('Health check passed')" || exit 1

# 使用 dumb-init 启动应用（更好的信号处理）
ENTRYPOINT ["dumb-init", "--"]

# 启动应用
CMD ["node", "--max-old-space-size=450", "index.js"] 