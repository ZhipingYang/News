import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  deduplicateBatch,
  addToHistory,
  cleanupOldData,
} from "../utils/deduplicator.js";
import { EvaluateContentTool } from "./evaluate-content.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 处理RSS抓取数据：去重、评估、筛选
 */
async function processRSSData(rssDataPath, minCredibility = 0.85) {
  console.log(`\n📊 开始处理RSS数据：${rssDataPath}\n`);

  // 1. 读取RSS数据
  const rssData = JSON.parse(await fs.readFile(rssDataPath, "utf-8"));

  // 2. 清理旧数据
  await cleanupOldData(7);

  // 3. 按主题处理
  const allProcessed = {};
  const categoryMap = {
    ai_programming: "ai-programming",
    generative_ai: "generative-ai",
    ai_chips: "ai-chips",
    quantum_computing: "quantum-computing",
    robotics: "robotics",
  };

  for (const [topic, items] of Object.entries(rssData)) {
    if (!Array.isArray(items) || items.length === 0) continue;

    console.log(`\n📰 处理主题：${topic} (${items.length} 条)`);

    // 去重
    const { unique } = await deduplicateBatch(items, 0.8);
    console.log(`  ✓ 去重后剩余：${unique.length} 条`);

    // 评估可信度
    const evaluator = new EvaluateContentTool();
    const qualified = [];

    for (const item of unique) {
      const content = item.description || item.title || "";
      const result = await evaluator.execute({
        content,
        source: item.sourceUrl || item.source,
        publishDate: item.pubDate
          ? new Date(item.pubDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        title: item.title,
      });

      if (result.success && result.report.credibilityScore >= minCredibility) {
        qualified.push({
          ...item,
          evaluation: result.report,
          category: categoryMap[topic] || topic,
        });
      }
    }

    console.log(`  ✓ 可信度≥${minCredibility}：${qualified.length} 条`);
    allProcessed[topic] = qualified;
  }

  // 统计
  const total = Object.values(allProcessed).reduce(
    (sum, items) => sum + items.length,
    0
  );
  console.log(`\n✨ 处理完成！共 ${total} 条高质量资讯\n`);

  return allProcessed;
}

/**
 * 按日期分组资讯
 */
function groupByDate(processedData) {
  const byDate = {};

  for (const items of Object.values(processedData)) {
    for (const item of items) {
      const date = item.pubDate
        ? new Date(item.pubDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      if (!byDate[date]) {
        byDate[date] = [];
      }

      byDate[date].push(item);
    }
  }

  return byDate;
}

// 命令行接口
async function main() {
  try {
    const rssFile =
      process.argv[2] ||
      path.join(__dirname, "../data/rss-fetch-2025-11-07.json");
    const minCredibility = parseFloat(process.argv[3]) || 0.85;

    const processed = await processRSSData(rssFile, minCredibility);
    const byDate = groupByDate(processed);

    // 保存处理结果
    const outputPath = rssFile.replace("rss-fetch", "processed-rss");
    await fs.writeFile(
      outputPath,
      JSON.stringify({ byDate, processed }, null, 2),
      "utf-8"
    );
    console.log(`💾 处理结果已保存：${outputPath}\n`);

    // 输出统计
    console.log("📊 按日期统计：");
    for (const [date, items] of Object.entries(byDate)) {
      console.log(`  ${date}: ${items.length} 条`);
    }
  } catch (error) {
    console.error("❌ 处理失败：", error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { processRSSData, groupByDate };
