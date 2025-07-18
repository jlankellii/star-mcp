# 星座 MCP 服务发布指南

本指南将帮助你将星座 MCP 服务发布到 MCP 市场。

## 发布前检查清单

### ✅ 代码质量
- [ ] 代码符合 MCP 规范
- [ ] 错误处理完善
- [ ] 日志记录适当
- [ ] 代码注释清晰

### ✅ 功能测试
- [ ] 所有工具功能正常
- [ ] 参数验证正确
- [ ] 响应格式标准
- [ ] 边界情况处理

### ✅ 文档完整
- [ ] README.md 详细
- [ ] API 文档清晰
- [ ] 使用示例完整
- [ ] 安装说明准确

### ✅ 配置文件
- [ ] package.json 正确
- [ ] mcp-config.json 完整
- [ ] 依赖版本固定
- [ ] 许可证文件存在

## 发布步骤

### 1. 准备代码仓库

```bash
# 确保代码是最新版本
git add .
git commit -m "准备发布星座 MCP 服务 v1.0.0"
git tag v1.0.0
git push origin main --tags
```

### 2. 测试服务

```bash
# 运行所有测试
npm test

# 运行演示
npm run demo

# 手动测试
npm run test:manual
```

### 3. 构建和打包

```bash
# 安装生产依赖
npm ci --only=production

# 验证服务启动
npm start
```

### 4. 发布到 NPM

```bash
# 登录 NPM
npm login

# 发布包
npm publish

# 或者发布为公开包
npm publish --access public
```

### 5. 提交到 MCP 注册表

1. 访问 [MCP 注册表](https://github.com/modelcontextprotocol/registry)
2. 创建 Pull Request
3. 添加你的服务配置
4. 等待审核和合并

## MCP 注册表配置示例

在你的 Pull Request 中，添加以下配置：

```yaml
# registry.yaml
servers:
  star-mcp:
    description: "星座 MCP 服务 - 提供星座信息、运势、配对等功能"
    repository: "https://github.com/yourusername/star-mcp"
    author: "Your Name"
    license: "MIT"
    version: "1.0.0"
    tools:
      - get_zodiac_info
      - get_daily_horoscope
      - get_compatibility
      - get_all_zodiacs
      - get_zodiac_by_date
```

## 发布后验证

### 1. 安装测试
```bash
# 从 NPM 安装
npm install -g star-mcp

# 验证安装
star-mcp --help
```

### 2. 功能验证
```bash
# 测试各个工具
node -e "
const { callMCPTool } = require('./demo.js');
callMCPTool('get_zodiac_info', { zodiac: '白羊座' })
  .then(console.log)
  .catch(console.error);
"
```

### 3. 集成测试
- 在 Claude Desktop 中测试
- 在其他 MCP 客户端中测试
- 验证错误处理

## 维护和更新

### 版本更新
1. 更新 `package.json` 中的版本号
2. 更新 `mcp-config.json` 中的版本号
3. 更新 `README.md` 中的版本信息
4. 创建新的 Git 标签
5. 发布新版本

### 问题修复
1. 创建 Issue 描述问题
2. 修复代码
3. 添加测试用例
4. 更新文档
5. 发布补丁版本

## 常见问题

### Q: 发布失败怎么办？
A: 检查 NPM 登录状态、包名是否冲突、版本号是否正确。

### Q: MCP 注册表拒绝了我的提交？
A: 检查配置格式、工具描述、许可证等是否符合要求。

### Q: 用户报告了问题？
A: 及时响应用户反馈，修复问题并发布更新。

## 联系信息

- GitHub: https://github.com/yourusername/star-mcp
- Issues: https://github.com/yourusername/star-mcp/issues
- Email: your.email@example.com

---

**注意**: 发布前请确保所有测试通过，代码质量符合标准。 