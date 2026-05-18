#!/bin/bash
# Medusa 一键部署脚本

set -e

echo "🚀 学校商城 Medusa 部署脚本"

# 检查 Docker
docker --version > /dev/null 2>&1 || { echo "❌ Docker 未安装"; exit 1; }
docker-compose --version > /dev/null 2>&1 || { echo "❌ Docker Compose 未安装"; exit 1; }

# 检查环境变量
if [ ! -f .env ]; then
  echo "⚠️ .env 文件不存在，从 .env.example 复制"
  cp .env.example .env
  echo "⚠️ 请编辑 .env 文件填入正确的配置"
  exit 1
fi

echo "📦 构建 Medusa 镜像..."
docker-compose build medusa

echo "🗄️ 启动 PostgreSQL 和 Redis..."
docker-compose up -d postgres redis

echo "⏳ 等待数据库就绪..."
sleep 10

echo "🚀 启动 Medusa..."
docker-compose up -d medusa

echo "⏳ 等待 Medusa 启动..."
sleep 15

echo "🌐 启动 Nginx..."
docker-compose up -d nginx

echo "✅ 部署完成！"
echo ""
echo "📋 服务状态："
docker-compose ps
echo ""
echo "🔗 访问地址："
echo "  Medusa API: http://localhost:9000"
echo "  Medusa Admin: http://localhost:9000/app"
echo ""
echo "📜 查看日志："
echo "  docker-compose logs -f medusa"
