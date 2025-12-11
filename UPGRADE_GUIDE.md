# 升级指南 v2.2.1 → v2.3.0

## 🎉 新版本亮点

版本 **2.3.0** 引入了完整的性能监控和优化系统！

### 主要新增功能

✅ **性能监控系统** - 实时追踪 QPS、响应时间、内存使用
✅ **性能测试工具** - 完整的压测和基准测试套件
✅ **配置管理** - 统一的配置管理和环境变量支持
✅ **Docker 优化** - 多阶段构建和资源限制
✅ **完整文档** - 详细的性能监控和优化指南

## 📦 升级步骤

### 1. 更新代码

```bash
# 如果是 git 仓库
git pull origin main

# 或者重新克隆
git clone <your-repo-url>
cd star
```

### 2. 安装依赖

```bash
npm install
```

> 注意：新版本没有增加新的外部依赖，所有功能都是内置的！

### 3. 配置环境变量（可选）

```bash
# 复制示例配置
cp env.example .env

# 编辑配置
nano .env
```

### 4. 启动服务

```bash
# 直接启动（性能监控默认启用）
npm start

# 或生产模式
npm run start:prod
```

## 🆕 新增文件

```
performance-monitor.js      # 性能监控核心模块
config.js                   # 配置管理模块
benchmark.js                # 性能测试脚本
env.example                 # 环境变量示例
PERFORMANCE.md              # 完整文档
QUICKSTART_PERFORMANCE.md   # 快速入门
PERFORMANCE_SUMMARY.md      # 功能总结
UPGRADE_GUIDE.md            # 本文档
```

## 🔄 变更说明

### index.js 变更

**新增导入：**
```javascript
import { createMonitor } from './performance-monitor.js';
import { config, validateConfig, printConfig } from './config.js';
```

**初始化代码：**
```javascript
// 初始化配置和监控
validateConfig();
printConfig();
const monitor = createMonitor({...});
```

**请求处理变更：**
```javascript
// 每个请求现在都会被监控
const requestContext = monitor.startRequest(name);
// ... 处理请求 ...
monitor.endRequest(requestContext, success);
```

**新增优雅关闭：**
```javascript
process.on('SIGINT', () => {
  monitor.stopMonitoring();
  monitor.logStatistics();
  process.exit(0);
});
```

### package.json 变更

**版本更新：**
```json
"version": "2.3.0"
```

**新增脚本：**
```json
"start:prod": "NODE_ENV=production PERFORMANCE_MONITOR=true node index.js",
"benchmark": "node benchmark.js",
"benchmark:suite": "node benchmark.js --suite",
"docker:build": "docker build -t star-mcp:latest .",
"docker:run": "docker-compose up -d",
"docker:stop": "docker-compose down",
"docker:logs": "docker-compose logs -f",
"docker:stats": "docker stats star-mcp-service"
```

### Dockerfile 变更

- 采用多阶段构建
- 添加 dumb-init
- 优化内存配置
- 改进健康检查

### docker-compose.yml 变更

- 添加资源限制
- 完整环境变量配置
- 添加健康检查
- 支持多实例部署

## ⚙️ 配置迁移

### 环境变量配置（新增）

如果需要自定义配置，创建 `.env` 文件：

```bash
# 基础配置
NODE_ENV=production
PERFORMANCE_MONITOR=true

# 资源限制
MAX_MEMORY_MB=512
MAX_CONCURRENT=20

# 监控配置
PERF_LOG_INTERVAL=10000
PERF_RESET_INTERVAL=60000

# 限流配置
RATE_LIMIT_ENABLED=true
MAX_RPS=100
MAX_RPM=1000
```

## 🔍 兼容性说明

### 向后兼容

✅ **完全兼容** - 所有现有功能保持不变
✅ **API 不变** - MCP 工具接口完全相同
✅ **数据格式不变** - 返回数据格式保持一致

### 新增功能

- 所有监控功能都是**可选的**
- 默认启用，但可以通过 `PERFORMANCE_MONITOR=false` 禁用
- 监控对性能影响 < 1%

## 📊 验证升级

### 1. 功能测试

```bash
# 运行原有测试
npm test

# 应该看到所有测试通过
```

### 2. 性能测试

```bash
# 运行性能测试
npm run benchmark

# 查看性能报告
```

### 3. 监控验证

启动服务后，应该看到：

```
⚙️  服务配置
性能监控: 启用
最大内存: 512MB
最大并发: 20

📊 性能监控已启动
✨ 星座 MCP 服务已启动
```

每 10 秒会输出性能报告：

```
📊 性能监控报告
🚀 QPS (每秒查询数): ...
📈 请求统计: ...
⏱️  响应时间: ...
💾 内存使用: ...
```

## 🐛 故障排查

### 问题 1: 性能监控未启动

**症状**: 没有看到性能报告输出

**解决**:
```bash
# 确认环境变量
PERFORMANCE_MONITOR=true npm start
```

### 问题 2: 内存使用增加

**症状**: 内存使用比之前高

**原因**: 监控系统会保存少量统计数据

**影响**: 通常增加 < 10MB

**解决**: 如果内存受限，可以禁用监控或减少统计窗口：
```bash
PERF_RESET_INTERVAL=30000 npm start
```

### 问题 3: 日志输出太多

**症状**: stderr 输出频繁

**解决**:
```bash
# 增加输出间隔
PERF_LOG_INTERVAL=30000 npm start

# 或禁用监控
PERFORMANCE_MONITOR=false npm start
```

## 🚀 推荐使用方式

### 开发环境

```bash
# 启用监控，快速发现性能问题
npm start
```

### 测试环境

```bash
# 运行完整测试套件
npm test
npm run benchmark:suite
```

### 生产环境

```bash
# 使用 Docker 部署
docker-compose up -d

# 查看日志
docker-compose logs -f

# 监控资源使用
docker stats star-mcp-service
```

## 📚 学习资源

- [性能监控完整文档](./PERFORMANCE.md)
- [快速入门指南](./QUICKSTART_PERFORMANCE.md)
- [功能总结](./PERFORMANCE_SUMMARY.md)

## 💬 反馈与支持

如遇到问题或有建议：
- 提交 GitHub Issue
- 附上错误信息和配置
- 提供性能报告截图

## 🎯 下一步

1. ✅ 启动服务验证功能正常
2. ✅ 运行性能测试了解基线
3. ✅ 阅读文档了解高级功能
4. ✅ 根据需要调整配置
5. ✅ 部署到生产环境

---

**欢迎使用 Star MCP v2.3.0！** 🌟

