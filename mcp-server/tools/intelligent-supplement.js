import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * AI智能补充工具
 * 分析RSS抓取结果，动态判断是否需要使用web_search补充资讯
 */

/**
 * 分析类目资讯质量和数量
 * @param {Array} items 资讯列表
 * @returns {Object} 分析结果
 */
function analyzeCategoryQuality(items) {
  if (!items || items.length === 0) {
    return {
      needsSupplement: true,
      reason: "没有资讯",
      count: 0,
      qualityScore: 0,
    };
  }

  const count = items.length;

  // 计算平均可信度
  const avgCredibility =
    items.reduce((sum, item) => sum + (item.credibility || 0.8), 0) /
    items.length;

  // 计算平均内容长度（如果有description）
  const avgLength =
    items.reduce((sum, item) => sum + (item.description?.length || 0), 0) /
    items.length;

  // 计算质量分数 (0-1)
  const qualityScore =
    avgCredibility * 0.6 + // 可信度权重60%
    Math.min(avgLength / 500, 1) * 0.4; // 内容长度权重40%

  // 判断是否需要补充
  const needsSupplement =
    count < 3 || // 资讯数量不足3条
    qualityScore < 0.75; // 质量分数低于0.75

  let reason = "";
  if (count < 3) {
    reason = `资讯数量不足（仅${count}条）`;
  } else if (qualityScore < 0.75) {
    reason = `质量分数偏低（${qualityScore.toFixed(2)}）`;
  } else {
    reason = "质量和数量充足";
  }

  return {
    needsSupplement,
    reason,
    count,
    qualityScore: parseFloat(qualityScore.toFixed(2)),
    avgCredibility: parseFloat(avgCredibility.toFixed(2)),
    avgLength: Math.round(avgLength),
  };
}

/**
 * 生成web_search搜索查询
 * @param {string} category 类目名称
 * @param {string} date 日期
 * @returns {Array<string>} 搜索查询列表
 */
function generateSearchQueries(category, date) {
  const dateObj = new Date(date);
  const dateStr = dateObj.toISOString().split("T")[0];

  const queryMap = {
    ai_programming: [
      `AI coding tools ${dateStr}`,
      `GitHub Copilot new features ${dateStr}`,
      `AI programming assistant updates`,
      `code generation AI news`,
      `developer AI tools latest`,
    ],
    ai_products: [
      `AI product launch ${dateStr}`,
      `new AI model release`,
      `GPT Claude Gemini updates`,
      `AI startup announcement`,
      `enterprise AI products news`,
    ],
    tech_general: [
      `technology news ${dateStr}`,
      `tech industry updates`,
      `AI technology breakthrough`,
      `tech company announcement`,
      `emerging technology trends`,
    ],
  };

  return queryMap[category] || [];
}

/**
 * 生成补充建议
 * @param {Object} rssData RSS抓取结果
 * @param {string} date 日期（YYYY-MM-DD）
 * @returns {Object} 补充建议
 */
async function generateSupplementSuggestions(rssData, date) {
  const suggestions = {
    timestamp: new Date().toISOString(),
    date: date,
    categories: {},
    summary: {
      totalCategories: 0,
      needSupplementCount: 0,
      totalSearchQueries: 0,
    },
  };

  // 分析每个类目
  for (const [category, items] of Object.entries(rssData)) {
    if (category === "metadata") continue;

    const analysis = analyzeCategoryQuality(items);
    const searchQueries = analysis.needsSupplement
      ? generateSearchQueries(category, date)
      : [];

    suggestions.categories[category] = {
      analysis,
      searchQueries,
      targetCount: analysis.needsSupplement ? 5 - analysis.count : 0,
    };

    suggestions.summary.totalCategories++;
    if (analysis.needsSupplement) {
      suggestions.summary.needSupplementCount++;
      suggestions.summary.totalSearchQueries += searchQueries.length;
    }
  }

  return suggestions;
}

/**
 * 打印补充建议报告
 * @param {Object} suggestions 补充建议
 */
function printSuggestions(suggestions) {
  console.log("\n" + "=".repeat(60));
  console.log("🤖 AI智能补充分析报告");
  console.log("=".repeat(60));
  console.log(
    `分析时间: ${new Date(suggestions.timestamp).toLocaleString("zh-CN")}`
  );
  console.log(`目标日期: ${suggestions.date}`);
  console.log(
    `总类目数: ${suggestions.summary.totalCategories} | 需要补充: ${suggestions.summary.needSupplementCount}`
  );

  console.log("\n📊 各类目详情:");
  for (const [category, data] of Object.entries(suggestions.categories)) {
    const { analysis, searchQueries, targetCount } = data;
    const icon = analysis.needsSupplement ? "⚠️" : "✅";

    console.log(`\n  ${icon} ${category}:`);
    console.log(`    当前数量: ${analysis.count}条`);
    console.log(
      `    质量分数: ${analysis.qualityScore} (可信度: ${analysis.avgCredibility})`
    );
    console.log(`    判断结果: ${analysis.reason}`);

    if (analysis.needsSupplement) {
      console.log(`    建议补充: ${targetCount}条资讯`);
      console.log(`    搜索建议 (${searchQueries.length}个):`);
      searchQueries.forEach((query, idx) => {
        console.log(`      ${idx + 1}. "${query}"`);
      });
    }
  }

  console.log("\n💡 使用建议:");
  if (suggestions.summary.needSupplementCount > 0) {
    console.log("  1. 使用web_search工具执行上述搜索查询");
    console.log("  2. 从搜索结果中筛选高质量资讯");
    console.log("  3. 合并到RSS抓取结果中");
    console.log("  4. 重新运行去重和评估流程");
  } else {
    console.log("  ✨ 所有类目的资讯质量和数量都充足，无需补充！");
  }

  console.log("\n" + "=".repeat(60));
}

/**
 * 保存补充建议
 * @param {Object} suggestions 补充建议
 */
async function saveSuggestions(suggestions) {
  const dataDir = path.join(__dirname, "../data");
  const filePath = path.join(
    dataDir,
    `supplement-suggestions-${suggestions.date}.json`
  );

  await fs.writeFile(filePath, JSON.stringify(suggestions, null, 2));
  console.log(`\n📄 补充建议已保存到: ${path.basename(filePath)}`);
}

/**
 * 主程序
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(
      "使用方法: node intelligent-supplement.js <RSS抓取结果文件> [日期]"
    );
    console.log(
      "示例: node intelligent-supplement.js data/rss-fetch-2025-11-10.json"
    );
    process.exit(1);
  }

  const rssFilePath = args[0];

  // 从文件名提取日期
  const dateMatch = rssFilePath.match(/(\d{4}-\d{2}-\d{2})/);
  const date =
    args[1] ||
    (dateMatch ? dateMatch[1] : new Date().toISOString().split("T")[0]);

  try {
    console.log(`📖 读取RSS抓取结果: ${rssFilePath}`);
    const rssData = JSON.parse(await fs.readFile(rssFilePath, "utf-8"));

    console.log("🔍 分析资讯质量和数量...");
    const suggestions = await generateSupplementSuggestions(rssData, date);

    printSuggestions(suggestions);
    await saveSuggestions(suggestions);

    console.log("\n✅ 分析完成！");

    // 如果需要补充，退出码为2（表示需要进一步操作）
    if (suggestions.summary.needSupplementCount > 0) {
      process.exit(2);
    }
  } catch (error) {
    console.error("\n❌ 分析过程出错:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (import.meta.url === `file://${__filename}`) {
  main();
}

// 导出函数供其他模块使用
export {
  analyzeCategoryQuality,
  generateSearchQueries,
  generateSupplementSuggestions,
  printSuggestions,
  saveSuggestions,
};
