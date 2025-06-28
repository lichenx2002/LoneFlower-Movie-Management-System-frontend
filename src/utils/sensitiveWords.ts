import pinyin from 'pinyin';
// 敏感词库 - 基于开源敏感词库整理
const sensitiveWordsList = [
  // 脏话类
  { word: '傻逼', variants: ['傻b', 's逼', 'shabi', 'sha bi', 's b'] },
  { word: 'sb', variants: [] },
  { word: 'fuck', variants: ['f u c k', 'f*ck', 'f**k'] },
  { word: 'shit', variants: ['s h i t', 'sh1t'] },
  { word: 'bitch', variants: ['b1tch', 'b*tch'] },
  { word: 'asshole', variants: ['a s s h o l e', 'a**hole'] },
  { word: 'damn', variants: ['d a m n'] },
  { word: 'hell', variants: [] },
  { word: '混蛋', variants: [] },
  { word: '王八蛋', variants: [] },
  { word: '狗屎', variants: [] },
  { word: '垃圾', variants: [] },
  { word: '废物', variants: [] },
  { word: '白痴', variants: [] },
  { word: '智障', variants: [] },
  { word: '死', variants: [] },
  { word: '杀', variants: [] },
  { word: '死全家', variants: [] },
  { word: '去死', variants: [] },
  { word: '该死', variants: [] },
  { word: '死妈', variants: [] },
  { word: '死爸', variants: [] },
  // 政治敏感词
  { word: '政治敏感词1', variants: [] },
  { word: '政治敏感词2', variants: [] },
  { word: '政治敏感词3', variants: [] },
  // 色情类
  { word: '色情', variants: [] },
  { word: '黄色', variants: [] },
  { word: '成人', variants: [] },
  { word: '18禁', variants: [] },
  { word: 'av', variants: [] },
  { word: 'porn', variants: ['p o r n', 'p*rn'] },
  // 赌博类
  { word: '赌博', variants: [] },
  { word: '博彩', variants: [] },
  { word: '六合彩', variants: [] },
  { word: '时时彩', variants: [] },
  { word: '彩票', variants: [] },
  // 毒品类
  { word: '毒品', variants: [] },
  { word: '大麻', variants: [] },
  { word: '冰毒', variants: [] },
  { word: '海洛因', variants: [] },
  { word: '摇头丸', variants: [] },
  // 违法类
  { word: '诈骗', variants: [] },
  { word: '传销', variants: [] },
  { word: '非法集资', variants: [] },
  { word: '高利贷', variants: [] },
  // 暴力类
  { word: '暴力', variants: [] },
  { word: '恐怖', variants: [] },
  { word: '爆炸', variants: [] },
  { word: '炸弹', variants: [] },
  { word: '枪', variants: [] },
  // 其他
  { word: '侮辱', variants: [] },
  { word: '谩骂', variants: [] },
  { word: '攻击', variants: [] },
  { word: '恶意', variants: [] },
  { word: '仇恨', variants: [] },
];

// 生成所有敏感词及其变体的正则表达式
function buildSensitiveRegex(word: string): RegExp {
  // 匹配原词、允许中间插入空格、符号等
  const pattern = word
    .split('')
    .map(char => `[${char}]`)
    .join('[\\s\\*\\-\\_\\.]?');
  return new RegExp(pattern, 'i');
}

function toPinyin(text: string): string {
  // 返回不带声调的拼音，空格分隔
  return pinyin(text, { style: pinyin.STYLE_NORMAL })
    .flat()
    .join(' ')
    .toLowerCase();
}

/**
 * 智能检测敏感词（支持拼音、变体、正则模糊）
 * @param text 要检测的文本
 * @returns 包含的敏感词数组
 */
export function detectSensitiveWords(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }
  const foundWords: string[] = [];
  const lowerText = text.toLowerCase();
  const textPinyin = toPinyin(text);

  for (const { word, variants } of sensitiveWordsList) {
    // 1. 直接包含
    if (lowerText.includes(word.toLowerCase())) {
      foundWords.push(word);
      continue;
    }
    // 2. 变体检测
    if (variants.some(variant => lowerText.includes(variant.toLowerCase()))) {
      foundWords.push(word);
      continue;
    }
    // 3. 正则模糊检测
    const regex = buildSensitiveRegex(word);
    if (regex.test(lowerText)) {
      foundWords.push(word);
      continue;
    }
    // 4. 拼音检测
    const wordPinyin = toPinyin(word);
    if (textPinyin.includes(wordPinyin)) {
      foundWords.push(word);
      continue;
    }
    // 5. 拼音变体检测
    if (variants.some(variant => textPinyin.includes(toPinyin(variant)))) {
      foundWords.push(word);
      continue;
    }
  }
  return Array.from(new Set(foundWords));
}

/**
 * 检测文本是否包含敏感词
 * @param text 要检测的文本
 * @returns 是否包含敏感词
 */
export function hasSensitiveWords(text: string): boolean {
  return detectSensitiveWords(text).length > 0;
}

/**
 * 获取敏感词检测结果的消息
 * @param text 要检测的文本
 * @returns 检测结果消息
 */
export function getSensitiveWordsMessage(text: string): string | null {
  const foundWords = detectSensitiveWords(text);
  if (foundWords.length === 0) {
    return null;
  }

  return `检测到敏感词汇：${foundWords.join('、')}，请修改后重新提交。`;
}

/**
 * 使用免费API检测敏感词（备用方案）
 * @param text 要检测的文本
 * @returns Promise<boolean> 是否包含敏感词
 */
export async function checkSensitiveWordsAPI(text: string): Promise<boolean> {
  try {
    // 这里可以调用免费的敏感词检测API
    // 示例：https://api.muxiaoguo.cn/api/text_censor
    const response = await fetch('https://api.muxiaoguo.cn/api/text_censor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    });

    const result = await response.json();
    return result.sensitive || false;
  } catch (error) {
    console.error('API检测失败，使用本地检测:', error);
    // API失败时回退到本地检测
    return hasSensitiveWords(text);
  }
}
