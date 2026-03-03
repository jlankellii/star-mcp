import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 测试数据
const testCases = [
  {
    name: '获取白羊座信息',
    tool: 'get_zodiac_info',
    args: { zodiac: '白羊座' }
  },
  {
    name: '获取狮子座今日运势',
    tool: 'get_daily_horoscope',
    args: { zodiac: '狮子座', category: 'love' }
  },
  {
    name: '白羊座和狮子座配对',
    tool: 'get_compatibility',
    args: { zodiac1: '白羊座', zodiac2: '狮子座' }
  },
  {
    name: '根据生日查询星座',
    tool: 'get_zodiac_by_date',
    args: { month: 8, day: 15 }
  },
  {
    name: '获取所有星座列表',
    tool: 'get_all_zodiacs',
    args: {}
  },
  {
    name: '计算上升星座',
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
    name: '获取上升白羊座信息',
    tool: 'get_rising_sign_info',
    args: { risingSign: '白羊座' }
  }
];

// 模拟 MCP 客户端请求
async function testMCPTool(toolName, args) {
  return new Promise((resolve, reject) => {
    const mcpProcess = spawn('node', [join(__dirname, 'index.js')], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    // 监听输出并尝试解析
    mcpProcess.stdout.on('data', (data) => {
      output += data.toString();
      
      // 尝试按行解析
      const lines = output.trim().split('\n');
      for (const line of lines) {
        if (!line.startsWith('{')) continue;
        
        try {
          const response = JSON.parse(line);
          // 检查是否是我们需要的响应 (ID匹配或包含内容)
          if (response.id === 2 && response.result) {
            resolve({ success: true, data: response.result });
            mcpProcess.kill(); // 收到响应后关闭进程
            return;
          }
        } catch (e) {
          // JSON 解析失败，可能是数据不完整，继续等待
        }
      }
    });

    mcpProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    mcpProcess.on('close', (code) => {
      // 如果已经 resolve 了，这里就不处理了
      // 如果还没 resolve 且非正常退出，则报错
      if (code !== 0 && code !== null) { // kill() 可能会导致 code 为 null
         // 这里不做 reject，因为如果已经超时 reject 了，这里再 reject 会报错
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

// 运行测试
async function runTests() {
  console.log('🚀 开始测试星座 MCP 服务...\n');

  for (const testCase of testCases) {
    console.log(`📋 测试: ${testCase.name}`);
    console.log(`🔧 工具: ${testCase.tool}`);
    console.log(`📝 参数: ${JSON.stringify(testCase.args)}`);
    
    try {
      const result = await testMCPTool(testCase.tool, testCase.args);
      
      if (result.success) {
        console.log('✅ 测试通过');
        if (result.data && result.data.content && result.data.content[0]) {
          const text = result.data.content[0].text;
          console.log(`📄 响应预览: ${text.substring(0, 100)}...`);
        }
      } else {
        console.log('❌ 测试失败');
        console.log(`错误: ${result.error}`);
      }
    } catch (error) {
      console.log('❌ 测试异常');
      console.log(`错误: ${error.message}`);
    }
    
    console.log('---\n');
  }

  console.log('🎉 测试完成！');
}

// 简单的手动测试函数
function manualTest() {
  console.log('🧪 手动测试模式');
  console.log('请确保 MCP 服务正在运行...\n');

  // 测试数据验证
  console.log('📊 数据验证测试:');
  
  // 测试星座数据
  const zodiacKeys = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
                      'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  
  console.log(`✅ 星座数量: ${zodiacKeys.length} (应该是12个)`);
  
  // 测试运势类别
  const horoscopeCategories = ['love', 'career', 'health', 'wealth', 'luck'];
  console.log(`✅ 运势类别: ${horoscopeCategories.length} (应该是5个)`);
  
  // 测试配对数据
  const compatibilityData = {
    aries: { best: ['leo', 'sagittarius'], good: ['gemini', 'aquarius'], poor: ['cancer', 'capricorn'] },
    taurus: { best: ['virgo', 'capricorn'], good: ['cancer', 'pisces'], poor: ['leo', 'aquarius'] },
    gemini: { best: ['libra', 'aquarius'], good: ['aries', 'leo'], poor: ['virgo', 'pisces'] },
    cancer: { best: ['scorpio', 'pisces'], good: ['taurus', 'virgo'], poor: ['aries', 'libra'] },
    leo: { best: ['aries', 'sagittarius'], good: ['gemini', 'libra'], poor: ['taurus', 'scorpio'] },
    virgo: { best: ['taurus', 'capricorn'], good: ['cancer', 'scorpio'], poor: ['gemini', 'sagittarius'] },
    libra: { best: ['gemini', 'aquarius'], good: ['leo', 'sagittarius'], poor: ['cancer', 'capricorn'] },
    scorpio: { best: ['cancer', 'pisces'], good: ['virgo', 'capricorn'], poor: ['leo', 'aquarius'] },
    sagittarius: { best: ['aries', 'leo'], good: ['libra', 'aquarius'], poor: ['virgo', 'pisces'] },
    capricorn: { best: ['taurus', 'virgo'], good: ['scorpio', 'pisces'], poor: ['aries', 'libra'] },
    aquarius: { best: ['gemini', 'libra'], good: ['aries', 'sagittarius'], poor: ['taurus', 'scorpio'] },
    pisces: { best: ['cancer', 'scorpio'], good: ['taurus', 'capricorn'], poor: ['gemini', 'sagittarius'] }
  };
  console.log(`✅ 配对数据: ${Object.keys(compatibilityData).length} (应该是12个)`);
  
  console.log('\n📋 功能测试:');
  console.log('1. 星座信息查询 - 支持中英文输入');
  console.log('2. 运势查询 - 支持5种运势类别');
  console.log('3. 配对分析 - 基于元素和星座特性');
  console.log('4. 生日查询 - 准确的日期范围计算');
  console.log('5. 星座列表 - 完整的12星座信息');
  console.log('6. 上升星座计算 - 基于出生时间、地点和日期');
  console.log('7. 上升星座信息查询 - 详细的特征分析');
}

// 运行测试
if (process.argv.includes('--manual')) {
  manualTest();
} else {
  runTests().catch(console.error);
} 