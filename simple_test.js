#!/usr/bin/env node

// 简单的上升星座计算测试
console.log('🔬 上升星座计算测试\n');

// 从主文件复制上升星座计算函数
function calculateRisingSign(birthHour, birthMinute, latitude, longitude, birthDate) {
  const birthTime = birthHour + birthMinute / 60;
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  
  // 计算儒略日
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
  
  // 计算格林威治恒星时
  function calculateGST(julianDay) {
    const t = (julianDay - 2451545.0) / 36525;
    
    let gst = 280.46061837 + 360.98564736629 * (julianDay - 2451545.0) + 
              0.000387933 * t * t - t * t * t / 38710000;
    
    gst = gst % 360;
    if (gst < 0) gst += 360;
    
    return gst;
  }
  
  // 计算地方恒星时
  function calculateLST(gst, longitude) {
    let lst = gst + longitude;
    
    lst = lst % 360;
    if (lst < 0) lst += 360;
    
    return lst;
  }
  
  // 计算上升点
  function calculateAscendant(lst, latitude) {
    const obliquity = 23.4397;
    
    const lstRad = lst * Math.PI / 180;
    const latRad = latitude * Math.PI / 180;
    const oblRad = obliquity * Math.PI / 180;
    
    const ascRad = Math.atan2(
      Math.cos(oblRad) * Math.sin(lstRad),
      Math.cos(lstRad) * Math.cos(latRad) - Math.sin(oblRad) * Math.sin(latRad)
    );
    
    let ascendant = ascRad * 180 / Math.PI;
    
    if (ascendant < 0) ascendant += 360;
    
    return ascendant;
  }
  
  // 根据上升点确定星座
  function getRisingSignFromAscendant(ascendant) {
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
    
    if (ascendant >= 330) return 'pisces';
    return 'aries';
  }
  
  try {
    const julianDay = calculateJulianDay(year, month, day, birthTime);
    const gst = calculateGST(julianDay);
    const lst = calculateLST(gst, longitude);
    const ascendant = calculateAscendant(lst, latitude);
    const risingSign = getRisingSignFromAscendant(ascendant);
    
    return {
      risingSign,
      julianDay,
      gst,
      lst,
      ascendant
    };
  } catch (error) {
    console.error('计算错误:', error);
    return null;
  }
}

// 星座名称映射
const zodiacNames = {
  aries: '白羊座',
  taurus: '金牛座',
  gemini: '双子座',
  cancer: '巨蟹座',
  leo: '狮子座',
  virgo: '处女座',
  libra: '天秤座',
  scorpio: '天蝎座',
  sagittarius: '射手座',
  capricorn: '摩羯座',
  aquarius: '水瓶座',
  pisces: '双鱼座'
};

// 测试用例
const testCase = {
  name: '北京 - 1990年8月15日14:30',
  birthHour: 14,
  birthMinute: 30,
  latitude: 39.9042,
  longitude: 116.4074,
  birthYear: 1990,
  birthMonth: 8,
  birthDay: 15
};

console.log(`📋 测试: ${testCase.name}`);
console.log(`📍 地点: 纬度 ${testCase.latitude}°, 经度 ${testCase.longitude}°`);
console.log(`🕐 时间: ${testCase.birthYear}年${testCase.birthMonth}月${testCase.birthDay}日 ${testCase.birthHour}:${testCase.birthMinute.toString().padStart(2, '0')}`);

const birthDate = new Date(testCase.birthYear, testCase.birthMonth - 1, testCase.birthDay);
const result = calculateRisingSign(
  testCase.birthHour,
  testCase.birthMinute,
  testCase.latitude,
  testCase.longitude,
  birthDate
);

if (result) {
  console.log(`📊 计算结果:`);
  console.log(`   - 儒略日: ${result.julianDay.toFixed(6)}`);
  console.log(`   - 格林威治恒星时: ${result.gst.toFixed(2)}°`);
  console.log(`   - 地方恒星时: ${result.lst.toFixed(2)}°`);
  console.log(`   - 上升点黄经: ${result.ascendant.toFixed(2)}°`);
  console.log(`   - 上升星座: ${zodiacNames[result.risingSign]} (${result.risingSign})`);
} else {
  console.log('❌ 计算失败');
}

console.log('\n🎉 测试完成！'); 