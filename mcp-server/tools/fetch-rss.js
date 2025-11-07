import Parser from "rss-parser";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "AI-News-Collector/1.0",
  },
});

/**
 * 加载RSS源配置
 */
async function loadRSSConfig() {
  const configPath = path.join(__dirname, "../config/rss-sources.json");
  const content = await fs.readFile(configPath, "utf-8");
  return JSON.parse(content);
}

/**
 * 抓取单个RSS源
 * @param {Object} source RSS源配置
 * @param {number} maxAgeDays 最大天数
 * @returns {Promise<Array>} 资讯列表
 */
async function fetchSingleRSS(source, maxAgeDays = 7) {
  try {
    console.log(`📡 抓取：${source.name} (${source.url})`);

    const feed = await parser.parseURL(source.url);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

    const items = feed.items
      .filter((item) => {
        // 过滤时效性
        if (!item.pubDate) return false;
        const pubDate = new Date(item.pubDate);
        return pubDate >= cutoffDate;
      })
      .map((item) => ({
        title: item.title?.trim() || "",
        link: item.link || "",
        description:
          item.contentSnippet || item.content || item.description || "",
        pubDate: item.pubDate,
        source: source.name,
        sourceUrl: source.url,
        credibility: source.credibility,
        category: source.category,
      }))
      .filter((item) => item.title && item.link); // 过滤无效项

    console.log(`  ✓ 获取 ${items.length} 条资讯`);
    return items;
  } catch (error) {
    console.error(`  ✗ 抓取失败：${source.name} - ${error.message}`);
    return [];
  }
}

/**
 * 抓取指定主题的所有RSS源
 * @param {string} topic 主题名称
 * @param {number} maxAgeDays 最大天数
 * @returns {Promise<Array>} 资讯列表
 */
async function fetchTopicRSS(topic, maxAgeDays = 7) {
  const config = await loadRSSConfig();
  const sources = config[topic] || [];

  if (sources.length === 0) {
    console.warn(`⚠️  未找到主题"${topic}"的RSS源`);
    return [];
  }

  console.log(`\n🔍 开始抓取主题：${topic} (${sources.length}个源)`);

  const results = [];
  for (const source of sources) {
    // 检查可信度阈值
    if (source.credibility < config.settings.min_credibility) {
      console.log(
        `  ⏭️  跳过（可信度过低）：${source.name} (${source.credibility})`
      );
      continue;
    }

    const items = await fetchSingleRSS(source, maxAgeDays);
    results.push(...items);

    // 延迟，避免过快请求
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // 按发布日期排序（最新在前）
  results.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  console.log(`✅ 主题"${topic}"共获取 ${results.length} 条资讯\n`);
  return results;
}

/**
 * 抓取所有主题的RSS源
 * @param {number} maxAgeDays 最大天数
 * @returns {Promise<Object>} 按主题分组的资讯
 */
async function fetchAllRSS(maxAgeDays = 7) {
  const config = await loadRSSConfig();
  const topics = [
    "ai_programming",
    "generative_ai",
    "ai_chips",
    "quantum_computing",
    "robotics",
    "tech_general",
  ];

  console.log("🚀 开始抓取所有RSS源...\n");

  const allResults = {};
  for (const topic of topics) {
    allResults[topic] = await fetchTopicRSS(topic, maxAgeDays);
  }

  const totalCount = Object.values(allResults).reduce(
    (sum, items) => sum + items.length,
    0
  );
  console.log(`\n✨ 抓取完成！共获取 ${totalCount} 条资讯`);

  return allResults;
}

/**
 * 保存RSS抓取结果
 * @param {Object} results 抓取结果
 * @param {string} outputPath 输出路径
 */
async function saveResults(results, outputPath = null) {
  if (!outputPath) {
    const date = new Date().toISOString().split("T")[0];
    outputPath = path.join(__dirname, `../data/rss-fetch-${date}.json`);
  }

  // 确保data目录存在
  const dataDir = path.dirname(outputPath);
  await fs.mkdir(dataDir, { recursive: true });

  await fs.writeFile(outputPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`💾 结果已保存至：${outputPath}`);
}

/**
 * 命令行接口
 */
async function main() {
  try {
    const topic = process.argv[2]; // 可选：指定主题
    const maxAgeDays = parseInt(process.argv[3]) || 7; // 可选：最大天数

    let results;
    if (topic && topic !== "all") {
      // 抓取单个主题
      const items = await fetchTopicRSS(topic, maxAgeDays);
      results = { [topic]: items };
    } else {
      // 抓取所有主题
      results = await fetchAllRSS(maxAgeDays);
    }

    // 保存结果
    await saveResults(results);

    // 输出统计
    console.log("\n📊 统计信息：");
    for (const [topicName, items] of Object.entries(results)) {
      console.log(`  - ${topicName}: ${items.length} 条`);
    }
  } catch (error) {
    console.error("❌ 抓取失败：", error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  fetchSingleRSS,
  fetchTopicRSS,
  fetchAllRSS,
  saveResults,
  loadRSSConfig,
};
