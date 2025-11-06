import { SourceValidator } from "./source-validator.js";
import { CredibilityScorer } from "../utils/credibility-scorer.js";
import { ContentAnalyzer } from "../utils/content-analyzer.js";

/**
 * 评估资讯内容的可信度和价值
 * MCP 工具：evaluate_content
 */
export class EvaluateContentTool {
  constructor() {
    this.sourceValidator = new SourceValidator();
    this.credibilityScorer = new CredibilityScorer();
    this.contentAnalyzer = new ContentAnalyzer();
  }

  /**
   * 获取工具定义
   */
  static getDefinition() {
    return {
      name: "evaluate_content",
      description:
        "评估资讯内容的可信度和价值，决定是否应该生成资讯文件。返回详细的评估报告，包括可信度评分、质量分析和处理建议。",
      inputSchema: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description: "资讯的完整内容",
          },
          source: {
            type: "string",
            description: "资讯来源URL或名称",
          },
          publishDate: {
            type: "string",
            description: "发布日期，格式：YYYY-MM-DD",
          },
          title: {
            type: "string",
            description: "资讯标题（可选）",
          },
        },
        required: ["content", "source"],
      },
    };
  }

  /**
   * 执行评估
   */
  async execute(params) {
    const { content, source, publishDate, title = "" } = params;

    try {
      // 1. 验证来源
      const sourceValidation = await this.sourceValidator.validate(source);

      // 2. 分析内容类型
      const categoryAnalysis = this.contentAnalyzer.analyzeCategory(
        content,
        title
      );

      // 3. 提取关键信息
      const keyInfo = this.contentAnalyzer.extractKeyInfo(content);

      // 4. 计算可信度分数
      const credibilityResult = await this.credibilityScorer.calculateScore({
        sourceScore: sourceValidation.sourceScore,
        content,
        publishDate,
      });

      // 5. 生成建议
      const warnings = [];
      let shouldGenerate = true;
      let reason = "";

      if (credibilityResult.recommendation === "skip") {
        shouldGenerate = false;
        reason = `可信度评分过低（${credibilityResult.finalScore}/1.0），建议跳过`;
        warnings.push("内容质量或来源可信度不足");
      } else if (credibilityResult.recommendation === "generate_with_note") {
        reason = `可信度评分中等（${credibilityResult.finalScore}/1.0），可以生成但需标注来源`;
        warnings.push("建议标注来源并验证关键信息");
      } else {
        reason = `可信度评分高（${credibilityResult.finalScore}/1.0），建议生成`;
      }

      // 检查内容完整性
      if (!keyInfo.hasTechnicalTerms) {
        warnings.push("内容缺少技术细节");
      }
      if (!keyInfo.hasNumbers) {
        warnings.push("内容缺少具体数据");
      }

      // 6. 生成评估报告
      const report = {
        shouldGenerate,
        credibilityScore: credibilityResult.finalScore,
        confidence: credibilityResult.confidence,
        category: categoryAnalysis.category,
        categoryConfidence: Math.round(categoryAnalysis.confidence * 100),

        sourceValidation: {
          isTrusted: sourceValidation.isTrusted,
          sourceType: sourceValidation.sourceType,
          sourceScore: sourceValidation.sourceScore,
          domain: sourceValidation.domain,
          reason: sourceValidation.reason,
        },

        contentAnalysis: {
          hasNumbers: keyInfo.hasNumbers,
          hasTechnicalTerms: keyInfo.hasTechnicalTerms,
          hasCompanyNames: keyInfo.hasCompanyNames,
          estimatedReadingTime: keyInfo.estimatedReadingTime,
        },

        scoreBreakdown: credibilityResult.breakdown,

        recommendation: credibilityResult.recommendation,
        reason,
        warnings,

        suggestedTags: this.contentAnalyzer.extractTags(
          content,
          categoryAnalysis.category
        ),
        summary: this.contentAnalyzer.generateSummary(content, 150),
      };

      return {
        success: true,
        report,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        report: {
          shouldGenerate: false,
          reason: `评估过程出错：${error.message}`,
        },
      };
    }
  }
}

export default EvaluateContentTool;
