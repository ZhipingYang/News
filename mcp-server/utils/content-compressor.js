/**
 * 内容压缩器
 * 在AI分析前对RSS原始内容进行智能压缩，提取关键信息
 * 目标：将内容压缩至原文的30-40%，同时保留核心信息
 */

/**
 * 提取关键数据点（数字、百分比、日期等）
 * @param {string} text 文本内容
 * @returns {Array<string>} 关键数据点
 */
function extractKeyDataPoints(text) {
  const dataPoints = [];

  // 提取百分比
  const percentages = text.match(/\d+\.?\d*%/g);
  if (percentages) {
    dataPoints.push(...percentages.map((p) => `增长/变化: ${p}`));
  }

  // 提取货币金额
  const currencies = text.match(
    /\$[\d,]+\.?\d*[BMK]?|\d+[\.,]\d+\s*(亿|百万|million|billion)/gi
  );
  if (currencies) {
    dataPoints.push(...currencies.map((c) => `金额: ${c}`));
  }

  // 提取数字+单位组合
  const measurements = text.match(
    /\d+\.?\d*\s*(GB|TB|GHz|TFLOPS|tokens|parameters|users|倍)/gi
  );
  if (measurements) {
    dataPoints.push(...measurements.map((m) => `指标: ${m}`));
  }

  // 提取日期
  const dates = text.match(
    /\d{4}年\d{1,2}月|\d{4}-\d{2}-\d{2}|Q[1-4]\s*\d{4}/g
  );
  if (dates) {
    dataPoints.push(...dates.map((d) => `时间: ${d}`));
  }

  return [...new Set(dataPoints)].slice(0, 10); // 去重，最多保留10个
}

/**
 * 提取关键句子（包含重要关键词的句子）
 * @param {string} text 文本内容
 * @param {Array<string>} keywords 关键词列表
 * @returns {Array<string>} 关键句子
 */
function extractKeySentences(text, keywords = []) {
  const sentences = text
    .replace(/\n+/g, " ")
    .split(/[。.！!？?;；]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 300);

  // 重要关键词列表（可根据类目调整）
  const importantKeywords = [
    // 技术关键词
    "release",
    "launch",
    "announce",
    "introduce",
    "发布",
    "推出",
    "宣布",
    "breakthrough",
    "innovation",
    "new",
    "突破",
    "创新",
    "新",
    "performance",
    "improve",
    "faster",
    "better",
    "性能",
    "提升",
    "改进",
    "model",
    "algorithm",
    "architecture",
    "模型",
    "算法",
    "架构",
    // 商业关键词
    "partnership",
    "acquisition",
    "funding",
    "investment",
    "合作",
    "收购",
    "融资",
    "投资",
    "revenue",
    "profit",
    "market",
    "customer",
    "收入",
    "利润",
    "市场",
    "客户",
    "product",
    "feature",
    "service",
    "产品",
    "功能",
    "服务",
    // 数据关键词
    "study",
    "research",
    "report",
    "data",
    "研究",
    "报告",
    "数据",
    ...keywords,
  ];

  // 为句子打分
  const scoredSentences = sentences.map((sentence) => {
    let score = 0;
    const lowerSentence = sentence.toLowerCase();

    // 包含重要关键词加分
    for (const keyword of importantKeywords) {
      if (lowerSentence.includes(keyword.toLowerCase())) {
        score += 2;
      }
    }

    // 包含数字加分
    if (/\d+/.test(sentence)) {
      score += 1;
    }

    // 包含引用加分
    if (
      /"[^"]+"/.test(sentence) ||
      /said|stated|announced|表示|称|宣布/.test(lowerSentence)
    ) {
      score += 1;
    }

    // 句子长度适中加分
    if (sentence.length > 50 && sentence.length < 200) {
      score += 1;
    }

    return { sentence, score };
  });

  // 按分数排序，取前5-8句
  return scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((item) => item.sentence);
}

/**
 * 提取技术细节
 * @param {string} text 文本内容
 * @returns {Array<string>} 技术细节
 */
function extractTechnicalDetails(text) {
  const details = [];

  // 技术术语模式
  const techPatterns = [
    /\b(?:API|SDK|framework|library|architecture|model|algorithm)\s+[A-Za-z0-9\-_]+/gi,
    /\b[A-Z][a-z]+(?:[A-Z][a-z]+)+\b/g, // CamelCase技术名称
    /\b(?:GPU|CPU|TPU|NPU|transformer|attention|encoder|decoder)\b/gi,
    /\b(?:Python|JavaScript|TypeScript|Java|Go|Rust|C\+\+)\s*\d*\.?\d*/gi,
  ];

  for (const pattern of techPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      details.push(...matches);
    }
  }

  return [...new Set(details)].slice(0, 15);
}

/**
 * 压缩单条资讯内容
 * @param {Object} newsItem 资讯对象
 * @returns {Object} 压缩后的资讯对象
 */
export function compressNewsItem(newsItem) {
  const { title, description, link, source, credibility } = newsItem;

  if (!description || description.length < 100) {
    // 内容太短，不需要压缩
    return {
      ...newsItem,
      compressed: false,
      originalLength: description?.length || 0,
    };
  }

  const originalLength = description.length;

  // 提取关键信息
  const dataPoints = extractKeyDataPoints(description);
  const keySentences = extractKeySentences(description);
  const technicalDetails = extractTechnicalDetails(description);

  // 构建压缩后的内容
  const compressedParts = [];

  // 1. 标题和来源
  compressedParts.push(`【标题】${title}`);
  compressedParts.push(`【来源】${source} (可信度: ${credibility})`);

  // 2. 关键数据点
  if (dataPoints.length > 0) {
    compressedParts.push(`\n【关键数据】`);
    compressedParts.push(...dataPoints.map((dp) => `- ${dp}`));
  }

  // 3. 核心内容（关键句子）
  if (keySentences.length > 0) {
    compressedParts.push(`\n【核心内容】`);
    compressedParts.push(...keySentences.map((s) => `- ${s}`));
  }

  // 4. 技术细节
  if (technicalDetails.length > 0) {
    compressedParts.push(`\n【技术关键词】`);
    compressedParts.push(technicalDetails.join(", "));
  }

  // 5. 原文链接
  compressedParts.push(`\n【原文链接】${link}`);

  const compressedContent = compressedParts.join("\n");
  const compressionRatio = (
    (1 - compressedContent.length / originalLength) *
    100
  ).toFixed(1);

  return {
    ...newsItem,
    compressedDescription: compressedContent,
    compressed: true,
    originalLength,
    compressedLength: compressedContent.length,
    compressionRatio: `${compressionRatio}%`,
    keyDataPoints: dataPoints,
    technicalDetails,
  };
}

/**
 * 批量压缩资讯列表
 * @param {Array<Object>} newsItems 资讯列表
 * @param {Object} options 压缩选项
 * @returns {Object} 压缩结果
 */
export function compressNewsList(newsItems, options = {}) {
  const {
    minLength = 100, // 最小长度才压缩
    keepOriginal = false, // 是否保留原始内容
  } = options;

  const results = {
    timestamp: new Date().toISOString(),
    totalItems: newsItems.length,
    compressedCount: 0,
    skippedCount: 0,
    totalOriginalLength: 0,
    totalCompressedLength: 0,
    items: [],
  };

  for (const item of newsItems) {
    const compressed = compressNewsItem(item);

    if (compressed.compressed) {
      results.compressedCount++;
      results.totalOriginalLength += compressed.originalLength;
      results.totalCompressedLength += compressed.compressedLength;
    } else {
      results.skippedCount++;
    }

    // 根据选项决定是否保留原始内容
    if (!keepOriginal && compressed.compressed) {
      delete compressed.description;
    }

    results.items.push(compressed);
  }

  // 计算总体压缩率
  if (results.totalOriginalLength > 0) {
    results.overallCompressionRatio =
      (
        (1 - results.totalCompressedLength / results.totalOriginalLength) *
        100
      ).toFixed(1) + "%";
  }

  return results;
}

/**
 * 压缩分类资讯数据
 * @param {Object} categorizedData 按类目分类的资讯数据
 * @param {Object} options 压缩选项
 * @returns {Object} 压缩后的数据
 */
export function compressCategorizedNews(categorizedData, options = {}) {
  const compressed = {
    metadata: {
      timestamp: new Date().toISOString(),
      compressionStats: {},
    },
  };

  for (const [category, items] of Object.entries(categorizedData)) {
    if (category === "metadata" || !Array.isArray(items)) {
      compressed[category] = items;
      continue;
    }

    const result = compressNewsList(items, options);
    compressed[category] = result.items;
    compressed.metadata.compressionStats[category] = {
      totalItems: result.totalItems,
      compressedCount: result.compressedCount,
      skippedCount: result.skippedCount,
      compressionRatio: result.overallCompressionRatio,
    };
  }

  return compressed;
}

/**
 * 打印压缩统计信息
 * @param {Object} stats 压缩统计
 */
export function printCompressionStats(stats) {
  console.log("\n" + "=".repeat(60));
  console.log("📦 内容压缩统计");
  console.log("=".repeat(60));

  for (const [category, data] of Object.entries(stats)) {
    console.log(`\n  ${category}:`);
    console.log(
      `    总数: ${data.totalItems} | 已压缩: ${data.compressedCount} | 跳过: ${data.skippedCount}`
    );
    if (data.compressionRatio) {
      console.log(`    压缩率: ${data.compressionRatio}`);
    }
  }

  console.log("\n" + "=".repeat(60));
}

// 主程序（如果直接运行此文件）
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("使用方法: node content-compressor.js <输入文件> [输出文件]");
    console.log(
      "示例: node content-compressor.js data/processed-rss-2025-11-10.json"
    );
    process.exit(1);
  }

  const inputFile = args[0];
  const outputFile = args[1] || inputFile.replace(".json", "-compressed.json");

  try {
    const fs = await import("fs/promises");
    console.log(`📖 读取文件: ${inputFile}`);
    const data = JSON.parse(await fs.readFile(inputFile, "utf-8"));

    console.log("🔄 正在压缩内容...");
    const compressed = compressCategorizedNews(data, { keepOriginal: false });

    console.log("💾 保存压缩结果...");
    await fs.writeFile(outputFile, JSON.stringify(compressed, null, 2));

    printCompressionStats(compressed.metadata.compressionStats);
    console.log(`\n✅ 压缩完成！输出文件: ${outputFile}`);
  } catch (error) {
    console.error("\n❌ 压缩过程出错:", error.message);
    process.exit(1);
  }
}

// 检测是否为主模块
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
