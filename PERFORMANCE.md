# 性能监控与优化指南

## 📊 性能监控系统

本项目集成了完整的性能监控系统，可实时追踪 QPS、响应时间、内存使用等关键指标。

## 🚀 快速开始

### 启动服务（启用性能监控）

```bash
# 开发环境
npm start

# 生产环境
npm run start:prod

# Docker 环境
npm run docker:run
```

### 运行性能测试

```bash
# 单个测试（30秒，10并发）
npm run benchmark

# 完整测试套件
npm run benchmark:suite
```

## 📈 监控指标说明

### 1. QPS (每秒查询数)

- **当前周期 QPS**: 最近统计周期内的平均 QPS
- **平均 QPS**: 服务启动以来的平均 QPS

**性能参考：**
- 优秀: > 100 QPS
- 良好: 50-100 QPS
- 一般: 20-50 QPS
- 较低: < 20 QPS

### 2. 响应时间

- **平均响应时间**: 所有请求的平均耗时
- **P50**: 50% 的请求响应时间
- **P95**: 95% 的请求响应时间
- **P99**: 99% 的请求响应时间

**性能参考：**
- 优秀: < 100ms
- 良好: 100-500ms
- 一般: 500-1000ms
- 较慢: > 1000ms

### 3. 内存使用

- **堆内存**: 已使用 / 总分配
- **RSS**: 进程实际占用的物理内存

**注意事项：**
- 当内存使用超过限制的 90% 时会发出警告
- 系统会自动检测内存泄漏

### 4. 按工具统计

每个工具的独立统计：
- 请求数和错误率
- 平均响应时间
- 最小/最大响应时间

## ⚙️ 配置选项

### 环境变量配置

```bash
# 性能监控
PERFORMANCE_MONITOR=true          # 启用性能监控
PERF_LOG_INTERVAL=10000           # 统计输出间隔（毫秒）
PERF_RESET_INTERVAL=60000         # 统计重置间隔（毫秒）

# 资源限制
MAX_MEMORY_MB=512                 # 最大内存限制（MB）
MAX_CONCURRENT=20                 # 最大并发数

# 限流配置
RATE_LIMIT_ENABLED=true           # 启用限流
MAX_RPS=100                       # 最大每秒请求数
MAX_RPM=1000                      # 最大每分钟请求数

# 日志配置
LOG_LEVEL=info                    # 日志级别
LOG_ERRORS=true                   # 记录错误日志
```

### 配置文件 (config.js)

```javascript
export const config = {
  performance: {
    enabled: true,
    logInterval: 10000,
    resetInterval: 60000,
  },
  resources: {
    maxMemoryMB: 512,
    maxConcurrentRequests: 20
  }
};
```

## 📊 监控报告示例

```
================================================================================
📊 性能监控报告
================================================================================

🚀 QPS (每秒查询数):
   当前周期: 45.23 req/s
   平均: 42.15 req/s

📈 请求统计:
   总请求数: 12543
   成功: 12538 | 失败: 5
   成功率: 99.96%

⏱️  响应时间 (ms):
   平均: 125.34ms
   最小: 23.45ms | 最大: 890.12ms
   P50: 98.23ms | P95: 234.56ms | P99: 456.78ms

💾 内存使用:
   堆内存: 156.23MB / 256.00MB
   RSS: 234.56MB

🔧 按工具统计:
   get_zodiac_info:
     请求数: 4523 | 错误: 2 (0.0%)
     平均耗时: 98.45ms | 范围: 23.45ms - 456.78ms
   get_daily_horoscope:
     请求数: 3421 | 错误: 1 (0.0%)
     平均耗时: 134.56ms | 范围: 45.67ms - 678.90ms

⏰ 运行时间: 5分钟 23秒
================================================================================
```

## 🔧 性能优化建议

### 1. 调整并发数

根据硬件配置调整：

```bash
# 单核 CPU
MAX_CONCURRENT=5

# 双核 CPU
MAX_CONCURRENT=10

# 四核 CPU
MAX_CONCURRENT=20
```

### 2. 内存优化

```bash
# 限制 Node.js 堆内存
node --max-old-space-size=450 index.js

# Docker 环境内存限制
docker run -m 512m star-mcp
```

### 3. 多实例部署

使用 Docker Compose 部署多个实例：

```yaml
services:
  star-mcp:
    deploy:
      replicas: 4
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
```

### 4. 启用缓存

对于频繁查询的数据启用缓存：

```bash
CACHE_ENABLED=true
CACHE_TTL=300000  # 5分钟
```

## 🎯 性能测试

### 基准测试

```bash
# 运行完整测试套件
npm run benchmark:suite
```

测试包括：
1. **基础负载测试**: 5 并发，10秒
2. **中等负载测试**: 10 并发，10秒
3. **高负载测试**: 20 并发，10秒
4. **复杂计算测试**: 上升星座计算，5 并发

### 自定义测试

编辑 `benchmark.js` 自定义测试参数：

```javascript
const benchmark = new Benchmark({
  duration: 30000,      // 测试持续时间
  concurrency: 10,      // 并发数
  toolName: 'get_zodiac_info',
  args: { zodiac: '白羊座' }
});
```

## 📉 故障排查

### 高内存使用

1. 检查内存泄漏警告
2. 查看内存快照
3. 降低并发数
4. 减少缓存大小

```bash
# 查看内存使用趋势
npm run docker:stats
```

### 响应时间慢

1. 检查工具统计找出慢请求
2. 优化慢工具的算法
3. 增加实例数
4. 启用缓存

### QPS 低

1. 增加并发数
2. 部署多个实例
3. 优化代码性能
4. 使用更好的硬件

## 🐳 Docker 性能监控

### 查看容器统计

```bash
# 实时统计
docker stats star-mcp-service

# 查看日志
docker-compose logs -f star-mcp
```

### 资源限制

```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 512M
    reservations:
      cpus: '0.5'
      memory: 256M
```

## 📊 生产环境最佳实践

### 1. 监控配置

```bash
# 启用所有监控功能
PERFORMANCE_MONITOR=true
LOG_LEVEL=info
LOG_ERRORS=true
```

### 2. 资源配置

```bash
# 根据实际负载调整
MAX_MEMORY_MB=512
MAX_CONCURRENT=20
MAX_RPS=100
```

### 3. 高可用部署

- 部署至少 3 个实例
- 使用负载均衡
- 配置健康检查
- 设置自动重启

### 4. 日志收集

```bash
# 持久化日志
docker-compose up -d
docker-compose logs > performance.log
```

## 🔍 监控 API

### 获取实时统计

```javascript
import { getMonitor } from './performance-monitor.js';

const monitor = getMonitor();
const stats = monitor.getStats();

console.log(stats.qps);           // QPS 数据
console.log(stats.requests);      // 请求统计
console.log(stats.responseTime);  // 响应时间
console.log(stats.memory);        // 内存使用
```

### 导出监控数据

```javascript
const exportData = monitor.exportStats();
// 可以发送到外部监控系统
```

## 📝 性能报告

### 定期生成报告

监控系统会每 10 秒输出一次统计报告到 stderr。

### 自定义报告间隔

```bash
PERF_LOG_INTERVAL=30000  # 30秒输出一次
```

## 🎓 性能优化案例

### 案例 1: 提升 QPS 从 30 到 100+

**问题**: 默认配置下 QPS 只有 30

**解决方案**:
1. 增加并发数到 20
2. 部署 4 个实例
3. 启用响应缓存

**结果**: QPS 提升到 120+

### 案例 2: 降低响应时间

**问题**: 上升星座计算响应时间 > 1s

**解决方案**:
1. 优化天文计算算法
2. 添加计算结果缓存
3. 使用更快的数学库

**结果**: 响应时间降低到 200ms

## 🚀 持续优化

- 定期查看性能报告
- 根据实际负载调整配置
- 监控内存使用趋势
- 优化慢查询
- 更新依赖包

## 📧 支持与反馈

如有性能问题或优化建议，请：
- 提交 GitHub Issue
- 附上性能报告截图
- 说明环境配置

