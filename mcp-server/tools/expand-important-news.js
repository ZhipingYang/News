import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 重要资讯扩展工具
 *
 * 功能：当资讯数量少但有高影响力的资讯时，AI可以：
 * 1. 使用web_search搜索该资讯的更多背景信息
 * 2. 收集相关的技术细节、市场反应、专家评论
 * 3. 生成一篇完整的深度分析文章
 *
 * 使用场景：
 * - 某个类目资讯<3条，但有影响力很大的重要资讯
 * - 重大产品发布、技术突破、行业变革等
 */

/**
 * 评估资讯的影响力
 * @param {Object} newsItem 资讯对象
 * @returns {Object} 影响力评估结果
 */
function assessNewsImpact(newsItem) {
  const {
    title = "",
    description = "",
    source = "",
    credibility = 0.8,
  } = newsItem;

  let impactScore = 0;
  const reasons = [];

  // 1. 关键词权重（重大发布、突破等）
  const highImpactKeywords = [
    // 产品发布类
    "launch",
    "release",
    "announce",
    "unveil",
    "发布",
    "推出",
    "宣布",
    // 技术突破类
    "breakthrough",
    "revolutionary",
    "first",
    "record",
    "突破",
    "首次",
    "创纪录",
    // 融资收购类
    "funding",
    "acquisition",
    "billion",
    "million",
    "融资",
    "收购",
    "亿美元",
    // 重大更新类
    "major update",
    "significant",
    "milestone",
    "重大更新",
    "里程碑",
    // 行业影响类
    "industry",
    "market",
    "competition",
    "行业",
    "市场",
    "竞争",
  ];

  const titleLower = title.toLowerCase();
  const descLower = (description || "").toLowerCase();
  const content = `${titleLower} ${descLower}`;

  let keywordMatches = 0;
  for (const keyword of highImpactKeywords) {
    if (content.includes(keyword.toLowerCase())) {
      keywordMatches++;
    }
  }

  if (keywordMatches >= 3) {
    impactScore += 30;
    reasons.push(`包含${keywordMatches}个高影响力关键词`);
  } else if (keywordMatches >= 2) {
    impactScore += 20;
    reasons.push(`包含${keywordMatches}个高影响力关键词`);
  }

  // 2. 来源可信度加分
  if (credibility >= 0.9) {
    impactScore += 20;
    reasons.push(`来源可信度高（${credibility}）`);
  } else if (credibility >= 0.85) {
    impactScore += 15;
    reasons.push(`来源可信度较高（${credibility}）`);
  }

  // 3. 知名公司/机构加分
  const majorCompanies = [
    "OpenAI",
    "Google",
    "Microsoft",
    "Meta",
    "Apple",
    "Amazon",
    "NVIDIA",
    "Anthropic",
    "DeepMind",
    "Tesla",
    "IBM",
    "Intel",
    "AMD",
    "Stanford",
    "MIT",
    "CMU",
    "Harvard",
    "Nature",
    "Science",
  ];

  for (const company of majorCompanies) {
    if (content.includes(company.toLowerCase())) {
      impactScore += 15;
      reasons.push(`涉及知名机构：${company}`);
      break;
    }
  }

  // 4. 数字/数据加分（表明有具体指标）
  const hasNumbers = /\d+%|\d+\s*(billion|million|倍|亿|万)/i.test(content);
  if (hasNumbers) {
    impactScore += 10;
    reasons.push("包含关键数据指标");
  }

  // 5. 内容长度加分（详细报道通常更重要）
  if (description && description.length > 500) {
    impactScore += 10;
    reasons.push("内容详细（>500字）");
  }

  return {
    impactScore,
    isHighImpact: impactScore >= 50, // 50分以上认为是高影响力
    reasons,
    needsExpansion: impactScore >= 50,
  };
}

/**
 * 生成web_search搜索查询
 * @param {Object} newsItem 资讯对象
 * @returns {Array<string>} 搜索查询列表
 */
function generateSearchQueries(newsItem) {
  const { title, source } = newsItem;

  // 提取关键实体（公司名、产品名等）
  const queries = [];

  // 1. 原标题
  queries.push(title);

  // 2. 标题 + 背景
  queries.push(`${title} background context`);

  // 3. 标题 + 技术细节
  queries.push(`${title} technical details`);

  // 4. 标题 + 市场反应
  queries.push(`${title} market reaction analysis`);

  // 5. 标题 + 专家评论
  queries.push(`${title} expert opinion`);

  return queries;
}

/**
 * 分析资讯列表，识别需要扩展的重要资讯
 * @param {Object} categorizedData 按类目分类的资讯数据
 * @returns {Object} 扩展建议
 */
function analyzeForExpansion(categorizedData) {
  const suggestions = {
    timestamp: new Date().toISOString(),
    categories: {},
    summary: {
      totalCategories: 0,
      lowVolumeCategories: 0,
      highImpactNewsCount: 0,
      expansionRecommended: false,
    },
  };

  for (const [category, items] of Object.entries(categorizedData)) {
    if (category === "metadata" || !Array.isArray(items)) continue;

    suggestions.summary.totalCategories++;

    const itemCount = items.length;
    const isLowVolume = itemCount < 5;

    if (isLowVolume) {
      suggestions.summary.lowVolumeCategories++;
    }

    // 评估每条资讯的影响力
    const highImpactNews = [];
    for (const item of items) {
      const assessment = assessNewsImpact(item);
      if (assessment.isHighImpact) {
        highImpactNews.push({
          ...item,
          assessment,
          searchQueries: generateSearchQueries(item),
        });
        suggestions.summary.highImpactNewsCount++;
      }
    }

    suggestions.categories[category] = {
      itemCount,
      isLowVolume,
      highImpactNews,
      needsExpansion: isLowVolume && highImpactNews.length > 0,
    };

    if (isLowVolume && highImpactNews.length > 0) {
      suggestions.summary.expansionRecommended = true;
    }
  }

  return suggestions;
}

/**
 * 打印扩展建议报告
 * @param {Object} suggestions 扩展建议
 */
function printExpansionReport(suggestions) {
  console.log("\n" + "=".repeat(60));
  console.log("📰 重要资讯扩展分析");
  console.log("=".repeat(60));
  console.log(
    `分析时间: ${new Date(suggestions.timestamp).toLocaleString("zh-CN")}`
  );
  console.log(`总类目数: ${suggestions.summary.totalCategories}`);
  console.log(`资讯不足类目: ${suggestions.summary.lowVolumeCategories}`);
  console.log(`高影响力资讯: ${suggestions.summary.highImpactNewsCount}条`);
  console.log(
    `建议扩展: ${suggestions.summary.expansionRecommended ? "是" : "否"}`
  );

  if (suggestions.summary.expansionRecommended) {
    console.log("\n📋 各类目详情:");

    for (const [category, data] of Object.entries(suggestions.categories)) {
      if (data.needsExpansion) {
        console.log(`\n  ⚠️ ${category}:`);
        console.log(`    当前资讯数: ${data.itemCount}条（不足）`);
        console.log(`    高影响力资讯: ${data.highImpactNews.length}条`);

        for (const [idx, news] of data.highImpactNews.entries()) {
          console.log(`\n    📰 高影响力资讯 #${idx + 1}:`);
          console.log(`       标题: ${news.title}`);
          console.log(`       影响力分数: ${news.assessment.impactScore}`);
          console.log(`       原因:`);
          news.assessment.reasons.forEach((r) =>
            console.log(`         - ${r}`)
          );
          console.log(`       建议搜索查询 (${news.searchQueries.length}个):`);
          news.searchQueries.forEach((q, i) =>
            console.log(`         ${i + 1}. "${q}"`)
          );
        }
      } else {
        const icon = data.itemCount >= 5 ? "✅" : "ℹ️";
        console.log(
          `\n  ${icon} ${category}: ${data.itemCount}条资讯，${data.highImpactNews.length}条高影响力`
        );
      }
    }

    console.log("\n💡 使用建议:");
    console.log("  1. 使用web_search工具执行上述搜索查询");
    console.log("  2. 收集技术细节、市场反应、专家评论");
    console.log("  3. AI生成1500-2000字深度分析文章");
    console.log("  4. 将扩展文章加入到对应类目的每日资讯中");
  } else {
    console.log("\n  ✨ 所有类目资讯充足，或无高影响力资讯需要扩展");
  }

  console.log("\n" + "=".repeat(60));
}

/**
 * 保存扩展建议
 * @param {Object} suggestions 扩展建议
 * @param {string} date 日期
 */
async function saveSuggestions(suggestions, date) {
  const dataDir = path.join(__dirname, "../data");
  const filePath = path.join(dataDir, `expansion-suggestions-${date}.json`);

  await fs.writeFile(filePath, JSON.stringify(suggestions, null, 2));
  console.log(`\n📄 扩展建议已保存到: ${path.basename(filePath)}`);
}

/**
 * 主程序
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("使用方法: node expand-important-news.js <RSS处理结果文件>");
    console.log(
      "示例: node expand-important-news.js data/processed-rss-2025-11-10.json"
    );
    process.exit(1);
  }

  const dataFilePath = args[0];

  // 从文件名提取日期
  const dateMatch = dataFilePath.match(/(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch
    ? dateMatch[1]
    : new Date().toISOString().split("T")[0];

  try {
    console.log(`📖 读取资讯数据: ${dataFilePath}`);
    const data = JSON.parse(await fs.readFile(dataFilePath, "utf-8"));

    console.log("🔍 分析资讯影响力...");
    const suggestions = analyzeForExpansion(data);

    printExpansionReport(suggestions);
    await saveSuggestions(suggestions, date);

    console.log("\n✅ 分析完成！");

    // 如果建议扩展，退出码为2（表示需要进一步操作）
    if (suggestions.summary.expansionRecommended) {
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
  assessNewsImpact,
  generateSearchQueries,
  analyzeForExpansion,
  printExpansionReport,
  saveSuggestions,
};
