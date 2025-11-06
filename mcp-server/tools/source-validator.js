import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 来源验证工具
 * 验证资讯来源的可信度
 */
export class SourceValidator {
  constructor() {
    this.sources = null;
  }

  /**
   * 加载可信来源配置
   */
  async loadSources() {
    if (this.sources) return this.sources;

    const configPath = path.join(__dirname, "../config/sources.json");
    const data = await fs.readFile(configPath, "utf-8");
    this.sources = JSON.parse(data);
    return this.sources;
  }

  /**
   * 从URL提取域名
   */
  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, "");
    } catch (error) {
      return null;
    }
  }

  /**
   * 验证来源
   * @param {string} source - 来源URL或名称
   * @returns {Object} 验证结果
   */
  async validate(source) {
    await this.loadSources();

    const result = {
      isTrusted: false,
      sourceType: "unknown",
      sourceScore: 0.5, // 默认分数
      domain: null,
      confidence: "low",
    };

    if (!source) {
      return { ...result, reason: "未提供来源信息" };
    }

    // 提取域名
    const domain = this.extractDomain(source);
    if (domain) {
      result.domain = domain;

      // 检查可信域名
      if (this.sources.trusted_domains[domain]) {
        const domainInfo = this.sources.trusted_domains[domain];
        result.isTrusted = true;
        result.sourceType = domainInfo.category;
        result.sourceScore = domainInfo.score;
        result.confidence = domainInfo.score >= 0.9 ? "high" : "medium";
        result.reason = `可信来源：${domainInfo.description}`;
        return result;
      }

      // 检查域名模式
      for (const [patternName, patternInfo] of Object.entries(
        this.sources.source_patterns
      )) {
        const regex = new RegExp(patternInfo.pattern, "i");
        if (regex.test(domain)) {
          result.isTrusted = true;
          result.sourceType = patternInfo.category;
          result.sourceScore = patternInfo.score;
          result.confidence = "medium";
          result.reason = `匹配模式：${patternName}`;
          return result;
        }
      }
    }

    // 检查关键词提升
    let scoreBoost = 0;
    for (const [keywordType, keywordInfo] of Object.entries(
      this.sources.trusted_keywords
    )) {
      for (const keyword of keywordInfo.keywords) {
        if (source.toLowerCase().includes(keyword.toLowerCase())) {
          scoreBoost = Math.max(scoreBoost, keywordInfo.score_boost);
        }
      }
    }

    if (scoreBoost > 0) {
      result.sourceScore = Math.min(result.sourceScore + scoreBoost, 1.0);
      result.confidence = result.sourceScore >= 0.7 ? "medium" : "low";
      result.reason = `包含可信关键词，提升分数 ${scoreBoost}`;
    } else {
      result.reason = "未知来源，使用默认分数";
    }

    return result;
  }

  /**
   * 批量验证来源
   */
  async validateBatch(sources) {
    const results = [];
    for (const source of sources) {
      results.push(await this.validate(source));
    }
    return results;
  }
}

export default SourceValidator;
