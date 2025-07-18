# 🚀 星座 MCP 服务发布指南

## 第一步：准备 NPM 账户

### 1. 注册 NPM 账户
访问 [npmjs.com](https://www.npmjs.com) 注册账户

### 2. 登录 NPM
```bash
npm login
# 输入你的用户名、密码和邮箱
```

### 3. 验证登录
```bash
npm whoami
# 应该显示你的用户名
```

## 第二步：检查包名可用性

### 1. 检查包名
```bash
npm search star-mcp
# 或者访问 https://www.npmjs.com/package/star-mcp
```

### 2. 如果包名被占用，修改 package.json
```json
{
  "name": "your-username-star-mcp",
  // 或者使用其他唯一名称
}
```

## 第三步：发布到 NPM

### 1. 发布包
```bash
npm publish
```

### 2. 发布为公开包（推荐）
```bash
npm publish --access public
```

### 3. 验证发布
```bash
npm view star-mcp
# 或者访问 https://www.npmjs.com/package/star-mcp
```

## 第四步：提交到 MCP 注册表

### 1. Fork MCP 注册表
访问 [MCP Registry](https://github.com/modelcontextprotocol/registry)
点击 "Fork" 按钮

### 2. 克隆你的 Fork
```bash
git clone https://github.com/YOUR_USERNAME/registry.git
cd registry
```

### 3. 添加服务配置
编辑 `registry.yaml` 文件，添加：

```yaml
servers:
  star-mcp:
    description: "星座 MCP 服务 - 提供星座信息、运势、配对等功能"
    repository: "https://github.com/YOUR_USERNAME/star-mcp"
    author: "YOUR_NAME"
    license: "MIT"
    version: "1.0.0"
    tools:
      - get_zodiac_info
      - get_daily_horoscope
      - get_compatibility
      - get_all_zodiacs
      - get_zodiac_by_date
```

### 4. 提交 Pull Request
```bash
git add registry.yaml
git commit -m "Add star-mcp server"
git push origin main
```

然后在 GitHub 上创建 Pull Request

## 第五步：验证发布

### 1. 安装测试
```bash
npm install -g star-mcp
```

### 2. 功能测试
```bash
# 启动服务
star-mcp

# 在另一个终端测试
node -e "
const { spawn } = require('child_process');
const mcp = spawn('star-mcp');
// 发送测试请求
"
```

### 3. 在 Claude Desktop 中测试
1. 打开 Claude Desktop
2. 添加 MCP 服务器
3. 测试各个工具功能

## 常见问题解决

### Q: npm publish 失败
**A: 检查以下几点：**
- 包名是否唯一
- 是否已登录 NPM
- package.json 格式是否正确
- 是否有 .npmignore 文件

### Q: MCP 注册表拒绝 PR
**A: 检查以下几点：**
- 配置格式是否正确
- 工具名称是否与代码一致
- 仓库链接是否有效
- 许可证是否正确

### Q: 服务无法启动
**A: 检查以下几点：**
- Node.js 版本是否 >= 18
- 依赖是否正确安装
- 端口是否被占用

## 发布检查清单

### ✅ 代码质量
- [ ] 代码符合 MCP 规范
- [ ] 错误处理完善
- [ ] 参数验证正确
- [ ] 响应格式标准

### ✅ 文档完整
- [ ] README.md 详细
- [ ] API 文档清晰
- [ ] 使用示例完整
- [ ] 安装说明准确

### ✅ 测试通过
- [ ] 单元测试通过
- [ ] 功能测试通过
- [ ] 集成测试通过
- [ ] 错误处理测试通过

### ✅ 配置正确
- [ ] package.json 正确
- [ ] mcp-config.json 完整
- [ ] 依赖版本固定
- [ ] 许可证文件存在

## 发布后维护

### 1. 监控使用情况
- 查看 NPM 下载统计
- 关注 GitHub Issues
- 收集用户反馈

### 2. 版本更新
```bash
# 更新版本号
npm version patch  # 补丁版本
npm version minor  # 次要版本
npm version major  # 主要版本

# 发布新版本
npm publish
```

### 3. 问题修复
- 及时响应用户反馈
- 修复 bug 并发布更新
- 保持文档同步更新

## 联系信息

- GitHub: https://github.com/YOUR_USERNAME/star-mcp
- NPM: https://www.npmjs.com/package/star-mcp
- Issues: https://github.com/YOUR_USERNAME/star-mcp/issues

---

**注意**: 发布前请确保所有测试通过，代码质量符合标准。 