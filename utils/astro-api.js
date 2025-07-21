import axios from 'axios';

const API_KEY = 'cc6e6b2bd634bcc67ef838d7338b28d7';
const BASE_URL = 'https://apis.tianapi.com/star/index';

export async function fetchRemoteHoroscope(zodiac) {
  try {
    const res = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        astro: zodiac // 需传英文小写
      }
    });
    if (res.data && res.data.code === 200 && res.data.result) {
      return res.data.result;
    }
    throw new Error(res.data.msg || 'API返回异常');
  } catch (e) {
    return { error: `远程运势获取失败: ${e.message}` };
  }
}

const COMPAT_BASE_URL = 'https://apis.tianapi.com/xingzuo/index';

export async function fetchRemoteCompatibility(me) {
  try {
    const res = await axios.get(COMPAT_BASE_URL, {
      params: {
        key: API_KEY,
        me // 传递中文星座名
      }
    });
    if (res.data && res.data.code === 200 && res.data.result) {
      return res.data.result;
    }
    throw new Error(res.data.msg || 'API返回异常');
  } catch (e) {
    return { error: `远程配对获取失败: ${e.message}` };
  }
} 