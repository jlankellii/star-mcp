#!/usr/bin/env node

/**
 * 星座 MCP 服务演示脚本
 * 展示如何使用星座 MCP 服务的各种功能
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 演示用例
const demos = [
  {
    title: '🌟 白羊座详细信息',
    tool: 'get_zodiac_info',
    args: { zodiac: '白羊座' },
    description: '获取白羊座的完整信息，包括性格特征、守护星等'
  },
  {
    title: '💕 狮子座爱情运势',
    tool: 'get_daily_horoscope',
    args: { zodiac: '狮子座', category: 'love' },
    description: '查询狮子座的今日爱情运势'
  },
  {
    title: '💑 白羊座与狮子座配对',
    tool: 'get_compatibility',
    args: { zodiac1: '白羊座', zodiac2: '狮子座' },
    description: '分析白羊座和狮子座的配对指数'
  },
  {
    title: '🎂 8月15日生日星座',
    tool: 'get_zodiac_by_date',
    args: { month: 8, day: 15 },
    description: '根据生日8月15日查询对应星座'
  },
  {
    title: '📋 所有星座列表',
    tool: 'get_all_zodiacs',
    args: {},
    description: '获取完整的十二星座列表'
  }
];

// 模拟 MCP 客户端
async function callMCPTool(toolName, args) {
  return new Promise((resolve, reject) => {
    const mcpProcess = spawn('node', [join(__dirname, 'index.js')], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    mcpProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    mcpProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    mcpProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`MCP 进程退出，代码: ${code}\n错误: ${errorOutput}`));
        return;
      }

      try {
        const lines = output.trim().split('\n');
        const jsonLines = lines.filter(line => line.startsWith('{'));
        
        for (const line of jsonLines) {
          try {
            const response = JSON.parse(line);
            if (response.result && response.result.content) {
              resolve(response.result.content[0].text);
              return;
            }
          } catch (e) {
            // 继续解析
          }
        }
        
        resolve('未收到有效响应');
      } catch (error) {
        reject(error);
      }
    });

    // 发送工具列表请求
    const listRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    };

    // 发送工具调用请求
    const callRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    };

    setTimeout(() => {
      mcpProcess.stdin.write(JSON.stringify(listRequest) + '\n');
    }, 100);

    setTimeout(() => {
      mcpProcess.stdin.write(JSON.stringify(callRequest) + '\n');
    }, 200);

    setTimeout(() => {
      mcpProcess.kill();
      reject(new Error('请求超时'));
    }, 10000);
  });
}

// 运行演示
async function runDemo() {
  console.log('🔮 星座 MCP 服务演示\n');
  console.log('=' .repeat(50));
  
  for (let i = 0; i < demos.length; i++) {
    const demo = demos[i];
    console.log(`\n${i + 1}. ${demo.title}`);
    console.log(`📝 ${demo.description}`);
    console.log(`🔧 工具: ${demo.tool}`);
    console.log(`📋 参数: ${JSON.stringify(demo.args)}`);
    console.log('-'.repeat(50));
    
    try {
      const result = await callMCPTool(demo.tool, demo.args);
      console.log('✅ 结果:');
      console.log(result);
    } catch (error) {
      console.log('❌ 错误:');
      console.log(error.message);
    }
    
    console.log('\n' + '='.repeat(50));
    
    // 等待一下再执行下一个演示
    if (i < demos.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n🎉 演示完成！');
  console.log('\n📚 使用说明:');
  console.log('1. 启动服务: node index.js');
  console.log('2. 在另一个终端运行: node demo.js');
  console.log('3. 或者直接运行: npm test');
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo().catch(console.error);
}

export { runDemo, callMCPTool }; 