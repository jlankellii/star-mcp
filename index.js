#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  TextContent,
  ImageContent,
  EmbeddedResource
} from '@modelcontextprotocol/sdk/types.js';

// 星座数据
const zodiacData = {
  aries: {
    name: '白羊座',
    english: 'Aries',
    element: '火',
    quality: '基本',
    ruler: '火星',
    symbol: '♈',
    dateRange: '3月21日-4月19日',
    traits: ['勇敢', '热情', '冲动', '领导力', '冒险'],
    description: '白羊座是黄道十二宫的第一宫，象征着春天的开始。白羊座的人通常充满活力，勇敢无畏，喜欢挑战和冒险。'
  },
  taurus: {
    name: '金牛座',
    english: 'Taurus',
    element: '土',
    quality: '固定',
    ruler: '金星',
    symbol: '♉',
    dateRange: '4月20日-5月20日',
    traits: ['稳重', '务实', '耐心', '忠诚', '享受'],
    description: '金牛座是黄道十二宫的第二宫，象征着稳定和物质享受。金牛座的人通常稳重可靠，重视安全和舒适。'
  },
  gemini: {
    name: '双子座',
    english: 'Gemini',
    element: '风',
    quality: '变动',
    ruler: '水星',
    symbol: '♊',
    dateRange: '5月21日-6月21日',
    traits: ['灵活', '好奇', '善变', '沟通', '学习'],
    description: '双子座是黄道十二宫的第三宫，象征着沟通和学习。双子座的人通常思维敏捷，善于表达，好奇心强。'
  },
  cancer: {
    name: '巨蟹座',
    english: 'Cancer',
    element: '水',
    quality: '基本',
    ruler: '月亮',
    symbol: '♋',
    dateRange: '6月22日-7月22日',
    traits: ['敏感', '保护', '家庭', '直觉', '情感'],
    description: '巨蟹座是黄道十二宫的第四宫，象征着家庭和情感。巨蟹座的人通常情感丰富，重视家庭，具有很强的保护欲。'
  },
  leo: {
    name: '狮子座',
    english: 'Leo',
    element: '火',
    quality: '固定',
    ruler: '太阳',
    symbol: '♌',
    dateRange: '7月23日-8月22日',
    traits: ['自信', '慷慨', '领导', '戏剧性', '忠诚'],
    description: '狮子座是黄道十二宫的第五宫，象征着创造力和自我表达。狮子座的人通常自信大方，具有天生的领导才能。'
  },
  virgo: {
    name: '处女座',
    english: 'Virgo',
    element: '土',
    quality: '变动',
    ruler: '水星',
    symbol: '♍',
    dateRange: '8月23日-9月22日',
    traits: ['完美', '分析', '服务', '谦虚', '实用'],
    description: '处女座是黄道十二宫的第六宫，象征着服务和完美。处女座的人通常注重细节，追求完美，具有很强的分析能力。'
  },
  libra: {
    name: '天秤座',
    english: 'Libra',
    element: '风',
    quality: '基本',
    ruler: '金星',
    symbol: '♎',
    dateRange: '9月23日-10月23日',
    traits: ['平衡', '和谐', '公正', '社交', '优雅'],
    description: '天秤座是黄道十二宫的第七宫，象征着关系和平衡。天秤座的人通常追求和谐，重视公平，具有很强的社交能力。'
  },
  scorpio: {
    name: '天蝎座',
    english: 'Scorpio',
    element: '水',
    quality: '固定',
    ruler: '冥王星',
    symbol: '♏',
    dateRange: '10月24日-11月22日',
    traits: ['神秘', '强烈', '洞察', '忠诚', '激情'],
    description: '天蝎座是黄道十二宫的第八宫，象征着深度和转化。天蝎座的人通常神秘深邃，洞察力强，情感强烈。'
  },
  sagittarius: {
    name: '射手座',
    english: 'Sagittarius',
    element: '火',
    quality: '变动',
    ruler: '木星',
    symbol: '♐',
    dateRange: '11月23日-12月21日',
    traits: ['乐观', '自由', '冒险', '哲学', '诚实'],
    description: '射手座是黄道十二宫的第九宫，象征着探索和智慧。射手座的人通常乐观开朗，热爱自由，追求真理。'
  },
  capricorn: {
    name: '摩羯座',
    english: 'Capricorn',
    element: '土',
    quality: '基本',
    ruler: '土星',
    symbol: '♑',
    dateRange: '12月22日-1月19日',
    traits: ['野心', '责任', '耐心', '实用', '纪律'],
    description: '摩羯座是黄道十二宫的第十宫，象征着事业和成就。摩羯座的人通常有野心，责任感强，追求成功。'
  },
  aquarius: {
    name: '水瓶座',
    english: 'Aquarius',
    element: '风',
    quality: '固定',
    ruler: '天王星',
    symbol: '♒',
    dateRange: '1月20日-2月18日',
    traits: ['独立', '创新', '人道', '理性', '独特'],
    description: '水瓶座是黄道十二宫的第十一宫，象征着友谊和理想。水瓶座的人通常独立特行，富有创新精神，关心人类福祉。'
  },
  pisces: {
    name: '双鱼座',
    english: 'Pisces',
    element: '水',
    quality: '变动',
    ruler: '海王星',
    symbol: '♓',
    dateRange: '2月19日-3月20日',
    traits: ['同情', '直觉', '艺术', '梦想', '灵性'],
    description: '双鱼座是黄道十二宫的第十二宫，象征着灵性和梦想。双鱼座的人通常富有同情心，直觉敏锐，具有艺术天赋。'
  }
};

// 运势数据
const horoscopeData = {
  love: ['桃花运旺盛，单身者有机会遇到心仪对象', '感情稳定，与伴侣关系更加亲密', '需要多沟通，避免误解', '适合表白或求婚', '注意控制情绪，避免冲动'],
  career: ['工作顺利，有升职加薪的机会', '适合学习新技能，提升竞争力', '团队合作良好，项目进展顺利', '需要更加努力，克服困难', '保持耐心，等待时机'],
  health: ['身体状况良好，适合运动健身', '注意休息，避免过度劳累', '饮食要规律，多吃蔬果', '保持心情愉悦，减少压力', '定期体检，预防疾病'],
  wealth: ['财运不错，可能有意外收获', '投资需谨慎，避免冒险', '适合储蓄，为未来做准备', '避免冲动消费，理性理财', '合作项目有利可图'],
  luck: ['幸运指数高，适合尝试新事物', '贵人运旺，得到他人帮助', '保持积极心态，好运自然来', '避免冒险，稳中求进', '耐心等待，时机未到']
};

// 星座配对数据
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

// 工具定义
const tools = [
  {
    name: 'get_zodiac_info',
    description: '获取指定星座的详细信息，包括性格特征、守护星、元素等',
    inputSchema: {
      type: 'object',
      properties: {
        zodiac: {
          type: 'string',
          description: '星座名称（中文或英文）',
          enum: Object.keys(zodiacData).concat(Object.values(zodiacData).map(z => z.name))
        }
      },
      required: ['zodiac']
    }
  },
  {
    name: 'get_daily_horoscope',
    description: '获取指定星座的今日运势',
    inputSchema: {
      type: 'object',
      properties: {
        zodiac: {
          type: 'string',
          description: '星座名称（中文或英文）',
          enum: Object.keys(zodiacData).concat(Object.values(zodiacData).map(z => z.name))
        },
        category: {
          type: 'string',
          description: '运势类别',
          enum: ['love', 'career', 'health', 'wealth', 'luck'],
          default: 'luck'
        }
      },
      required: ['zodiac']
    }
  },
  {
    name: 'get_compatibility',
    description: '获取两个星座的配对指数和关系分析',
    inputSchema: {
      type: 'object',
      properties: {
        zodiac1: {
          type: 'string',
          description: '第一个星座名称（中文或英文）',
          enum: Object.keys(zodiacData).concat(Object.values(zodiacData).map(z => z.name))
        },
        zodiac2: {
          type: 'string',
          description: '第二个星座名称（中文或英文）',
          enum: Object.keys(zodiacData).concat(Object.values(zodiacData).map(z => z.name))
        }
      },
      required: ['zodiac1', 'zodiac2']
    }
  },
  {
    name: 'get_all_zodiacs',
    description: '获取所有星座的基本信息列表',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_zodiac_by_date',
    description: '根据出生日期确定星座',
    inputSchema: {
      type: 'object',
      properties: {
        month: {
          type: 'integer',
          description: '出生月份（1-12）',
          minimum: 1,
          maximum: 12
        },
        day: {
          type: 'integer',
          description: '出生日期（1-31）',
          minimum: 1,
          maximum: 31
        }
      },
      required: ['month', 'day']
    }
  }
];

// 工具函数
function getZodiacKey(zodiacName) {
  const lowerName = zodiacName.toLowerCase();
  if (zodiacData[lowerName]) {
    return lowerName;
  }
  
  for (const [key, data] of Object.entries(zodiacData)) {
    if (data.name === zodiacName || data.english.toLowerCase() === lowerName) {
      return key;
    }
  }
  return null;
}

function getZodiacByDate(month, day) {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return 'gemini';
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return 'libra';
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return 'scorpio';
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return 'sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'pisces';
  return null;
}

function getRandomHoroscope(category) {
  const horoscopes = horoscopeData[category] || horoscopeData.luck;
  return horoscopes[Math.floor(Math.random() * horoscopes.length)];
}

function getCompatibilityScore(zodiac1, zodiac2) {
  const compat1 = compatibilityData[zodiac1];
  const compat2 = compatibilityData[zodiac2];
  
  if (!compat1 || !compat2) return { score: 50, level: '一般', description: '配对信息不足' };
  
  if (compat1.best.includes(zodiac2) || compat2.best.includes(zodiac1)) {
    return { score: 95, level: '绝配', description: '天生一对，非常般配' };
  }
  if (compat1.good.includes(zodiac2) || compat2.good.includes(zodiac1)) {
    return { score: 80, level: '良好', description: '相处融洽，关系稳定' };
  }
  if (compat1.poor.includes(zodiac2) || compat2.poor.includes(zodiac1)) {
    return { score: 30, level: '挑战', description: '需要更多理解和包容' };
  }
  
  return { score: 60, level: '一般', description: '普通配对，需要努力经营' };
}

// 创建 MCP 服务器
const server = new Server(
  {
    name: 'star-mcp',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// 处理工具列表请求
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }))
  };
});

// 处理工具调用请求
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    let result;
    
    switch (name) {
      case 'get_zodiac_info': {
        const zodiacKey = getZodiacKey(args.zodiac);
        if (!zodiacKey) {
          throw new Error(`未找到星座: ${args.zodiac}`);
        }
        
        const zodiac = zodiacData[zodiacKey];
        result = {
          content: [
            {
              type: 'text',
              text: `# ${zodiac.symbol} ${zodiac.name} (${zodiac.english})
              
**基本信息:**
- 日期范围: ${zodiac.dateRange}
- 元素: ${zodiac.element}
- 性质: ${zodiac.quality}
- 守护星: ${zodiac.ruler}

**性格特征:**
${zodiac.traits.map(trait => `- ${trait}`).join('\n')}

**描述:**
${zodiac.description}`
            }
          ]
        };
        break;
      }
      
      case 'get_daily_horoscope': {
        const zodiacKey = getZodiacKey(args.zodiac);
        if (!zodiacKey) {
          throw new Error(`未找到星座: ${args.zodiac}`);
        }
        
        const zodiac = zodiacData[zodiacKey];
        const category = args.category || 'luck';
        const horoscope = getRandomHoroscope(category);
        
        const categoryNames = {
          love: '爱情运',
          career: '事业运',
          health: '健康运',
          wealth: '财运',
          luck: '综合运势'
        };
        
        result = {
          content: [
            {
              type: 'text',
              text: `# ${zodiac.symbol} ${zodiac.name} 今日${categoryNames[category]}

**运势指数:** ⭐⭐⭐⭐⭐

**今日运势:**
${horoscope}

**建议:**
- 保持积极心态
- 注意身体健康
- 与朋友多交流
- 把握机会，勇敢尝试`
            }
          ]
        };
        break;
      }
      
      case 'get_compatibility': {
        const zodiac1Key = getZodiacKey(args.zodiac1);
        const zodiac2Key = getZodiacKey(args.zodiac2);
        
        if (!zodiac1Key || !zodiac2Key) {
          throw new Error('星座名称无效');
        }
        
        const zodiac1 = zodiacData[zodiac1Key];
        const zodiac2 = zodiacData[zodiac2Key];
        const compatibility = getCompatibilityScore(zodiac1Key, zodiac2Key);
        
        result = {
          content: [
            {
              type: 'text',
              text: `# ${zodiac1.symbol} ${zodiac1.name} & ${zodiac2.symbol} ${zodiac2.name} 配对分析

**配对指数:** ${compatibility.score}/100
**配对等级:** ${compatibility.level}

**关系分析:**
${compatibility.description}

**元素关系:**
${zodiac1.element} + ${zodiac2.element} = ${getElementCompatibility(zodiac1.element, zodiac2.element)}

**建议:**
- 多了解对方的性格特点
- 保持开放和包容的心态
- 在关系中寻找平衡点
- 珍惜彼此的独特之处`
            }
          ]
        };
        break;
      }
      
      case 'get_all_zodiacs': {
        const zodiacList = Object.entries(zodiacData).map(([key, zodiac]) => 
          `${zodiac.symbol} ${zodiac.name} (${zodiac.english}) - ${zodiac.dateRange}`
        ).join('\n');
        
        result = {
          content: [
            {
              type: 'text',
              text: `# 十二星座完整列表

${zodiacList}

**使用说明:**
- 使用 get_zodiac_info 获取详细星座信息
- 使用 get_daily_horoscope 查询今日运势
- 使用 get_compatibility 分析星座配对
- 使用 get_zodiac_by_date 根据生日确定星座`
            }
          ]
        };
        break;
      }
      
      case 'get_zodiac_by_date': {
        const zodiacKey = getZodiacByDate(args.month, args.day);
        if (!zodiacKey) {
          throw new Error('日期无效');
        }
        
        const zodiac = zodiacData[zodiacKey];
        
        result = {
          content: [
            {
              type: 'text',
              text: `# 生日星座查询结果

**出生日期:** ${args.month}月${args.day}日
**对应星座:** ${zodiac.symbol} ${zodiac.name} (${zodiac.english})
**日期范围:** ${zodiac.dateRange}

**基本信息:**
- 元素: ${zodiac.element}
- 性质: ${zodiac.quality}
- 守护星: ${zodiac.ruler}

**性格特点:**
${zodiac.traits.map(trait => `- ${trait}`).join('\n')}`
            }
          ]
        };
        break;
      }
      
      default:
        throw new Error(`未知工具: ${name}`);
    }
    
    return result;
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `错误: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// 辅助函数
function getElementCompatibility(element1, element2) {
  const compatibility = {
    '火': { '火': '热情激烈', '土': '相生', '风': '相生', '水': '相克' },
    '土': { '火': '相生', '土': '稳定踏实', '风': '相克', '水': '相生' },
    '风': { '火': '相生', '土': '相克', '风': '自由灵动', '水': '相生' },
    '水': { '火': '相克', '土': '相生', '风': '相生', '水': '深邃神秘' }
  };
  
  return compatibility[element1]?.[element2] || '关系复杂';
}

// 启动服务器
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('星座 MCP 服务已启动'); 