#!/usr/bin/env node

/**
 * 配置文件
 * 统一管理服务配置
 */

export const config = {
  // 性能监控配置
  performance: {
    enabled: process.env.PERFORMANCE_MONITOR !== 'false',
    logInterval: parseInt(process.env.PERF_LOG_INTERVAL) || 10000, // 10秒
    resetInterval: parseInt(process.env.PERF_RESET_INTERVAL) || 60000, // 60秒
  },
  
  // 服务配置
  service: {
    name: 'star-mcp',
    version: '2.2.1',
    env: process.env.NODE_ENV || 'development'
  },
  
  // 限流配置
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED === 'true',
    maxRequestsPerSecond: parseInt(process.env.MAX_RPS) || 100,
    maxRequestsPerMinute: parseInt(process.env.MAX_RPM) || 1000
  },
  
  // 缓存配置
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true',
    ttl: parseInt(process.env.CACHE_TTL) || 300000, // 5分钟
    maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 1000
  },
  
  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableRequestLog: process.env.LOG_REQUESTS === 'true',
    enableErrorLog: process.env.LOG_ERRORS !== 'false'
  },
  
  // 资源限制
  resources: {
    maxMemoryMB: parseInt(process.env.MAX_MEMORY_MB) || 512,
    maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT) || 10
  }
};

// 验证配置
export function validateConfig() {
  const warnings = [];
  
  if (config.resources.maxMemoryMB < 128) {
    warnings.push('⚠️  内存限制过低，建议至少 128MB');
  }
  
  if (config.rateLimit.maxRequestsPerSecond > 1000) {
    warnings.push('⚠️  QPS 限制过高，可能影响性能');
  }
  
  if (warnings.length > 0) {
    console.error('\n配置警告:');
    warnings.forEach(w => console.error(w));
    console.error('');
  }
  
  return warnings.length === 0;
}

// 打印配置信息
export function printConfig() {
  console.error('\n' + '='.repeat(60));
  console.error('⚙️  服务配置');
  console.error('='.repeat(60));
  console.error(`服务名称: ${config.service.name}`);
  console.error(`版本: ${config.service.version}`);
  console.error(`环境: ${config.service.env}`);
  console.error(`性能监控: ${config.performance.enabled ? '启用' : '禁用'}`);
  console.error(`限流: ${config.rateLimit.enabled ? '启用' : '禁用'}`);
  console.error(`缓存: ${config.cache.enabled ? '启用' : '禁用'}`);
  console.error(`最大内存: ${config.resources.maxMemoryMB}MB`);
  console.error(`最大并发: ${config.resources.maxConcurrentRequests}`);
  console.error('='.repeat(60) + '\n');
}

