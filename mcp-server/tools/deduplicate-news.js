#!/usr/bin/env node

/**
 * 去重检查工具
 *
 * 检查新收集的资讯是否与历史资讯重复
 * 基于标题相似度进行去重
 *
 * 执行: node deduplicate-news.js data/collected-news-YYYY-MM-DD.json
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SIMILARITY_THRESHOLD = 0.8; // 80%相似度阈值

// 提取关键词（去除停用词）
function extractKeywords(text) {
  const stopWords = [
    "的",
    "是",
    "在",
    "了",
    "和",
    "与",
    "及",
    "或",
    "但",
    "而",
    "the",
    "is",
    "in",
    "of",
    "and",
    "or",
    "but",
    "to",
    "a",
    "an",
    "发布",
    "推出",
    "宣布",
    "上线",
    "开源",
    "release",
    "launch",
  ];

  // 提取中英文词汇
  const words = text
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !stopWords.includes(w));

  return [...new Set(words)]; // 去重
}

// 计算两个标题的相似度（Jaccard相似度）
function calculateSimilarity(title1, title2) {
  const keywords1 = extractKeywords(title1);
  const keywords2 = extractKeywords(title2);

  if (keywords1.length === 0 || keywords2.length === 0) {
    return 0;
  }

  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

// 生成唯一ID
function generateId(title, publishDate) {
  const hash = crypto
    .createHash("md5")
    .update(title + publishDate)
    .digest("hex")
    .substring(0, 8);
  return hash;
}

// 主函数
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("❌ 错误: 请提供收集的资讯文件路径");
    console.error(
      "用法: node deduplicate-news.js data/collected-news-YYYY-MM-DD.json"
    );
    process.exit(1);
  }

  const inputFile = args[0];
  // 如果是绝对路径直接使用，否则相对于项目根目录（__dirname的上两级）
  const inputPath = path.isAbsolute(inputFile)
    ? inputFile
    : path.join(__dirname, "..", "..", inputFile);

  console.log("🔍 去重检查工具\n");

  // 读取历史数据库
  const historyPath = path.join(__dirname, "..", "data", "news-history.json");
  let historyData;
  try {
    const historyContent = await fs.readFile(historyPath, "utf-8");
    historyData = JSON.parse(historyContent);
  } catch (error) {
    console.log("⚠️  历史数据库不存在，创建新数据库");
    historyData = {
      version: "1.0",
      lastUpdated: new Date().toISOString().split("T")[0],
      totalItems: 0,
      newsItems: [],
    };
  }

  console.log(`读取历史数据库: ${historyData.newsItems.length} 条历史资讯`);

  // 读取今日收集的资讯
  const collectedData = JSON.parse(await fs.readFile(inputPath, "utf-8"));
  const allItems = [];

  // 收集所有类别的资讯
  for (const [categoryId, categoryData] of Object.entries(
    collectedData.categories
  )) {
    for (const item of categoryData.items) {
      allItems.push({
        ...item,
        category: categoryId,
        categoryName: categoryData.name,
      });
    }
  }

  console.log(`读取今日收集: ${allItems.length} 条新资讯\n`);

  // 去重检查
  const duplicates = [];
  const unique = [];

  for (const item of allItems) {
    let isDuplicate = false;
    let maxSimilarity = 0;
    let similarItem = null;

    // 与历史资讯对比
    for (const historyItem of historyData.newsItems) {
      const similarity = calculateSimilarity(item.title, historyItem.title);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        similarItem = historyItem;
      }

      if (similarity >= SIMILARITY_THRESHOLD) {
        isDuplicate = true;
        break;
      }
    }

    if (isDuplicate) {
      duplicates.push({
        item,
        similarity: maxSimilarity,
        similarTo: similarItem,
      });
    } else {
      unique.push(item);
    }
  }

  console.log(`✅ 通过去重: ${unique.length} 条`);
  console.log(`❌ 标记重复: ${duplicates.length} 条`);

  if (duplicates.length > 0) {
    for (const dup of duplicates) {
      console.log(
        `  - "${dup.item.title.substring(0, 30)}..." (与 ${
          dup.similarTo.publishDate
        } 资讯相似度 ${Math.round(dup.similarity * 100)}%)`
      );
    }
  }
  console.log();

  // 构建去重后的数据结构
  const deduplicatedData = {
    date: collectedData.date,
    categories: {},
    metadata: {
      ...collectedData.metadata,
      deduplicatedAt: new Date().toISOString(),
      originalCount: allItems.length,
      uniqueCount: unique.length,
      duplicateCount: duplicates.length,
    },
  };

  // 重新组织到各个类别
  for (const [categoryId, categoryData] of Object.entries(
    collectedData.categories
  )) {
    deduplicatedData.categories[categoryId] = {
      name: categoryData.name,
      items: unique
        .filter((item) => item.category === categoryId)
        .map((item) => {
          const { category, categoryName, ...rest } = item;
          return rest;
        }),
    };
  }

  // 保存去重后的文件
  const outputPath = inputPath.replace("collected-news", "deduplicated-news");
  await fs.writeFile(outputPath, JSON.stringify(deduplicatedData, null, 2));
  console.log(`💾 已保存: ${outputPath}`);

  // 更新历史数据库
  const today = new Date().toISOString().split("T")[0];
  for (const item of unique) {
    const id = generateId(item.title, item.publishDate || today);
    historyData.newsItems.push({
      id,
      title: item.title,
      summary: (item.summary || "").substring(0, 200),
      publishDate: item.publishDate || today,
      addedDate: today,
      source: item.source || "未知",
    });
  }

  historyData.totalItems = historyData.newsItems.length;
  historyData.lastUpdated = today;

  await fs.writeFile(historyPath, JSON.stringify(historyData, null, 2));
  console.log(`📊 历史数据库已更新: 新增 ${unique.length} 条记录`);
  console.log(`   总计: ${historyData.newsItems.length} 条历史资讯\n`);
}

main().catch(console.error);
