/**
 * 内容分析器
 * 分析资讯内容的类型、价值和其他特征
 */
export class ContentAnalyzer {
  constructor() {
    this.categoryKeywords = {
      "ai-programming": [
        "coding",
        "programming",
        "developer",
        "IDE",
        "copilot",
        "code generation",
        "github",
        "vscode",
        "cursor",
        "AI assistant",
        "code completion",
        "编程",
        "代码",
        "开发者",
        "代码生成",
        "编程工具",
      ],
      "ai-chips": [
        "chip",
        "GPU",
        "TPU",
        "NPU",
        "processor",
        "semiconductor",
        "silicon",
        "NVIDIA",
        "AMD",
        "Intel",
        "TSMC",
        "fabrication",
        "芯片",
        "处理器",
        "半导体",
        "制程",
        "算力",
      ],
      "quantum-computing": [
        "quantum",
        "qubit",
        "superposition",
        "entanglement",
        "quantum computing",
        "quantum gate",
        "quantum algorithm",
        "coherence",
        "量子",
        "量子比特",
        "量子计算",
        "量子纠缠",
        "量子态",
      ],
      robotics: [
        "robot",
        "robotics",
        "automation",
        "manipulator",
        "autonomous",
        "robotic arm",
        "humanoid",
        "drone",
        "AGV",
        "机器人",
        "自动化",
        "机械臂",
        "无人机",
        "自主导航",
      ],
      "generative-ai": [
        "GPT",
        "LLM",
        "large language model",
        "diffusion",
        "generation",
        "ChatGPT",
        "Claude",
        "Gemini",
        "DALL-E",
        "Midjourney",
        "Stable Diffusion",
        "text generation",
        "image generation",
        "transformer",
        "大模型",
        "生成式",
        "文本生成",
        "图像生成",
        "多模态",
      ],
    };
  }

  /**
   * 分析资讯类型
   * @param {string} content - 资讯内容
   * @param {string} title - 资讯标题（可选）
   * @returns {Object} 类型分析结果
   */
  analyzeCategory(content, title = "") {
    const fullText = (title + " " + content).toLowerCase();
    const scores = {};

    // 计算每个类别的匹配分数
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(keyword.toLowerCase(), "gi");
        const matches = fullText.match(regex);
        if (matches) {
          score += matches.length;
        }
      }
      scores[category] = score;
    }

    // 找出得分最高的类别
    const sortedCategories = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    const topCategory = sortedCategories[0];
    const confidence =
      topCategory[1] > 0
        ? topCategory[1] / (topCategory[1] + sortedCategories[1][1] + 1)
        : 0.2;

    return {
      category: topCategory[0],
      confidence: Math.min(confidence, 1.0),
      scores: scores,
      allCategories: sortedCategories,
    };
  }

  /**
   * 提取关键信息
   * @param {string} content - 资讯内容
   */
  extractKeyInfo(content) {
    const info = {
      hasNumbers: false,
      hasTechnicalTerms: false,
      hasCompanyNames: false,
      hasLinks: false,
      estimatedReadingTime: 0,
    };

    // 检查数字数据
    info.hasNumbers =
      /\d+%|\d+\s*(倍|times|x)|[\d,]+\s*(million|billion|万|亿)/i.test(content);

    // 检查技术术语
    info.hasTechnicalTerms =
      /(algorithm|architecture|model|framework|API|benchmark|performance|技术|算法|架构|模型)/i.test(
        content
      );

    // 检查公司名称
    const companies = [
      "google",
      "microsoft",
      "openai",
      "anthropic",
      "meta",
      "nvidia",
      "amd",
      "intel",
      "apple",
      "amazon",
    ];
    info.hasCompanyNames = companies.some((company) =>
      content.toLowerCase().includes(company)
    );

    // 检查链接
    info.hasLinks = /https?:\/\/[^\s]+/i.test(content);

    // 估算阅读时间（假设中文每分钟300字，英文每分钟200词）
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
    info.estimatedReadingTime = Math.ceil(
      chineseChars / 300 + englishWords / 200
    );

    return info;
  }

  /**
   * 检测重复内容
   * @param {string} content - 新内容
   * @param {Array} existingContent - 已有内容列表
   */
  detectDuplicates(content, existingContent = []) {
    if (existingContent.length === 0) {
      return { isDuplicate: false, similarity: 0, matchedIndex: -1 };
    }

    // 简单的相似度计算（基于单词重叠）
    const newWords = new Set(content.toLowerCase().match(/\w+/g) || []);

    let maxSimilarity = 0;
    let matchedIndex = -1;

    existingContent.forEach((existing, index) => {
      const existingWords = new Set(existing.toLowerCase().match(/\w+/g) || []);
      const intersection = new Set(
        [...newWords].filter((x) => existingWords.has(x))
      );
      const union = new Set([...newWords, ...existingWords]);
      const similarity = intersection.size / union.size;

      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        matchedIndex = index;
      }
    });

    return {
      isDuplicate: maxSimilarity > 0.8,
      similarity: Math.round(maxSimilarity * 100) / 100,
      matchedIndex: maxSimilarity > 0.8 ? matchedIndex : -1,
    };
  }

  /**
   * 提取标签
   * @param {string} content - 资讯内容
   * @param {string} category - 资讯类别
   */
  extractTags(content, category) {
    const tags = [`#${category.replace("-", "")}`];

    // 通用标签
    if (content.includes("突破") || content.includes("breakthrough")) {
      tags.push("#技术突破");
    }
    if (
      content.includes("发布") ||
      content.includes("release") ||
      content.includes("launch")
    ) {
      tags.push("#新产品");
    }
    if (content.includes("开源") || content.includes("open source")) {
      tags.push("#开源");
    }
    if (/\d+%/.test(content)) {
      tags.push("#性能提升");
    }
    if (
      content.includes("融资") ||
      content.includes("funding") ||
      content.includes("investment")
    ) {
      tags.push("#融资");
    }

    return tags;
  }

  /**
   * 生成摘要
   * @param {string} content - 资讯内容
   * @param {number} maxLength - 最大长度
   */
  generateSummary(content, maxLength = 200) {
    // 简单的摘要：取前几句话
    const sentences = content.match(/[^.!?。！？]+[.!?。！？]+/g) || [];
    let summary = "";

    for (const sentence of sentences) {
      if ((summary + sentence).length > maxLength) {
        break;
      }
      summary += sentence;
    }

    if (!summary) {
      summary = content.substring(0, maxLength) + "...";
    }

    return summary.trim();
  }
}

export default ContentAnalyzer;
