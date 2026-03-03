#!/bin/bash

# 星座 MCP 服务发布脚本
# 使用方法: ./publish.sh

set -e

echo "🚀 开始发布星座 MCP 服务..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查函数
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}错误: $1 未安装${NC}"
        exit 1
    fi
}

# 检查必要工具
echo -e "${BLUE}检查必要工具...${NC}"
check_command "node"
check_command "npm"
check_command "git"

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}错误: Node.js 版本需要 >= 18，当前版本: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js 版本检查通过: $(node -v)${NC}"

# 检查是否在正确的目录
if [ ! -f "package.json" ] || [ ! -f "index.js" ]; then
    echo -e "${RED}错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 运行测试
echo -e "${BLUE}运行测试...${NC}"
npm run test:manual

# 检查 NPM 登录状态
echo -e "${BLUE}检查 NPM 登录状态...${NC}"
if ! npm whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  未登录 NPM，请先运行: npm login${NC}"
    echo -e "${BLUE}或者按 Enter 继续（如果已经登录）...${NC}"
    read
else
    echo -e "${GREEN}✅ NPM 已登录: $(npm whoami)${NC}"
fi

# 检查包名可用性
PACKAGE_NAME=$(node -p "require('./package.json').name")
echo -e "${BLUE}检查包名可用性: $PACKAGE_NAME${NC}"

if npm view $PACKAGE_NAME &> /dev/null; then
    echo -e "${YELLOW}⚠️  包名 $PACKAGE_NAME 已存在${NC}"
    echo -e "${BLUE}请修改 package.json 中的 name 字段，或按 Enter 继续...${NC}"
    read
else
    echo -e "${GREEN}✅ 包名可用${NC}"
fi

# 构建和准备
echo -e "${BLUE}准备发布...${NC}"
npm ci --only=production

# 检查 Git 状态
if [ -d ".git" ]; then
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠️  有未提交的更改${NC}"
        git status
        echo -e "${BLUE}是否提交更改？(y/n)${NC}"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            git add .
            git commit -m "Prepare for release"
        fi
    fi
fi

# 发布确认
echo -e "${YELLOW}准备发布到 NPM...${NC}"
echo -e "${BLUE}包名: $PACKAGE_NAME${NC}"
echo -e "${BLUE}版本: $(node -p "require('./package.json').version")${NC}"
echo -e "${BLUE}描述: $(node -p "require('./package.json').description")${NC}"
echo -e "${YELLOW}确认发布？(y/n)${NC}"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}发布到 NPM...${NC}"
    npm publish --access public
    
    echo -e "${GREEN}✅ 发布成功！${NC}"
    echo -e "${BLUE}包地址: https://www.npmjs.com/package/$PACKAGE_NAME${NC}"
else
    echo -e "${YELLOW}取消发布${NC}"
    exit 0
fi

# MCP 注册表提示
echo -e "${BLUE}下一步: 提交到 MCP 注册表${NC}"
echo -e "${YELLOW}1. 访问: https://github.com/modelcontextprotocol/registry${NC}"
echo -e "${YELLOW}2. Fork 仓库${NC}"
echo -e "${YELLOW}3. 添加服务配置到 registry.yaml${NC}"
echo -e "${YELLOW}4. 创建 Pull Request${NC}"

# 生成 MCP 配置示例
echo -e "${BLUE}MCP 注册表配置示例:${NC}"
cat << EOF
servers:
  $PACKAGE_NAME:
    description: "$(node -p "require('./package.json').description")"
    repository: "https://github.com/YOUR_USERNAME/$PACKAGE_NAME"
    author: "$(node -p "require('./package.json').author")"
    license: "$(node -p "require('./package.json').license")"
    version: "$(node -p "require('./package.json').version")"
    tools:
      - get_zodiac_info
      - get_daily_horoscope
      - get_compatibility
      - get_all_zodiacs
      - get_zodiac_by_date
EOF

echo -e "${GREEN}🎉 发布流程完成！${NC}"
echo -e "${BLUE}详细说明请查看 RELEASE_GUIDE.md${NC}" 