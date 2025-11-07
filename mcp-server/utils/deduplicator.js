import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../data/deduplication.json');

/**
 * 计算Levenshtein距离（编辑距离）
 */
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // 删除
          dp[i][j - 1] + 1,     // 插入
          dp[i - 1][j - 1] + 1  // 替换
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * 计算字符串相似度（0-1之间）
 */
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  // 归一化：转小写，去除标点和空格
  const normalize = (str) => str.toLowerCase().replace(/[^\w\u4e00-\u9fa5]/g, '');
  const s1 = normalize(str1);
  const s2 = normalize(str2);
  
  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  const distance = levenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  
  return 1 - (distance / maxLen);
}

/**
 * 提取关键词（简单实现）
 */
function extractKeywords(text) {
  if (!text) return [];
  
  // 常见停用词
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                             'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were',
                             '的', '了', '和', '是', '在', '有', '个', '这', '我', '与']);
  
  // 提取单词（英文）和词语（中文）
  const words = text.toLowerCase()
    .match(/[\w\u4e00-\u9fa5]+/g) || [];
  
  // 过滤停用词，计算词频
  const freq = {};
  words.forEach(word => {
    if (!stopWords.has(word) && word.length > 2) {
      freq[word] = (freq[word] || 0) + 1;
    }
  });
  
  // 按词频排序，返回前10个关键词
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * 生成内容摘要hash
 */
function generateContentHash(newsItem) {
  const { title = '', description = '', source = '' } = newsItem;
  const keywords = extractKeywords(title + ' ' + description);
  
  return {
    titleHash: title.toLowerCase().replace(/[^\w\u4e00-\u9fa5]/g, ''),
    keywords: keywords,
    source: source,
    length: (title + description).length
  };
}

/**
 * 加载去重数据库
 */
async function loadDatabase() {
  try {
    // 确保data目录存在
    const dataDir = path.dirname(DB_PATH);
    await fs.mkdir(dataDir, { recursive: true });
    
    const content = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    // 文件不存在，返回空数据库
    return { history: {}, stats: { total_checked: 0, duplicates_found: 0 } };
  }
}

/**
 * 保存去重数据库
 */
async function saveDatabase(db) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

/**
 * 清理过期数据（保留最近maxDays天）
 */
async function cleanupOldData(maxDays = 7) {
  const db = await loadDatabase();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxDays);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];
  
  let removedCount = 0;
  for (const date in db.history) {
    if (date < cutoffStr) {
      delete db.history[date];
      removedCount++;
    }
  }
  
  if (removedCount > 0) {
    await saveDatabase(db);
    console.log(`🧹 清理了 ${removedCount} 天的旧数据`);
  }
  
  return removedCount;
}

/**
 * 检查是否重复
 * @param {Object} newsItem 新闻项
 * @param {number} similarityThreshold 相似度阈值（0-1）
 * @param {number} maxDays 检查最近几天的历史
 * @returns {Promise<Object>} { isDuplicate, reason, similarItem }
 */
async function checkDuplicate(newsItem, similarityThreshold = 0.8, maxDays = 7) {
  const db = await loadDatabase();
  db.stats.total_checked++;
  
  const newHash = generateContentHash(newsItem);
  const newTitle = newsItem.title || '';
  
  // 获取最近maxDays天的历史记录
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxDays);
  
  for (const [date, items] of Object.entries(db.history)) {
    const itemDate = new Date(date);
    if (itemDate < cutoffDate) continue;
    
    for (const historicalItem of items) {
      // 1. 检查标题相似度
      const titleSimilarity = calculateSimilarity(newTitle, historicalItem.title);
      
      if (titleSimilarity >= similarityThreshold) {
        db.stats.duplicates_found++;
        await saveDatabase(db);
        
        return {
          isDuplicate: true,
          reason: `标题相似度过高 (${(titleSimilarity * 100).toFixed(1)}%)`,
          similarItem: {
            date: date,
            title: historicalItem.title,
            source: historicalItem.source,
            similarity: titleSimilarity
          }
        };
      }
      
      // 2. 检查关键词重叠度
      const commonKeywords = newHash.keywords.filter(k => 
        historicalItem.keywords?.includes(k)
      );
      const keywordOverlap = commonKeywords.length / Math.max(newHash.keywords.length, 1);
      
      if (keywordOverlap >= 0.7 && titleSimilarity >= 0.6) {
        db.stats.duplicates_found++;
        await saveDatabase(db);
        
        return {
          isDuplicate: true,
          reason: `关键词重叠度高 (${(keywordOverlap * 100).toFixed(1)}%) + 标题相似 (${(titleSimilarity * 100).toFixed(1)}%)`,
          similarItem: {
            date: date,
            title: historicalItem.title,
            source: historicalItem.source,
            keywordOverlap: keywordOverlap,
            titleSimilarity: titleSimilarity
          }
        };
      }
    }
  }
  
  await saveDatabase(db);
  return { isDuplicate: false, reason: null, similarItem: null };
}

/**
 * 添加到历史记录
 * @param {string} date 日期 (YYYY-MM-DD)
 * @param {Object} newsItem 新闻项
 */
async function addToHistory(date, newsItem) {
  const db = await loadDatabase();
  
  if (!db.history[date]) {
    db.history[date] = [];
  }
  
  const hash = generateContentHash(newsItem);
  db.history[date].push({
    title: newsItem.title,
    link: newsItem.link,
    source: newsItem.source || '',
    keywords: hash.keywords,
    addedAt: new Date().toISOString()
  });
  
  await saveDatabase(db);
}

/**
 * 批量去重
 * @param {Array} newsItems 新闻项列表
 * @param {number} similarityThreshold 相似度阈值
 * @returns {Promise<Object>} { unique, duplicates }
 */
async function deduplicateBatch(newsItems, similarityThreshold = 0.8) {
  console.log(`\n🔍 开始去重检查：${newsItems.length} 条资讯...`);
  
  const unique = [];
  const duplicates = [];
  
  for (const item of newsItems) {
    const result = await checkDuplicate(item, similarityThreshold);
    
    if (result.isDuplicate) {
      console.log(`  ✗ 重复：${item.title}`);
      console.log(`    原因：${result.reason}`);
      console.log(`    相似项：${result.similarItem.title} (${result.similarItem.date})`);
      duplicates.push({ item, result });
    } else {
      console.log(`  ✓ 唯一：${item.title}`);
      unique.push(item);
    }
  }
  
  console.log(`\n✅ 去重完成：`);
  console.log(`  - 唯一资讯：${unique.length} 条`);
  console.log(`  - 重复资讯：${duplicates.length} 条`);
  
  return { unique, duplicates };
}

/**
 * 获取统计信息
 */
async function getStats() {
  const db = await loadDatabase();
  const historyCount = Object.values(db.history).reduce((sum, items) => sum + items.length, 0);
  
  return {
    ...db.stats,
    history_items: historyCount,
    history_dates: Object.keys(db.history).length,
    duplicate_rate: db.stats.total_checked > 0 
      ? (db.stats.duplicates_found / db.stats.total_checked * 100).toFixed(2) + '%'
      : '0%'
  };
}

export {
  calculateSimilarity,
  extractKeywords,
  checkDuplicate,
  addToHistory,
  deduplicateBatch,
  cleanupOldData,
  getStats,
  loadDatabase,
  saveDatabase
};

