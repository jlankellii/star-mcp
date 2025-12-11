# 星座 MCP 服务 (Star MCP)

一个功能完整的星座 MCP (Model Context Protocol) 服务，提供星座信息查询、运势分析、配对测试等功能。

## 功能特性

### 🌟 核心功能
- **星座信息查询**: 获取12星座的详细信息，包括性格特征、守护星、元素等
- **今日运势**: 提供爱情、事业、健康、财运、综合运势查询
- **星座配对**: 分析两个星座的配对指数和关系
- **生日星座**: 根据出生日期自动确定星座
- **上升星座计算**: 基于准确天文算法的上升星座计算，包含儒略日、恒星时等详细数据
- **上升星座信息**: 获取上升星座的详细特征分析，包括外貌特征和性格特点
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

### 6. 计算上升星座
```javascript
{
  name: 'get_rising_sign',
  arguments: {
    birthHour: 14,        // 出生小时 (0-23)
    birthMinute: 30,      // 出生分钟 (0-59)
    latitude: 39.9042,    // 出生地纬度 (-90到90)
    longitude: 116.4074,  // 出生地经度 (-180到180)
    birthMonth: 8,        // 出生月份 (1-12)
    birthDay: 15,         // 出生日期 (1-31)
    birthYear: 1990       // 出生年份 (1900-2100)
  }
}
```

**计算算法说明:**
上升星座计算基于准确的天文算法，包括：
- 儒略日计算 (Julian Day)
- 格林威治恒星时计算 (Greenwich Sidereal Time)
- 地方恒星时计算 (Local Sidereal Time)
- 上升点黄经计算 (Ascendant)
- 星座边界确定

返回结果包含详细的天文计算数据，确保计算准确性。

### 7. 获取上升星座信息
```javascript
{
  name: 'get_rising_sign_info',
  arguments: {
    risingSign: '白羊座' // 或 'aries'
  }
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

## 性能监控

本项目集成了完整的性能监控系统，实时追踪服务性能指标。

### 监控功能
- ✅ **QPS 监控**: 实时每秒查询数统计
- ✅ **响应时间**: P50/P95/P99 百分位统计
- ✅ **内存监控**: 堆内存使用和泄漏检测
- ✅ **按工具统计**: 每个工具的独立性能指标
- ✅ **错误追踪**: 失败率和错误统计

### 快速使用

```bash
# 启动服务（自动启用监控）
npm start

# 运行性能测试
npm run benchmark

# 运行完整测试套件
npm run benchmark:suite
```

详细文档请查看 [PERFORMANCE.md](./PERFORMANCE.md)

## 技术栈

- **Node.js**: 运行时环境
- **MCP SDK**: Model Context Protocol 官方 SDK
- **ES Modules**: 使用现代 JavaScript 模块系统
- **性能监控**: 内置高精度性能监控系统

## 项目结构

```
star/
├── index.js                    # 主服务文件
├── performance-monitor.js      # 性能监控模块
├── config.js                   # 配置管理
├── benchmark.js                # 性能测试脚本
├── package.json                # 项目配置
├── Dockerfile                  # Docker 配置
├── docker-compose.yml          # Docker Compose 配置
├── README.md                   # 项目文档
├── PERFORMANCE.md              # 性能监控文档
├── RISING_SIGN_GUIDE.md        # 上升星座计算使用指南
├── test.js                     # 测试文件
├── demo.js                     # 演示文件
└── env.example                 # 环境变量示例
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
- 修改 `risingSignData` 调整上升星座特征

### 上升星座计算
- 算法基于标准天文计算
- 支持1900-2100年间的日期
- 包含详细的天文数据输出
- 提供错误处理和备用算法

详细使用说明请参考 [RISING_SIGN_GUIDE.md](./RISING_SIGN_GUIDE.md)

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