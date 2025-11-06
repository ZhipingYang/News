import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 可信度评分器
 * 综合多个维度计算资讯的可信度分数
 */
export class CredibilityScorer {
  constructor() {
    this.rules = null;
  }

  /**
   * 加载评估规则
   */
  async loadRules() {
    if (this.rules) return this.rules;

    const configPath = path.join(__dirname, "../config/evaluation-rules.json");
    const data = await fs.readFile(configPath, "utf-8");
    this.rules = JSON.parse(data);
    return this.rules;
  }

  /**
   * 评估时效性
   * @param {string} publishDate - 发布日期 (YYYY-MM-DD)
   */
  evaluateTimeliness(publishDate) {
    if (!publishDate) {
      return { score: 0.5, reason: "未提供发布日期" };
    }

    try {
      const pubDate = new Date(publishDate);
      const now = new Date();
      const daysDiff = (now - pubDate) / (1000 * 60 * 60 * 24);

      const maxAgeDays = this.rules.minimum_requirements.max_age_days;

      if (daysDiff < 0) {
        return { score: 0.3, reason: "发布日期在未来，可能有误" };
      } else if (daysDiff <= 1) {
        return { score: 1.0, reason: "24小时内发布" };
      } else if (daysDiff <= 3) {
        return { score: 0.9, reason: "3天内发布" };
      } else if (daysDiff <= maxAgeDays) {
        return { score: 0.7, reason: `${Math.floor(daysDiff)}天内发布` };
      } else {
        return {
          score: 0.4,
          reason: `已发布${Math.floor(daysDiff)}天，超过${maxAgeDays}天期限`,
        };
      }
    } catch (error) {
      return { score: 0.5, reason: "日期格式错误" };
    }
  }

  /**
   * 评估内容完整性
   * @param {string} content - 资讯内容
   */
  evaluateCompleteness(content) {
    if (!content) {
      return { score: 0, reason: "内容为空" };
    }

    const result = {
      score: 0,
      details: [],
      reason: "",
    };

    // 检查长度
    const minLength = this.rules.minimum_requirements.min_length;
    if (content.length < minLength) {
      result.details.push(
        `内容过短（${content.length}字符，要求至少${minLength}字符）`
      );
      result.score += 0.3;
    } else {
      result.score += 1.0;
    }

    // 检查是否包含数据点
    const hasNumbers =
      /\d+%|\d+\s*(倍|times|x)|[\d,]+\s*(million|billion|万|亿)/i.test(content);
    if (hasNumbers) {
      result.score += 1.0;
      result.details.push("包含具体数据");
    } else {
      result.score += 0.5;
      result.details.push("缺少具体数据");
    }

    // 检查是否有技术细节
    const hasTechnicalTerms =
      /(algorithm|architecture|model|framework|API|benchmark|performance|技术|算法|架构|模型)/i.test(
        content
      );
    if (hasTechnicalTerms) {
      result.score += 1.0;
      result.details.push("包含技术细节");
    } else {
      result.score += 0.5;
      result.details.push("技术细节较少");
    }

    // 归一化分数 (0-1)
    result.score = result.score / 3.0;
    result.reason = result.details.join("；");

    return result;
  }

  /**
   * 检测红旗指标（负面因素）
   * @param {string} content - 资讯内容
   */
  detectRedFlags(content) {
    const penalties = [];
    let totalPenalty = 0;

    // 检查过度炒作
    const hypeKeywords = this.rules.red_flags.excessive_hype.keywords;
    let hypeCount = 0;
    for (const keyword of hypeKeywords) {
      const regex = new RegExp(keyword, "gi");
      const matches = content.match(regex);
      if (matches) {
        hypeCount += matches.length;
      }
    }

    if (hypeCount > this.rules.red_flags.excessive_hype.max_count) {
      const penalty = this.rules.red_flags.excessive_hype.penalty;
      penalties.push({ type: "excessive_hype", count: hypeCount, penalty });
      totalPenalty += penalty;
    }

    // 检查点击诱饵
    const clickbaitPatterns = this.rules.red_flags.clickbait_patterns.patterns;
    for (const pattern of clickbaitPatterns) {
      if (content.toLowerCase().includes(pattern.toLowerCase())) {
        const penalty = this.rules.red_flags.clickbait_patterns.penalty;
        penalties.push({ type: "clickbait", pattern, penalty });
        totalPenalty += penalty;
        break; // 只惩罚一次
      }
    }

    return { penalties, totalPenalty };
  }

  /**
   * 评估内容质量
   * @param {string} content - 资讯内容
   */
  evaluateQuality(content) {
    if (!content) {
      return { score: 0, reason: "内容为空" };
    }

    let score = 1.0;
    const details = [];

    // 检测红旗
    const redFlags = this.detectRedFlags(content);
    score -= redFlags.totalPenalty;

    if (redFlags.penalties.length > 0) {
      details.push(`检测到${redFlags.penalties.length}个质量问题`);
      for (const penalty of redFlags.penalties) {
        details.push(`- ${penalty.type}: 扣${penalty.penalty}分`);
      }
    } else {
      details.push("未检测到明显质量问题");
    }

    // 检查逻辑连贯性（简单检查：段落数量和句子完整性）
    const paragraphs = content.split("\n\n").filter((p) => p.trim().length > 0);
    if (paragraphs.length < 2) {
      score -= 0.1;
      details.push("内容结构较简单");
    }

    // 确保分数在 0-1 之间
    score = Math.max(0, Math.min(1, score));

    return {
      score,
      reason: details.join("；"),
      redFlags: redFlags.penalties,
    };
  }

  /**
   * 计算综合可信度分数
   * @param {Object} params - 评估参数
   */
  async calculateScore(params) {
    await this.loadRules();

    const { sourceScore = 0.5, content = "", publishDate = null } = params;

    // 获取权重
    const weights = this.rules.scoring_weights;

    // 计算各维度分数
    const timeliness = this.evaluateTimeliness(publishDate);
    const completeness = this.evaluateCompleteness(content);
    const quality = this.evaluateQuality(content);

    // 计算加权总分
    const finalScore =
      sourceScore * weights.source_credibility +
      completeness.score * weights.content_completeness +
      timeliness.score * weights.timeliness +
      quality.score * weights.content_quality;

    // 确定置信度等级
    let confidence, recommendation;
    const thresholds = this.rules.quality_thresholds;

    if (finalScore >= thresholds.high) {
      confidence = "high";
      recommendation = "generate";
    } else if (finalScore >= thresholds.medium) {
      confidence = "medium";
      recommendation = "generate_with_note";
    } else {
      confidence = "low";
      recommendation = "skip";
    }

    return {
      finalScore: Math.round(finalScore * 100) / 100,
      confidence,
      recommendation,
      breakdown: {
        sourceScore: { value: sourceScore, weight: weights.source_credibility },
        completeness: {
          value: completeness.score,
          weight: weights.content_completeness,
          details: completeness.reason,
        },
        timeliness: {
          value: timeliness.score,
          weight: weights.timeliness,
          details: timeliness.reason,
        },
        quality: {
          value: quality.score,
          weight: weights.content_quality,
          details: quality.reason,
          redFlags: quality.redFlags,
        },
      },
    };
  }
}

export default CredibilityScorer;
