#!/usr/bin/env node

/**
 * 性能测试脚本
 * 用于测试服务的 QPS 和响应时间
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Benchmark {
  constructor(options = {}) {
    this.duration = options.duration || 30000; // 测试持续时间（毫秒）
    this.concurrency = options.concurrency || 10; // 并发数
    this.toolName = options.toolName || 'get_zodiac_info';
    this.args = options.args || { zodiac: '白羊座' };
    
    this.results = {
      totalRequests: 0,
      successRequests: 0,
      errorRequests: 0,
      responseTimes: [],
      startTime: null,
      endTime: null
    };
  }
  
  /**
   * 单次请求
   */
  async makeRequest() {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const mcpProcess = spawn('node', [join(__dirname, 'index.js')], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          PERFORMANCE_MONITOR: 'false' // 禁用性能监控避免干扰测试
        }
      });
      
      let output = '';
      let hasResponse = false;
      
      mcpProcess.stdout.on('data', (data) => {
        output += data.toString();
        
        // 尝试解析响应
        if (!hasResponse) {
          const lines = output.split('\n');
          for (const line of lines) {
            if (line.startsWith('{')) {
              try {
                const response = JSON.parse(line);
                if (response.result && response.result.content) {
                  hasResponse = true;
                  const duration = Date.now() - startTime;
                  mcpProcess.kill();
                  resolve({ success: true, duration });
                  return;
                }
              } catch (e) {
                // 继续等待
              }
            }
          }
        }
      });
      
      mcpProcess.stderr.on('data', () => {
        // 忽略stderr输出
      });
      
      mcpProcess.on('close', () => {
        if (!hasResponse) {
          resolve({ success: false, duration: Date.now() - startTime });
        }
      });
      
      // 发送请求
      const request = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: this.toolName,
          arguments: this.args
        }
      };
      
      setTimeout(() => {
        mcpProcess.stdin.write(JSON.stringify(request) + '\n');
      }, 100);
      
      // 超时处理
      setTimeout(() => {
        if (!hasResponse) {
          mcpProcess.kill();
          resolve({ success: false, duration: Date.now() - startTime });
        }
      }, 5000);
    });
  }
  
  /**
   * 并发执行请求
   */
  async runConcurrent() {
    const promises = [];
    for (let i = 0; i < this.concurrency; i++) {
      promises.push(this.runWorker());
    }
    await Promise.all(promises);
  }
  
  /**
   * 单个工作线程
   */
  async runWorker() {
    const endTime = Date.now() + this.duration;
    
    while (Date.now() < endTime) {
      const result = await this.makeRequest();
      
      this.results.totalRequests++;
      if (result.success) {
        this.results.successRequests++;
        this.results.responseTimes.push(result.duration);
      } else {
        this.results.errorRequests++;
      }
      
      // 显示进度
      if (this.results.totalRequests % 10 === 0) {
        this.printProgress();
      }
    }
  }
  
  /**
   * 运行测试
   */
  async run() {
    console.log('🚀 性能测试开始...\n');
    console.log('=' .repeat(60));
    console.log(`工具: ${this.toolName}`);
    console.log(`参数: ${JSON.stringify(this.args)}`);
    console.log(`持续时间: ${this.duration / 1000}秒`);
    console.log(`并发数: ${this.concurrency}`);
    console.log('='.repeat(60) + '\n');
    
    this.results.startTime = Date.now();
    
    await this.runConcurrent();
    
    this.results.endTime = Date.now();
    
    this.printResults();
  }
  
  /**
   * 打印进度
   */
  printProgress() {
    const elapsed = (Date.now() - this.results.startTime) / 1000;
    const qps = this.results.totalRequests / elapsed;
    process.stdout.write(`\r📊 已完成: ${this.results.totalRequests} 请求 | QPS: ${qps.toFixed(2)} | 成功率: ${(this.results.successRequests / this.results.totalRequests * 100).toFixed(1)}%`);
  }
  
  /**
   * 打印结果
   */
  printResults() {
    const duration = (this.results.endTime - this.results.startTime) / 1000;
    const qps = this.results.totalRequests / duration;
    const successRate = this.results.totalRequests > 0 
      ? (this.results.successRequests / this.results.totalRequests * 100) 
      : 0;
    
    // 计算响应时间统计
    const responseTimes = this.results.responseTimes;
    let avgResponseTime = 0;
    let minResponseTime = 0;
    let maxResponseTime = 0;
    let p50, p95, p99;
    
    if (responseTimes.length > 0) {
      avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      minResponseTime = Math.min(...responseTimes);
      maxResponseTime = Math.max(...responseTimes);
      
      const sorted = [...responseTimes].sort((a, b) => a - b);
      p50 = sorted[Math.floor(sorted.length * 0.5)];
      p95 = sorted[Math.floor(sorted.length * 0.95)];
      p99 = sorted[Math.floor(sorted.length * 0.99)];
    }
    
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 性能测试结果');
    console.log('='.repeat(60));
    
    console.log('\n🚀 吞吐量:');
    console.log(`   总请求数: ${this.results.totalRequests}`);
    console.log(`   成功: ${this.results.successRequests} | 失败: ${this.results.errorRequests}`);
    console.log(`   成功率: ${successRate.toFixed(2)}%`);
    console.log(`   QPS: ${qps.toFixed(2)} 请求/秒`);
    
    console.log('\n⏱️  响应时间:');
    console.log(`   平均: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`   最小: ${minResponseTime.toFixed(2)}ms`);
    console.log(`   最大: ${maxResponseTime.toFixed(2)}ms`);
    console.log(`   P50: ${p50?.toFixed(2)}ms`);
    console.log(`   P95: ${p95?.toFixed(2)}ms`);
    console.log(`   P99: ${p99?.toFixed(2)}ms`);
    
    console.log('\n⚙️  测试配置:');
    console.log(`   测试时长: ${duration.toFixed(2)}秒`);
    console.log(`   并发数: ${this.concurrency}`);
    
    console.log('\n' + '='.repeat(60));
    
    // 性能评估
    console.log('\n📈 性能评估:');
    if (qps > 100) {
      console.log('   ✅ QPS 优秀 (>100)');
    } else if (qps > 50) {
      console.log('   ✅ QPS 良好 (50-100)');
    } else if (qps > 20) {
      console.log('   ⚠️  QPS 一般 (20-50)');
    } else {
      console.log('   ❌ QPS 较低 (<20)');
    }
    
    if (avgResponseTime < 100) {
      console.log('   ✅ 响应时间优秀 (<100ms)');
    } else if (avgResponseTime < 500) {
      console.log('   ✅ 响应时间良好 (100-500ms)');
    } else if (avgResponseTime < 1000) {
      console.log('   ⚠️  响应时间一般 (500-1000ms)');
    } else {
      console.log('   ❌ 响应时间较慢 (>1000ms)');
    }
    
    if (successRate > 99) {
      console.log('   ✅ 可靠性优秀 (>99%)');
    } else if (successRate > 95) {
      console.log('   ✅ 可靠性良好 (95-99%)');
    } else if (successRate > 90) {
      console.log('   ⚠️  可靠性一般 (90-95%)');
    } else {
      console.log('   ❌ 可靠性较低 (<90%)');
    }
    
    console.log('\n');
  }
}

// 运行测试套件
async function runTestSuite() {
  console.log('🎯 开始性能测试套件\n');
  
  const testCases = [
    {
      name: '基础负载测试',
      duration: 10000,
      concurrency: 5,
      toolName: 'get_zodiac_info',
      args: { zodiac: '白羊座' }
    },
    {
      name: '中等负载测试',
      duration: 10000,
      concurrency: 10,
      toolName: 'get_daily_horoscope',
      args: { zodiac: '狮子座', category: 'love' }
    },
    {
      name: '高负载测试',
      duration: 10000,
      concurrency: 20,
      toolName: 'get_compatibility',
      args: { zodiac1: '白羊座', zodiac2: '狮子座' }
    },
    {
      name: '复杂计算测试',
      duration: 10000,
      concurrency: 5,
      toolName: 'get_rising_sign',
      args: {
        birthHour: 14,
        birthMinute: 30,
        latitude: 39.9042,
        longitude: 116.4074,
        birthMonth: 8,
        birthDay: 15,
        birthYear: 1990
      }
    }
  ];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`测试 ${i + 1}/${testCases.length}: ${testCase.name}`);
    console.log('='.repeat(60));
    
    const benchmark = new Benchmark(testCase);
    await benchmark.run();
    
    // 等待一会儿再进行下一个测试
    if (i < testCases.length - 1) {
      console.log('\n⏳ 等待 3 秒后继续...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n✅ 性能测试套件完成！\n');
}

// 解析命令行参数
const args = process.argv.slice(2);
const isSuite = args.includes('--suite');

if (isSuite) {
  runTestSuite().catch(console.error);
} else {
  // 单个测试
  const benchmark = new Benchmark({
    duration: 30000,
    concurrency: 10,
    toolName: 'get_zodiac_info',
    args: { zodiac: '白羊座' }
  });
  
  benchmark.run().catch(console.error);
}

