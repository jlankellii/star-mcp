# 星座 MCP 服务 (Star MCP)

一个功能完整的星座 MCP (Model Context Protocol) 服务，提供星座信息查询、运势分析、配对测试等功能。

<a href="https://glama.ai/mcp/servers/@jlankellii/star-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@jlankellii/star-mcp/badge" alt="Star MCP server" />
</a>

## 功能特性

### 🌟 核心功能
- **星座信息查询**: 获取12星座的详细信息，包括性格特征、守护星、元素等
- **今日运势**: 提供爱情、事业、健康、财运、综合运势查询
- **星座配对**: 分析两个星座的配对指数和关系
- **生日星座**: 根据出生日期自动确定星座
- **星座列表**: 获取所有星座的基本信息

### 🎯 支持的星座
- ♈ 白羊座 (Aries)
- ♉ 金牛座 (Taurus)
- ♊ 双子座 (Gemini)
- ♋ 巨蟹座 (Cancer)
- ♌ 狮子座 (Leo)
- ♍ 处女座 (Virgo)
- ♎ 天秤座 (Libra)
- ♏ 天蝎座 (Scorpio)
- ♐ 射手座 (Sagittarius)
- ♑ 摩羯座 (Capricorn)
- ♒ 水瓶座 (Aquarius)
- ♓ 双鱼座 (Pisces)

## 安装和运行

### 前置要求
- Node.js 18+ 
- npm 或 pnpm

### 安装依赖
```bash
cd star
npm install
```

### 运行服务
```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

## API 接口

### 1. 获取星座信息
```javascript
{
  name: 'get_zodiac_info',
  arguments: {
    zodiac: '白羊座' // 或 'aries'
  }
}
```

### 2. 获取今日运势
```javascript
{
  name: 'get_daily_horoscope',
  arguments: {
    zodiac: '狮子座',
    category: 'love' // love, career, health, wealth, luck
  }
}
```

### 3. 星座配对分析
```javascript
{
  name: 'get_compatibility',
  arguments: {
    zodiac1: '白羊座',
    zodiac2: '狮子座'
  }
}
```

### 4. 根据生日查询星座
```javascript
{
  name: 'get_zodiac_by_date',
  arguments: {
    month: 8,
    day: 15
  }
}
```

### 5. 获取所有星座列表
```javascript
{
  name: 'get_all_zodiacs',
  arguments: {}
}
```

## 部署说明

### 本地部署
1. 克隆项目到本地
2. 安装依赖: `npm install`
3. 启动服务: `npm start`

### Docker 部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### 发布到 MCP 市场
1. 确保代码符合 MCP 规范
2. 添加适当的错误处理和日志
3. 编写完整的文档
4. 提交到 MCP 注册表

## 技术栈

- **Node.js**: 运行时环境
- **MCP SDK**: Model Context Protocol 官方 SDK
- **ES Modules**: 使用现代 JavaScript 模块系统

## 项目结构

```
star/
├── index.js          # 主服务文件
├── package.json      # 项目配置
├── README.md         # 项目文档
└── test.js           # 测试文件（可选）
```

## 开发指南

### 添加新功能
1. 在 `tools` 数组中定义新工具
2. 在 `switch` 语句中添加处理逻辑
3. 更新文档和测试

### 自定义数据
- 修改 `zodiacData` 对象添加星座信息
- 更新 `horoscopeData` 添加运势内容
- 调整 `compatibilityData` 修改配对规则

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件至项目维护者

---

**注意**: 本服务仅供娱乐参考，星座运势等内容不具有科学依据。