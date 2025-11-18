#!/usr/bin/env node

/**
 * 筛选资讯工具
 *
 * 评估资讯的影响力和可信度
 * 筛选出每个类别最重要的 1-3 篇
 *
 * 执行: node filter-news.js data/collected-news-YYYY-MM-DD.json
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 影响力评分维度
const IMPACT_DIMENSIONS = {
  technicalInnovation: {
    name: "技术创新",
    weight: 0.35,
    keywords: [
      "breakthrough",
      "innovation",
      "novel",
      "first",
      "new architecture",
      "performance improvement",
      "efficiency",
      "optimization",
      "突破",
      "创新",
      "首次",
      "架构",
      "性能提升",
    ],
  },
  businessValue: {
    name: "商业价值",
    weight: 0.35,
    keywords: [
      "billion",
      "million",
      "market",
      "revenue",
      "funding",
      "valuation",
      "commercial",
      "enterprise",
      "customer",
      "adoption",
      "亿",
      "市场",
      "收入",
      "融资",
      "估值",
      "商业",
      "企业",
      "用户",
    ],
  },
  productDisruption: {
    name: "产品颠覆",
    weight: 0.2,
    keywords: [
      "launch",
      "release",
      "unveil",
      "introduce",
      "game-changer",
      "revolutionary",
      "transform",
      "disrupt",
      "发布",
      "推出",
      "颠覆",
      "革命",
      "改变",
    ],
  },
  sourceCredibility: {
    name: "来源可信",
    weight: 0.1,
    keywords: [
      "official",
      "announcement",
      "research paper",
      "study",
      "OpenAI",
      "Google",
      "Microsoft",
      "Meta",
      "Anthropic",
      "Stanford",
      "MIT",
      "Nature",
      "Science",
      "官方",
      "研究",
      "论文",
    ],
  },
};

// 可信来源列表
const TRUSTED_SOURCES = [
  "openai.com",
  "anthropic.com",
  "google.com",
  "microsoft.com",
  "github.com",
  "huggingface.co",
  "arxiv.org",
  "techcrunch.com",
  "theverge.com",
  "wired.com",
  "nature.com",
  "science.org",
  "mit.edu",
  "stanford.edu",
];

// 计算影响力分数
function calculateImpactScore(item) {
  const text = `${item.title} ${item.summary || ""} ${
    item.content || ""
  }`.toLowerCase();
  const scores = {};
  let totalScore = 0;

  for (const [key, dimension] of Object.entries(IMPACT_DIMENSIONS)) {
    // 计算关键词匹配数
    const matchCount = dimension.keywords.filter((keyword) =>
      text.includes(keyword.toLowerCase())
    ).length;

    // 归一化到 0-100
    const rawScore = Math.min(matchCount * 10, 100);
    scores[key] = rawScore;
    totalScore += rawScore * dimension.weight;
  }

  return {
    total: Math.round(totalScore),
    breakdown: scores,
  };
}

// 评估可信度
function assessCredibility(item) {
  let score = 0.5; // 基础分

  // 检查来源域名
  try {
    const url = new URL(item.url);
    const domain = url.hostname.toLowerCase();

    if (TRUSTED_SOURCES.some((trusted) => domain.includes(trusted))) {
      score += 0.35;
    }
  } catch (error) {
    // URL 解析失败
  }

  // 检查发布日期
  if (item.publishDate) {
    const publishDate = new Date(item.publishDate);
    const now = new Date();
    const daysDiff = (now - publishDate) / (1000 * 60 * 60 * 24);

    if (daysDiff <= 7) {
      score += 0.15;
    } else if (daysDiff <= 14) {
      score += 0.1;
    }
  }

  return Math.min(score, 1.0);
}

// 评估数据丰富度（0-100分）
function assessDataRichness(item) {
  let score = 0;
  const text = (item.title + " " + item.summary).toLowerCase();

  // 1. 数字和数据点 (40分)
  const numbers = text.match(
    /\d+[.,]?\d*\s*(亿|万|billion|million|%|美元|\$|元|倍|张|个|家|人|年)/g
  );
  score += Math.min((numbers?.length || 0) * 10, 40);

  // 2. 具体公司/产品名 (30分)
  const entities = [
    "openai",
    "google",
    "microsoft",
    "meta",
    "anthropic",
    "nvidia",
    "deepmind",
    "apple",
    "amazon",
    "tesla",
    "spacex",
    "阿里",
    "腾讯",
    "华为",
    "百度",
    "字节",
    "小米",
    "京东",
    "chatgpt",
    "gpt",
    "claude",
    "gemini",
    "llama",
    "alphafo",
  ];
  const entityCount = entities.filter((e) => text.includes(e)).length;
  score += Math.min(entityCount * 10, 30);

  // 3. 技术细节关键词 (30分)
  const techKeywords = [
    "architecture",
    "algorithm",
    "model",
    "api",
    "gpu",
    "chip",
    "training",
    "inference",
    "benchmark",
    "performance",
    "optimization",
    "framework",
    "架构",
    "算法",
    "模型",
    "性能",
    "训练",
    "推理",
    "优化",
    "芯片",
  ];
  const techCount = techKeywords.filter((k) => text.includes(k)).length;
  score += Math.min(techCount * 7, 30);

  return Math.round(score);
}

// 主函数
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("❌ 错误: 请提供收集的资讯文件路径");
    console.error(
      "用法: node filter-news.js data/collected-news-YYYY-MM-DD.json"
    );
    process.exit(1);
  }

  const inputFile = args[0];
  // 如果是绝对路径直接使用，否则相对于项目根目录（__dirname的上两级）
  const inputPath = path.isAbsolute(inputFile)
    ? inputFile
    : path.join(__dirname, "..", "..", inputFile);

  console.log("🔍 资讯筛选工具（重要性优先）\n");
  console.log(`读取文件: ${inputPath}\n`);

  // 读取收集的资讯
  const data = JSON.parse(await fs.readFile(inputPath, "utf-8"));

  // 收集所有类别的资讯到统一数组
  const allEvaluated = [];

  // 处理每个类别
  for (const [categoryId, categoryData] of Object.entries(data.categories)) {
    console.log("=".repeat(60));
    console.log(`\n📋 ${categoryData.name} (${categoryId})`);
    console.log(`   总计: ${categoryData.items.length} 条资讯\n`);

    const evaluated = categoryData.items.map((item) => {
      const impact = calculateImpactScore(item);
      const credibility = assessCredibility(item);
      const dataRichness = assessDataRichness(item);

      return {
        ...item,
        category: categoryId,
        categoryName: categoryData.name,
        impactScore: impact.total,
        impactBreakdown: impact.breakdown,
        credibility: Math.round(credibility * 100) / 100,
        dataRichness,
        recommended:
          impact.total >= 50 && credibility >= 0.85 && dataRichness >= 30,
      };
    });

    // 按影响力排序
    evaluated.sort((a, b) => b.impactScore - a.impactScore);

    // 显示评估结果
    evaluated.forEach((item, index) => {
      const icon = item.recommended ? "⭐" : "  ";
      console.log(`${icon} ${index + 1}. ${item.title.substring(0, 60)}...`);
      console.log(
        `     影响力: ${item.impactScore}/100 | 可信度: ${item.credibility} | 数据丰富度: ${item.dataRichness}/100`
      );
      console.log(`     来源: ${new URL(item.url).hostname}`);
      console.log(`     发布: ${item.publishDate || "未知"}`);

      if (item.recommended) {
        console.log(`     ✅ 推荐深度分析`);
      } else if (item.dataRichness < 30) {
        console.log(`     ❌ 数据不足 (需要≥30分)`);
      }
      console.log();
    });

    // 添加到全局数组
    allEvaluated.push(...evaluated);
  }

  console.log("=".repeat(60));
  console.log("\n🌟 全局筛选（重要性优先，跨类别 Top 10）\n");

  // 全局排序：按影响力降序
  allEvaluated.sort((a, b) => b.impactScore - a.impactScore);

  // 筛选推荐的资讯（影响力≥50，可信度≥0.85，最多10篇）
  const recommended = allEvaluated
    .filter((item) => item.recommended)
    .slice(0, 10);

  console.log(`✅ 推荐 ${recommended.length} 篇进行深度分析:\n`);
  recommended.forEach((item, index) => {
    console.log(
      `${index + 1}. [${item.categoryName}] ${item.title.substring(0, 50)}...`
    );
    console.log(`   影响力: ${item.impactScore} | 可信度: ${item.credibility}`);
  });
  console.log();

  // 统计每个类别的推荐数量
  const categoryBreakdown = {};
  for (const [categoryId, categoryData] of Object.entries(data.categories)) {
    categoryBreakdown[categoryId] = recommended.filter(
      (item) => item.category === categoryId
    ).length;
  }

  // 构建结果对象（扁平化结构）
  const result = {
    date: data.date,
    recommended: recommended,
    metadata: {
      filteredAt: new Date().toISOString(),
      minImpactScore: 50,
      minCredibility: 0.85,
      maxNewsCount: 10,
      totalRecommended: recommended.length,
      categoryBreakdown: categoryBreakdown,
    },
  };

  // 保存结果
  const outputFile = inputFile
    .replace("collected-news", "filtered-news")
    .replace("deduplicated-news", "filtered-news");
  const outputPath = path.isAbsolute(outputFile)
    ? outputFile
    : path.join(__dirname, "..", "..", outputFile);

  await fs.writeFile(outputPath, JSON.stringify(result, null, 2));

  console.log("=".repeat(60));
  console.log(`\n💾 筛选结果已保存: ${outputPath}\n`);

  // 统计总结
  console.log("📊 筛选总结（重要性优先）:");
  console.log(
    `   - 总资讯数: ${Object.values(data.categories).reduce(
      (sum, cat) => sum + cat.items.length,
      0
    )} 条`
  );
  console.log(
    `   - 推荐分析: ${recommended.length} 篇（跨类别 Top ${recommended.length}）`
  );
  console.log(`   - AI编程: ${categoryBreakdown["ai-programming"]} 篇`);
  console.log(`   - AI产品: ${categoryBreakdown["ai-products"]} 篇`);
  console.log(`   - 科技综合: ${categoryBreakdown["tech-general"]} 篇`);
  console.log();

  console.log("💡 提示: 类别数量不再均衡，而是按重要性优先排序");
  console.log("📝 下一步: 生成资讯大纲");
  console.log(`   node mcp-server/tools/generate-outline.js ${outputFile}\n`);
}

main().catch(console.error);
