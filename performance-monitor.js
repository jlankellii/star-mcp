#!/usr/bin/env node

/**
 * 性能监控模块
 * 提供 QPS、响应时间、内存使用等监控指标
 */

export class PerformanceMonitor {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.logInterval = options.logInterval || 10000; // 默认10秒输出一次
    this.resetInterval = options.resetInterval || 60000; // 默认60秒重置统计
    
    // 性能指标
    this.metrics = {
      totalRequests: 0,
      successRequests: 0,
      errorRequests: 0,
      requestsByTool: {},
      responseTimes: [],
      startTime: Date.now(),
      lastResetTime: Date.now()
    };
    
    // 内存监控
    this.memorySnapshots = [];
    
    // 定时器
    this.logTimer = null;
    this.resetTimer = null;
    
    if (this.enabled) {
      this.startMonitoring();
    }
  }
  
  /**
   * 开始监控
   */
  startMonitoring() {
    // 定期输出统计信息
    this.logTimer = setInterval(() => {
      this.logStatistics();
    }, this.logInterval);
    
    // 定期重置统计（保留累计数据）
    this.resetTimer = setInterval(() => {
      this.resetStatistics();
    }, this.resetInterval);
    
    console.error('📊 性能监控已启动');
  }
  
  /**
   * 停止监控
   */
  stopMonitoring() {
    if (this.logTimer) {
      clearInterval(this.logTimer);
      this.logTimer = null;
    }
    if (this.resetTimer) {
      clearInterval(this.resetTimer);
      this.resetTimer = null;
    }
    console.error('📊 性能监控已停止');
  }
  
  /**
   * 记录请求开始
   */
  startRequest(toolName) {
    if (!this.enabled) return null;
    
    const requestId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = process.hrtime.bigint();
    
    return {
      requestId,
      toolName,
      startTime,
      startMemory: process.memoryUsage()
    };
  }
  
  /**
   * 记录请求结束
   */
  endRequest(requestContext, success = true) {
    if (!this.enabled || !requestContext) return;
    
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - requestContext.startTime) / 1000000; // 转换为毫秒
    const endMemory = process.memoryUsage();
    
    // 更新统计
    this.metrics.totalRequests++;
    if (success) {
      this.metrics.successRequests++;
    } else {
      this.metrics.errorRequests++;
    }
    
    // 记录响应时间
    this.metrics.responseTimes.push(duration);
    
    // 限制响应时间数组大小
    if (this.metrics.responseTimes.length > 1000) {
      this.metrics.responseTimes.shift();
    }
    
    // 按工具统计
    if (!this.metrics.requestsByTool[requestContext.toolName]) {
      this.metrics.requestsByTool[requestContext.toolName] = {
        count: 0,
        errors: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0
      };
    }
    
    const toolStats = this.metrics.requestsByTool[requestContext.toolName];
    toolStats.count++;
    if (!success) toolStats.errors++;
    toolStats.totalTime += duration;
    toolStats.minTime = Math.min(toolStats.minTime, duration);
    toolStats.maxTime = Math.max(toolStats.maxTime, duration);
    
    // 记录内存快照（如果内存变化显著）
    const memoryDelta = endMemory.heapUsed - requestContext.startMemory.heapUsed;
    if (Math.abs(memoryDelta) > 1024 * 1024) { // 大于1MB的变化
      this.memorySnapshots.push({
        timestamp: Date.now(),
        toolName: requestContext.toolName,
        delta: memoryDelta,
        heapUsed: endMemory.heapUsed,
        heapTotal: endMemory.heapTotal
      });
      
      // 限制快照数量
      if (this.memorySnapshots.length > 100) {
        this.memorySnapshots.shift();
      }
    }
    
    // 如果响应时间过长，记录警告
    if (duration > 1000) { // 超过1秒
      console.error(`⚠️  慢请求警告: ${requestContext.toolName} 耗时 ${duration.toFixed(2)}ms`);
    }
  }
  
  /**
   * 计算统计指标
   */
  calculateStats() {
    const now = Date.now();
    const elapsedSeconds = (now - this.metrics.lastResetTime) / 1000;
    const totalElapsedSeconds = (now - this.metrics.startTime) / 1000;
    
    // 计算 QPS
    const currentQPS = elapsedSeconds > 0 ? this.metrics.totalRequests / elapsedSeconds : 0;
    const averageQPS = totalElapsedSeconds > 0 ? this.metrics.totalRequests / totalElapsedSeconds : 0;
    
    // 计算响应时间统计
    const responseTimes = this.metrics.responseTimes;
    let avgResponseTime = 0;
    let minResponseTime = 0;
    let maxResponseTime = 0;
    let p50ResponseTime = 0;
    let p95ResponseTime = 0;
    let p99ResponseTime = 0;
    
    if (responseTimes.length > 0) {
      avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      minResponseTime = Math.min(...responseTimes);
      maxResponseTime = Math.max(...responseTimes);
      
      // 计算百分位数
      const sorted = [...responseTimes].sort((a, b) => a - b);
      p50ResponseTime = sorted[Math.floor(sorted.length * 0.5)];
      p95ResponseTime = sorted[Math.floor(sorted.length * 0.95)];
      p99ResponseTime = sorted[Math.floor(sorted.length * 0.99)];
    }
    
    // 获取内存使用情况
    const memory = process.memoryUsage();
    
    // 计算成功率
    const successRate = this.metrics.totalRequests > 0 
      ? (this.metrics.successRequests / this.metrics.totalRequests * 100) 
      : 100;
    
    return {
      qps: {
        current: currentQPS,
        average: averageQPS
      },
      requests: {
        total: this.metrics.totalRequests,
        success: this.metrics.successRequests,
        error: this.metrics.errorRequests,
        successRate: successRate
      },
      responseTime: {
        avg: avgResponseTime,
        min: minResponseTime,
        max: maxResponseTime,
        p50: p50ResponseTime,
        p95: p95ResponseTime,
        p99: p99ResponseTime
      },
      memory: {
        heapUsed: memory.heapUsed,
        heapTotal: memory.heapTotal,
        external: memory.external,
        rss: memory.rss,
        heapUsedMB: (memory.heapUsed / 1024 / 1024).toFixed(2),
        heapTotalMB: (memory.heapTotal / 1024 / 1024).toFixed(2)
      },
      uptime: {
        seconds: totalElapsedSeconds,
        formatted: this.formatUptime(totalElapsedSeconds)
      },
      byTool: this.metrics.requestsByTool
    };
  }
  
  /**
   * 输出统计信息
   */
  logStatistics() {
    const stats = this.calculateStats();
    
    console.error('\n' + '='.repeat(80));
    console.error('📊 性能监控报告');
    console.error('='.repeat(80));
    
    console.error('\n🚀 QPS (每秒查询数):');
    console.error(`   当前周期: ${stats.qps.current.toFixed(2)} req/s`);
    console.error(`   平均: ${stats.qps.average.toFixed(2)} req/s`);
    
    console.error('\n📈 请求统计:');
    console.error(`   总请求数: ${stats.requests.total}`);
    console.error(`   成功: ${stats.requests.success} | 失败: ${stats.requests.error}`);
    console.error(`   成功率: ${stats.requests.successRate.toFixed(2)}%`);
    
    console.error('\n⏱️  响应时间 (ms):');
    console.error(`   平均: ${stats.responseTime.avg.toFixed(2)}ms`);
    console.error(`   最小: ${stats.responseTime.min.toFixed(2)}ms | 最大: ${stats.responseTime.max.toFixed(2)}ms`);
    console.error(`   P50: ${stats.responseTime.p50.toFixed(2)}ms | P95: ${stats.responseTime.p95.toFixed(2)}ms | P99: ${stats.responseTime.p99.toFixed(2)}ms`);
    
    console.error('\n💾 内存使用:');
    console.error(`   堆内存: ${stats.memory.heapUsedMB}MB / ${stats.memory.heapTotalMB}MB`);
    console.error(`   RSS: ${(stats.memory.rss / 1024 / 1024).toFixed(2)}MB`);
    
    console.error('\n🔧 按工具统计:');
    for (const [toolName, toolStats] of Object.entries(stats.byTool)) {
      const avgTime = toolStats.count > 0 ? toolStats.totalTime / toolStats.count : 0;
      const errorRate = toolStats.count > 0 ? (toolStats.errors / toolStats.count * 100) : 0;
      console.error(`   ${toolName}:`);
      console.error(`     请求数: ${toolStats.count} | 错误: ${toolStats.errors} (${errorRate.toFixed(1)}%)`);
      console.error(`     平均耗时: ${avgTime.toFixed(2)}ms | 范围: ${toolStats.minTime.toFixed(2)}ms - ${toolStats.maxTime.toFixed(2)}ms`);
    }
    
    console.error(`\n⏰ 运行时间: ${stats.uptime.formatted}`);
    console.error('='.repeat(80) + '\n');
  }
  
  /**
   * 重置统计（保留累计数据）
   */
  resetStatistics() {
    this.metrics.lastResetTime = Date.now();
    this.metrics.responseTimes = [];
    
    // 不重置累计计数器，只重置时间窗口相关的数据
    console.error('🔄 性能统计已重置（累计数据保留）');
  }
  
  /**
   * 获取当前统计数据
   */
  getStats() {
    return this.calculateStats();
  }
  
  /**
   * 导出统计数据（用于外部监控系统）
   */
  exportStats() {
    const stats = this.calculateStats();
    return {
      timestamp: Date.now(),
      ...stats
    };
  }
  
  /**
   * 格式化运行时间
   */
  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}天`);
    if (hours > 0) parts.push(`${hours}小时`);
    if (minutes > 0) parts.push(`${minutes}分钟`);
    parts.push(`${secs}秒`);
    
    return parts.join(' ');
  }
  
  /**
   * 检查内存泄漏
   */
  checkMemoryLeak() {
    if (this.memorySnapshots.length < 10) return null;
    
    const recent = this.memorySnapshots.slice(-10);
    const trend = recent.reduce((acc, snapshot, idx) => {
      if (idx === 0) return acc;
      return acc + (snapshot.heapUsed - recent[idx - 1].heapUsed);
    }, 0);
    
    // 如果内存持续增长超过10MB
    if (trend > 10 * 1024 * 1024) {
      return {
        warning: true,
        message: '检测到可能的内存泄漏',
        trend: `${(trend / 1024 / 1024).toFixed(2)}MB 持续增长`
      };
    }
    
    return null;
  }
}

// 单例模式
let monitorInstance = null;

export function createMonitor(options) {
  if (!monitorInstance) {
    monitorInstance = new PerformanceMonitor(options);
  }
  return monitorInstance;
}

export function getMonitor() {
  return monitorInstance;
}

