#!/usr/bin/env node

/**
 * 生成资讯大纲工具
 *
 * 为筛选出的资讯生成结构化大纲
 * 便于后续深度分析和数据收集
 *
 * 执行: node generate-outline.js data/filtered-news-YYYY-MM-DD.json
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 大纲模板
function createOutlineTemplate(item, categoryName) {
  const emoji = getCategoryEmoji(categoryName);

  return {
    title: item.title,
    url: item.url,
    publishDate: item.publishDate,
    category: categoryName,
    impactScore: item.impactScore,
    credibility: item.credibility,

    outline: {
      header: {
        title: `${emoji} ${item.title}`,
        subtitle: "[待补充: 核心价值/影响的副标题]",
        metadata: {
          publishDate: item.publishDate,
          source: `[来源名称](${item.url})`,
          category: categoryName,
          credibilityStars: getCredibilityStars(item.credibility),
          impactScore: `${item.impactScore}/100`,
        },
      },

      executiveSummary: {
        title: "执行摘要",
        coreArgument: "[一句话核心论点]",
        strategicQuestion:
          "[200-300字描述核心商业/技术问题，包含具体矛盾和权衡]",
        keyMetrics: {
          note: "需要收集3个维度的对比数据",
          dimensions: ["初期投入", "TCO（3年）", "性能指标", "生态成本"],
          tableFormat: "| 维度 | 方案A | 方案B | 方案C |",
        },
        strategicJudgment: [
          "针对企业: [时间节点 + 投资额度 + 预期收益]",
          "针对投资者: [时间节点 + 投资额度 + 预期收益]",
          "针对技术人员: [时间节点 + 投资额度 + 预期收益]",
        ],
      },

      technicalAnalysis: {
        title: "技术深度解析",
        targetWords: "400-500字",
        questions: [
          "What: 采用什么技术？核心技术机制是什么？",
          "Why: 为什么选择这个技术路线？",
          "How: 如何实现的？攻克了什么技术难点？",
          "So What: 技术突破的本质意义是什么？",
        ],
        mustInclude: [
          "核心技术机制说明",
          "创新点分析（渐进式 or 突破性）",
          "技术成熟度评估",
          "技术路线图（短期/中期/长期）",
          "局限性深度剖析（根本原因+突破路径）",
        ],
        dataToCollect: [
          "性能数据（提升百分比、具体数字）",
          "技术架构图",
          "与竞品的技术对比",
        ],
      },

      businessLogic: {
        title: "商业逻辑与价值分析",
        targetWords: "600-800字",
        note: "这是最重要的部分，必须深入！",
        sections: {
          businessModel: {
            title: "商业模式深度剖析",
            questions: [
              "收入模式: 如何赚钱？为什么？可持续性？",
              "成本结构: 构成？边际成本？规模经济？",
              "定价策略: 逻辑？如何平衡价值和成本？",
              "竞争壁垒: 护城河在哪？如何被突破？",
            ],
          },
          valueChain: {
            title: "价值链与生态重构",
            questions: [
              "价值链变化: 哪些环节被改变？为什么？",
              "利益重新分配: 谁受损？谁受益？",
              "生态位变化: 角色如何变？权力如何转移？",
              "商业模式创新: 新玩法？为什么可行？",
            ],
          },
          investmentLogic: {
            title: "投资与财务逻辑",
            questions: [
              "投资价值: 为什么值得？风险？",
              "估值逻辑: 如何估？合理区间？",
              "财务模型: LTV/CAC？盈利路径？",
              "资本流向: 钱会流向哪？",
            ],
          },
          marketOpportunity: {
            title: "市场机会量化",
            format:
              "TAM (总市场): $XXX亿\nSAM (可服务市场): $XXX亿\nSOM (可获得市场): $XXX亿",
          },
          competitiveLandscape: {
            title: "竞争格局分析",
            mustInclude: [
              "主要玩家定位矩阵",
              "差异化分析（优势/劣势/护城河）",
              "竞争壁垒评估",
            ],
          },
        },
        dataToCollect: [
          "市场规模数据",
          "收入和成本数据",
          "ROI 计算",
          "竞品对比表格",
          "定价策略分析",
        ],
      },

      strategicSignificance: {
        title: "战略意义与未来推演",
        targetWords: "400-450字",
        sections: {
          strategicPositioning: {
            title: "战略定位分析",
            questions: [
              "历史坐标: 在科技演进图谱中的位置？",
              "地缘战略: 全球AI竞赛格局中的影响？",
            ],
          },
          scenarioPlanning: {
            title: "情景推演（概率加权）",
            scenarios: [
              "乐观情景 (X%概率): 触发条件、演进路径、影响",
              "基准情景 (Y%概率): 触发条件、演进路径、影响",
              "悲观情景 (Z%概率): 触发条件、演进路径、影响",
            ],
          },
          timeline: {
            title: "时间线预测",
            phases: [
              "Phase 1 (0-6个月): 关键里程碑",
              "Phase 2 (6-12个月): 关键变化",
              "Phase 3 (12-24个月): 关键转折",
              "Phase 4 (2-5年): 终局推演",
            ],
          },
        },
      },

      actionRecommendations: {
        title: "行动建议",
        targetWords: "200-250字",
        sections: {
          coreInsights: {
            title: "核心洞察（3-5条）",
            requirements: [
              "每条必须有论据支撑",
              "具有反共识特点",
              "对决策有实质影响",
            ],
          },
          forEnterprises: {
            title: "对企业（CEO/CTO）",
            timeline: [
              "立即行动 (0-3个月): 具体事项 + 预算",
              "短期行动 (3-12个月): 具体事项 + 预算",
              "中期战略 (1-3年): 具体事项 + 预算",
            ],
          },
          forInvestors: {
            title: "对投资者（VC/PE）",
            sections: [
              "当前最佳机会（按优先级）",
              "避免投资方向",
              "投资策略和退出路径",
            ],
          },
          forPractitioners: {
            title: "对从业者",
            timeline: [
              "短期技能发展 (0-6个月)",
              "中期能力建设 (6-18个月)",
              "长期职业规划 (18个月+)",
            ],
          },
          kpiDashboard: {
            title: "关注指标（KPI Dashboard）",
            categories: ["技术指标", "商业指标", "竞争指标", "监管指标"],
          },
        },
      },
    },

    dataCollectionQueries: generateSearchQueries(item),

    qualityChecklist: {
      format: [
        '包含"发布日期"',
        '包含"来源"（带链接）',
        '包含"分类"',
        '包含"可信度评分"',
        '包含"执行摘要"',
        "使用分隔符 ---",
      ],
      content: [
        "至少3个数据表格",
        "至少1个代码/架构图",
        "商业模式分析（收入+成本+ROI）",
        "行动建议（时间+金额+收益）",
        "案例+数字佐证",
        "总字数2000-3000字",
      ],
      depth: [
        "每个论断有数据支撑",
        '分析了"为什么"',
        "深入商业逻辑",
        "多种情景分析",
        "可操作的建议",
      ],
    },
  };
}

// 生成补充搜索查询
function generateSearchQueries(item) {
  const title = item.title;
  const keywords = extractKeywords(title);

  return [
    `${keywords.product} technical details architecture`,
    `${keywords.product} pricing cost business model`,
    `${keywords.product} market size revenue`,
    `${keywords.product} vs competitors comparison`,
    `${keywords.product} user feedback reviews`,
    `${keywords.product} expert analysis opinion`,
    `${keywords.company} financial report earnings`,
    `${keywords.technology} performance benchmarks`,
  ].filter((q) => q.trim().length > 10);
}

// 提取关键词
function extractKeywords(title) {
  // 简单的关键词提取（实际应该更智能）
  const words = title.split(/\s+/);
  return {
    product: words.slice(0, 3).join(" "),
    company: words.find((w) => /^[A-Z][a-z]+$/.test(w)) || "",
    technology: words.find((w) => /AI|ML|LLM|GPT/i.test(w)) || "AI",
  };
}

// 获取类别 emoji
function getCategoryEmoji(category) {
  const emojiMap = {
    AI编程: "🔧",
    AI产品: "🚀",
    科技综合: "📡",
  };
  return emojiMap[category] || "📰";
}

// 获取可信度星级
function getCredibilityStars(credibility) {
  const stars = Math.round(credibility * 5);
  return "⭐".repeat(stars);
}

// 主函数
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("❌ 错误: 请提供筛选后的资讯文件路径");
    console.error(
      "用法: node generate-outline.js data/filtered-news-YYYY-MM-DD.json"
    );
    process.exit(1);
  }

  const inputFile = args[0];
  const inputPath = path.isAbsolute(inputFile)
    ? inputFile
    : path.join(__dirname, "..", inputFile);

  console.log("📝 资讯大纲生成工具\n");
  console.log(`读取文件: ${inputPath}\n`);

  // 读取筛选后的资讯
  const data = JSON.parse(await fs.readFile(inputPath, "utf-8"));

  const result = {
    date: data.date,
    outlines: [],
    metadata: {
      generatedAt: new Date().toISOString(),
      totalOutlines: 0,
    },
  };

  // 为每个推荐的资讯生成大纲（扁平化结构）
  console.log("=".repeat(60));
  console.log(`\n📋 生成资讯大纲`);
  console.log(`   推荐 ${data.recommended.length} 篇资讯\n`);

  for (const item of data.recommended) {
    console.log(`✏️  生成大纲: ${item.title.substring(0, 50)}...`);
    console.log(`   类别: ${item.categoryName}`);

    const outline = createOutlineTemplate(item, item.categoryName);
    result.outlines.push(outline);
    result.metadata.totalOutlines++;

    console.log(
      `   ✅ 已生成 (影响力: ${item.impactScore}, 可信度: ${item.credibility})`
    );
    console.log(
      `   🔍 补充搜索查询: ${outline.dataCollectionQueries.length} 个\n`
    );
  }

  // 保存结果
  const outputFile = inputFile.replace("filtered-news", "outlines");
  const outputPath = path.isAbsolute(outputFile)
    ? outputFile
    : path.join(__dirname, "..", outputFile);

  await fs.writeFile(outputPath, JSON.stringify(result, null, 2));

  console.log("=".repeat(60));
  console.log(`\n💾 大纲已保存: ${outputPath}\n`);

  console.log("📊 生成总结:");
  console.log(`   - 总大纲数: ${result.metadata.totalOutlines} 篇`);
  console.log();

  console.log("📝 下一步: 深度分析和数据收集\n");
  console.log("在 Cursor Chat 中执行:\n");
  console.log("```");
  console.log("@AI-ANALYSIS-GUIDE.md @" + outputFile);
  console.log("");
  console.log("请根据大纲,为每篇资讯:");
  console.log("1. 执行补充搜索查询 (dataCollectionQueries)");
  console.log("2. 收集数据和案例");
  console.log("3. 生成2000-3000字深度分析");
  console.log("4. 保存到 news_markdown/YYYY-MM-DD/ 对应类别文件");
  console.log("```\n");
}

main().catch(console.error);
