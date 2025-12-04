#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ToolSchema,
  TextContentSchema
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

// 上升星座数据
const risingSignData = {
  aries: {
    name: '白羊座',
    english: 'Aries',
    symbol: '♈',
    traits: ['勇敢', '冲动', '领导力', '直接', '冒险'],
    description: '上升白羊座的人给人第一印象是勇敢、直接、充满活力。他们行动迅速，喜欢挑战，具有天生的领导才能。',
    appearance: '通常身材匀称，面部轮廓清晰，眼神坚定有神，走路带风。',
    personality: '性格外向，喜欢成为焦点，做事雷厉风行，但有时过于冲动。'
  },
  taurus: {
    name: '金牛座',
    english: 'Taurus',
    symbol: '♉',
    traits: ['稳重', '耐心', '务实', '固执', '享受'],
    description: '上升金牛座的人给人第一印象是稳重、可靠、有耐心。他们重视安全和稳定，喜欢美好的事物。',
    appearance: '通常身材结实，面部轮廓圆润，眼神温和，举止优雅从容。',
    personality: '性格温和但固执，重视物质享受，做事有条不紊，但有时过于保守。'
  },
  gemini: {
    name: '双子座',
    english: 'Gemini',
    symbol: '♊',
    traits: ['灵活', '好奇', '善变', '沟通', '学习'],
    description: '上升双子座的人给人第一印象是灵活、好奇、善于沟通。他们思维敏捷，适应能力强。',
    appearance: '通常身材苗条，面部表情丰富，眼神灵动，手势较多。',
    personality: '性格活泼，好奇心强，善于表达，但有时缺乏耐心和专注力。'
  },
  cancer: {
    name: '巨蟹座',
    english: 'Cancer',
    symbol: '♋',
    traits: ['敏感', '保护', '家庭', '直觉', '情感'],
    description: '上升巨蟹座的人给人第一印象是敏感、温和、有保护欲。他们情感丰富，重视家庭。',
    appearance: '通常身材圆润，面部表情温和，眼神温柔，举止亲切。',
    personality: '性格内向但温暖，直觉敏锐，重视安全感，但有时过于敏感。'
  },
  leo: {
    name: '狮子座',
    english: 'Leo',
    symbol: '♌',
    traits: ['自信', '慷慨', '领导', '戏剧性', '忠诚'],
    description: '上升狮子座的人给人第一印象是自信、大方、有魅力。他们天生具有领导气质。',
    appearance: '通常身材匀称，面部轮廓分明，眼神自信，举止优雅大方。',
    personality: '性格外向，喜欢成为焦点，慷慨大方，但有时过于自我中心。'
  },
  virgo: {
    name: '处女座',
    english: 'Virgo',
    symbol: '♍',
    traits: ['完美', '分析', '服务', '谦虚', '实用'],
    description: '上升处女座的人给人第一印象是细致、谦虚、有条理。他们注重细节，追求完美。',
    appearance: '通常身材匀称，面部轮廓清晰，眼神专注，举止得体。',
    personality: '性格内向，注重细节，服务意识强，但有时过于挑剔。'
  },
  libra: {
    name: '天秤座',
    english: 'Libra',
    symbol: '♎',
    traits: ['平衡', '和谐', '公正', '社交', '优雅'],
    description: '上升天秤座的人给人第一印象是优雅、和谐、有魅力。他们追求平衡，重视关系。',
    appearance: '通常身材匀称，面部轮廓优雅，眼神温和，举止优雅。',
    personality: '性格温和，追求和谐，善于社交，但有时优柔寡断。'
  },
  scorpio: {
    name: '天蝎座',
    english: 'Scorpio',
    symbol: '♏',
    traits: ['神秘', '强烈', '洞察', '忠诚', '激情'],
    description: '上升天蝎座的人给人第一印象是神秘、强烈、有魅力。他们洞察力强，情感深刻。',
    appearance: '通常身材匀称，面部轮廓深邃，眼神深邃，举止神秘。',
    personality: '性格内向但强烈，洞察力强，忠诚专一，但有时过于极端。'
  },
  sagittarius: {
    name: '射手座',
    english: 'Sagittarius',
    symbol: '♐',
    traits: ['乐观', '自由', '冒险', '哲学', '诚实'],
    description: '上升射手座的人给人第一印象是乐观、自由、充满活力。他们热爱冒险，追求真理。',
    appearance: '通常身材高大，面部轮廓开朗，眼神明亮，举止自然。',
    personality: '性格外向，乐观开朗，热爱自由，但有时过于直率。'
  },
  capricorn: {
    name: '摩羯座',
    english: 'Capricorn',
    symbol: '♑',
    traits: ['野心', '责任', '耐心', '实用', '纪律'],
    description: '上升摩羯座的人给人第一印象是稳重、有责任感、有野心。他们追求成功，重视纪律。',
    appearance: '通常身材结实，面部轮廓严肃，眼神坚定，举止稳重。',
    personality: '性格内向，有责任感，追求成功，但有时过于严肃。'
  },
  aquarius: {
    name: '水瓶座',
    english: 'Aquarius',
    symbol: '♒',
    traits: ['独立', '创新', '人道', '理性', '独特'],
    description: '上升水瓶座的人给人第一印象是独特、独立、有创新精神。他们思维独特，关心人类福祉。',
    appearance: '通常身材匀称，面部轮廓独特，眼神聪慧，举止独特。',
    personality: '性格独立，思维独特，富有创新精神，但有时过于理想化。'
  },
  pisces: {
    name: '双鱼座',
    english: 'Pisces',
    symbol: '♓',
    traits: ['同情', '直觉', '艺术', '梦想', '灵性'],
    description: '上升双鱼座的人给人第一印象是温柔、富有同情心、有艺术气质。他们直觉敏锐，富有想象力。',
    appearance: '通常身材柔软，面部轮廓柔和，眼神温柔，举止优雅。',
    personality: '性格温和，富有同情心，艺术天赋强，但有时过于理想化。'
  }
};

// 上升星座计算函数（准确完整版本）
function calculateRisingSign(birthHour, birthMinute, latitude, longitude, birthDate) {
  // 准确计算上升星座需要以下步骤：
  // 1. 计算恒星时 (Sidereal Time)
  // 2. 计算地方恒星时 (Local Sidereal Time)
  // 3. 计算上升点 (Ascendant)
  
  // 将出生时间转换为小数小时
  const birthTime = birthHour + birthMinute / 60;
  
  // 获取出生日期的年、月、日
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1; // getMonth() 返回 0-11
  const day = birthDate.getDate();
  
  // 1. 计算儒略日 (Julian Day)
  function calculateJulianDay(year, month, day, hour) {
    if (month <= 2) {
      year -= 1;
      month += 12;
    }
    
    const a = Math.floor(year / 100);
    const b = 2 - a + Math.floor(a / 4);
    
    const jd = Math.floor(365.25 * (year + 4716)) + 
               Math.floor(30.6001 * (month + 1)) + 
               day + b - 1524.5 + hour / 24;
    
    return jd;
  }
  
  // 2. 计算格林威治恒星时 (Greenwich Sidereal Time)
  function calculateGST(julianDay) {
    const t = (julianDay - 2451545.0) / 36525;
    
    // 计算平均恒星时
    let gst = 280.46061837 + 360.98564736629 * (julianDay - 2451545.0) + 
              0.000387933 * t * t - t * t * t / 38710000;
    
    // 标准化到 0-360 度
    gst = gst % 360;
    if (gst < 0) gst += 360;
    
    return gst;
  }
  
  // 3. 计算地方恒星时 (Local Sidereal Time)
  function calculateLST(gst, longitude) {
    let lst = gst + longitude;
    
    // 标准化到 0-360 度
    lst = lst % 360;
    if (lst < 0) lst += 360;
    
    return lst;
  }
  
  // 4. 计算上升点 (Ascendant)
  function calculateAscendant(lst, latitude) {
    // 黄道倾角 (Obliquity of the Ecliptic)
    const obliquity = 23.4397; // 度
    
    // 将角度转换为弧度
    const lstRad = lst * Math.PI / 180;
    const latRad = latitude * Math.PI / 180;
    const oblRad = obliquity * Math.PI / 180;
    
    // 计算上升点的黄经
    const ascRad = Math.atan2(
      Math.cos(oblRad) * Math.sin(lstRad),
      Math.cos(lstRad) * Math.cos(latRad) - Math.sin(oblRad) * Math.sin(latRad)
    );
    
    let ascendant = ascRad * 180 / Math.PI;
    
    // 标准化到 0-360 度
    if (ascendant < 0) ascendant += 360;
    
    return ascendant;
  }
  
  // 5. 根据上升点黄经确定上升星座
  function getRisingSignFromAscendant(ascendant) {
    // 星座边界（黄经度数）
    const zodiacBoundaries = [
      { sign: 'aries', start: 0, end: 30 },
      { sign: 'taurus', start: 30, end: 60 },
      { sign: 'gemini', start: 60, end: 90 },
      { sign: 'cancer', start: 90, end: 120 },
      { sign: 'leo', start: 120, end: 150 },
      { sign: 'virgo', start: 150, end: 180 },
      { sign: 'libra', start: 180, end: 210 },
      { sign: 'scorpio', start: 210, end: 240 },
      { sign: 'sagittarius', start: 240, end: 270 },
      { sign: 'capricorn', start: 270, end: 300 },
      { sign: 'aquarius', start: 300, end: 330 },
      { sign: 'pisces', start: 330, end: 360 }
    ];
    
    for (const boundary of zodiacBoundaries) {
      if (ascendant >= boundary.start && ascendant < boundary.end) {
        return boundary.sign;
      }
    }
    
    // 处理边界情况
    if (ascendant >= 330) return 'pisces';
    return 'aries'; // 默认值
  }
  
  try {
    // 执行计算
    const julianDay = calculateJulianDay(year, month, day, birthTime);
    const gst = calculateGST(julianDay);
    const lst = calculateLST(gst, longitude);
    const ascendant = calculateAscendant(lst, latitude);
    const risingSign = getRisingSignFromAscendant(ascendant);
    
    return risingSign;
  } catch (error) {
    console.error('上升星座计算错误:', error);
    // 如果计算失败，返回基于时间的简化计算
    return calculateRisingSignSimple(birthHour, birthMinute, latitude, longitude, birthDate);
  }
}

// 保留简化版本作为备用
function calculateRisingSignSimple(birthHour, birthMinute, latitude, longitude, birthDate) {
  const hour = birthHour + birthMinute / 60;
  
  // 简化的上升星座计算（基于出生时间）
  if (hour >= 6 && hour < 8) return 'aries';
  if (hour >= 8 && hour < 10) return 'taurus';
  if (hour >= 10 && hour < 12) return 'gemini';
  if (hour >= 12 && hour < 14) return 'cancer';
  if (hour >= 14 && hour < 16) return 'leo';
  if (hour >= 16 && hour < 18) return 'virgo';
  if (hour >= 18 && hour < 20) return 'libra';
  if (hour >= 20 && hour < 22) return 'scorpio';
  if (hour >= 22 || hour < 0) return 'sagittarius';
  if (hour >= 0 && hour < 2) return 'capricorn';
  if (hour >= 2 && hour < 4) return 'aquarius';
  if (hour >= 4 && hour < 6) return 'pisces';
  
  return 'aries'; // 默认值
}

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
  },
  {
    name: 'get_rising_sign',
    description: '计算上升星座，需要出生时间、地点和日期',
    inputSchema: {
      type: 'object',
      properties: {
        birthHour: {
          type: 'integer',
          description: '出生小时（0-23）',
          minimum: 0,
          maximum: 23
        },
        birthMinute: {
          type: 'integer',
          description: '出生分钟（0-59）',
          minimum: 0,
          maximum: 59
        },
        latitude: {
          type: 'number',
          description: '出生地纬度（-90到90）',
          minimum: -90,
          maximum: 90
        },
        longitude: {
          type: 'number',
          description: '出生地经度（-180到180）',
          minimum: -180,
          maximum: 180
        },
        birthMonth: {
          type: 'integer',
          description: '出生月份（1-12）',
          minimum: 1,
          maximum: 12
        },
        birthDay: {
          type: 'integer',
          description: '出生日期（1-31）',
          minimum: 1,
          maximum: 31
        },
        birthYear: {
          type: 'integer',
          description: '出生年份（1900-2100）',
          minimum: 1900,
          maximum: 2100
        }
      },
      required: ['birthHour', 'birthMinute', 'latitude', 'longitude', 'birthMonth', 'birthDay', 'birthYear']
    }
  },
  {
    name: 'get_rising_sign_info',
    description: '获取指定上升星座的详细信息',
    inputSchema: {
      type: 'object',
      properties: {
        risingSign: {
          type: 'string',
          description: '上升星座名称（中文或英文）',
          enum: Object.keys(risingSignData).concat(Object.values(risingSignData).map(z => z.name))
        }
      },
      required: ['risingSign']
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

function getRisingSignKey(risingSignName) {
  const lowerName = risingSignName.toLowerCase();
  if (risingSignData[lowerName]) {
    return lowerName;
  }
  
  for (const [key, data] of Object.entries(risingSignData)) {
    if (data.name === risingSignName || data.english.toLowerCase() === lowerName) {
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
      
      case 'get_rising_sign': {
        const birthDate = new Date(args.birthYear, args.birthMonth - 1, args.birthDay);
        const risingSignKey = calculateRisingSign(
          args.birthHour, 
          args.birthMinute, 
          args.latitude, 
          args.longitude, 
          birthDate
        );
        
        const risingSign = risingSignData[risingSignKey];
        const zodiacKey = getZodiacByDate(args.birthMonth, args.birthDay);
        const zodiac = zodiacData[zodiacKey];
        
        // 计算详细的天文数据用于显示
        const birthTime = args.birthHour + args.birthMinute / 60;
        const year = birthDate.getFullYear();
        const month = birthDate.getMonth() + 1;
        const day = birthDate.getDate();
        
        // 计算儒略日
        let jd = 0;
        if (month <= 2) {
          const tempYear = year - 1;
          const tempMonth = month + 12;
          const a = Math.floor(tempYear / 100);
          const b = 2 - a + Math.floor(a / 4);
          jd = Math.floor(365.25 * (tempYear + 4716)) + 
               Math.floor(30.6001 * (tempMonth + 1)) + 
               day + b - 1524.5 + birthTime / 24;
        } else {
          const a = Math.floor(year / 100);
          const b = 2 - a + Math.floor(a / 4);
          jd = Math.floor(365.25 * (year + 4716)) + 
               Math.floor(30.6001 * (month + 1)) + 
               day + b - 1524.5 + birthTime / 24;
        }
        
        // 计算恒星时
        const t = (jd - 2451545.0) / 36525;
        let gst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 
                  0.000387933 * t * t - t * t * t / 38710000;
        gst = gst % 360;
        if (gst < 0) gst += 360;
        
        // 计算地方恒星时
        let lst = gst + args.longitude;
        lst = lst % 360;
        if (lst < 0) lst += 360;
        
        result = {
          content: [
            {
              type: 'text',
              text: `# 上升星座查询结果

**出生信息:**
- 出生时间: ${args.birthYear}年${args.birthMonth}月${args.birthDay}日 ${args.birthHour}:${args.birthMinute.toString().padStart(2, '0')}
- 出生地点: 纬度 ${args.latitude}°, 经度 ${args.longitude}°

**天文计算数据:**
- 儒略日: ${jd.toFixed(6)}
- 格林威治恒星时: ${gst.toFixed(2)}°
- 地方恒星时: ${lst.toFixed(2)}°

**星座信息:**
- 太阳星座: ${zodiac.symbol} ${zodiac.name} (${zodiac.english})
- 上升星座: ${risingSign.symbol} ${risingSign.name} (${risingSign.english})

**上升星座特征:**
${risingSign.description}

**外貌特征:**
${risingSign.appearance}

**性格特点:**
${risingSign.traits.map(trait => `- ${trait}`).join('\n')}

**个性分析:**
${risingSign.personality}

**计算说明:**
此计算基于准确的天文算法，包括：
- 儒略日计算
- 格林威治恒星时计算
- 地方恒星时计算
- 上升点黄经计算
- 星座边界确定

**上升星座的意义:**
上升星座代表一个人给外界的第一印象，以及面对新环境时的表现方式。它反映了我们如何与世界互动，以及他人如何看待我们。`
            }
          ]
        };
        break;
      }
      
      case 'get_rising_sign_info': {
        const risingSignKey = getRisingSignKey(args.risingSign);
        if (!risingSignKey) {
          throw new Error(`未找到上升星座: ${args.risingSign}`);
        }
        
        const risingSign = risingSignData[risingSignKey];
        
        result = {
          content: [
            {
              type: 'text',
              text: `# ${risingSign.symbol} 上升${risingSign.name} (${risingSign.english})

**上升星座概述:**
${risingSign.description}

**外貌特征:**
${risingSign.appearance}

**性格特点:**
${risingSign.traits.map(trait => `- ${trait}`).join('\n')}

**个性分析:**
${risingSign.personality}

**上升星座的意义:**
上升星座代表一个人给外界的第一印象，以及面对新环境时的表现方式。它反映了我们如何与世界互动，以及他人如何看待我们。

**与太阳星座的关系:**
- 太阳星座代表内在本质和核心性格
- 上升星座代表外在表现和第一印象
- 两者结合能更全面地了解一个人的性格特征`
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