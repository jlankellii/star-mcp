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

// 演示数据
const demoCases = [
  {
    title: '🌟 星座信息查询',
    description: '查询白羊座的详细信息',
    tool: 'get_zodiac_info',
    args: { zodiac: '白羊座' }
  },
  {
    title: '🔮 今日运势查询',
    description: '查询狮子座的爱情运势',
    tool: 'get_daily_horoscope',
    args: { zodiac: '狮子座', category: 'love' }
  },
  {
    title: '💕 星座配对分析',
    description: '分析白羊座和狮子座的配对',
    tool: 'get_compatibility',
    args: { zodiac1: '白羊座', zodiac2: '狮子座' }
  },
  {
    title: '📅 生日星座查询',
    description: '根据生日查询对应星座',
    tool: 'get_zodiac_by_date',
    args: { month: 8, day: 15 }
  },
  {
    title: '⭐ 上升星座计算',
    description: '计算1990年8月15日14:30在北京出生的上升星座',
    tool: 'get_rising_sign',
    args: { 
      birthHour: 14, 
      birthMinute: 30, 
      latitude: 39.9042, 
      longitude: 116.4074, 
      birthMonth: 8, 
      birthDay: 15, 
      birthYear: 1990 
    }
  },
  {
    title: '🔍 上升星座信息查询',
    description: '查询上升白羊座的详细信息',
    tool: 'get_rising_sign_info',
    args: { risingSign: '白羊座' }
  }
];

// 模拟 MCP 客户端请求
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
        
        if (jsonLines.length === 0) {
          resolve({ success: false, error: '没有收到有效响应' });
          return;
        }

        for (const line of jsonLines) {
          try {
            const response = JSON.parse(line);
            if (response.result && response.result.content) {
              resolve({ success: true, data: response.result });
              return;
            }
          } catch (e) {
            // 继续解析下一行
          }
        }

        resolve({ success: false, error: '响应格式无效' });
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

    // 发送请求
    setTimeout(() => {
      mcpProcess.stdin.write(JSON.stringify(listRequest) + '\n');
    }, 100);

    setTimeout(() => {
      mcpProcess.stdin.write(JSON.stringify(callRequest) + '\n');
    }, 200);

    // 超时处理
    setTimeout(() => {
      mcpProcess.kill();
      reject(new Error('请求超时'));
    }, 5000);
  });
}

// 运行演示
async function runDemo() {
  console.log('🎭 星座 MCP 服务演示\n');
  console.log('=' * 50);

  for (let i = 0; i < demoCases.length; i++) {
    const demo = demoCases[i];
    console.log(`\n${i + 1}. ${demo.title}`);
    console.log(`📝 ${demo.description}`);
    console.log(`🔧 工具: ${demo.tool}`);
    console.log(`📊 参数: ${JSON.stringify(demo.args)}`);
    
    try {
      const result = await callMCPTool(demo.tool, demo.args);
      
      if (result.success) {
        console.log('✅ 演示成功');
        if (result.data && result.data.content && result.data.content[0]) {
          const text = result.data.content[0].text;
          // 显示前200个字符的预览
          const preview = text.length > 200 ? text.substring(0, 200) + '...' : text;
          console.log(`📄 结果预览:\n${preview}`);
        }
      } else {
        console.log('❌ 演示失败');
        console.log(`错误: ${result.error}`);
      }
    } catch (error) {
      console.log('❌ 演示异常');
      console.log(`错误: ${error.message}`);
    }
    
    console.log('-'.repeat(50));
  }

  console.log('\n🎉 演示完成！');
  console.log('\n📋 功能总结:');
  console.log('• 星座信息查询 - 获取详细星座特征');
  console.log('• 运势查询 - 爱情、事业、健康、财运、综合运势');
  console.log('• 配对分析 - 星座兼容性分析');
  console.log('• 生日查询 - 根据日期确定星座');
  console.log('• 上升星座计算 - 基于出生时间和地点');
  console.log('• 上升星座信息 - 外貌特征和性格分析');
}

// 运行演示
runDemo().catch(console.error); 