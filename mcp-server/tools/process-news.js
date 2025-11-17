import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { EvaluateContentTool } from "./evaluate-content.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 处理资讯内容，生成 markdown 文件
 * MCP 工具：process_news
 */
export class ProcessNewsTool {
  constructor() {
    this.evaluator = new EvaluateContentTool();
    this.baseDir = path.join(__dirname, "../..");

    this.categoryFileMap = {
      "ai-programming": "ai-programming.md",
      "ai-products": "ai-products.md",
      "tech-general": "tech-general.md",
    };

    this.categoryNameMap = {
      "ai-programming": "AI编程",
      "ai-products": "AI产品",
      "tech-general": "科技综合",
    };
  }

  /**
   * 获取工具定义
   */
  static getDefinition() {
    return {
      name: "process_news",
      description:
        "处理资讯内容：评估质量、分析类型、生成markdown文件。自动创建日期文件夹，使用定制模板生成内容，追加到对应的资讯类型文件中。",
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
            description:
              "发布日期，格式：YYYY-MM-DD。如果不提供，将使用今天的日期",
          },
          title: {
            type: "string",
            description: "资讯标题",
          },
          forceGenerate: {
            type: "boolean",
            description: "强制生成，即使评估分数较低（默认：false）",
          },
        },
        required: ["content", "source"],
      },
    };
  }

  /**
   * 获取今天的日期（YYYY-MM-DD格式）
   */
  getTodayDate() {
    const now = new Date();
    return now.toISOString().split("T")[0];
  }

  /**
   * 根据类型生成 markdown 内容
   */
  generateMarkdown(params) {
    const { title, content, source, publishDate, category, evaluation } =
      params;
    const categoryName = this.categoryNameMap[category] || category;

    // 生成星级评分
    const stars = "⭐".repeat(Math.round(evaluation.credibilityScore * 5));

    // 基本模板（所有类型通用的部分）
    let markdown = `
# 🔥 ${title || "资讯标题"}

**发布日期：** ${publishDate}  
**来源：** [${source}](${source})  
**分类：** ${categoryName}  
**可信度评分：** ${stars} (${evaluation.credibilityScore}/1.0)

---

${content}

---

**标签：** ${evaluation.suggestedTags.join(" ")}

**评估说明：**
- 来源类型：${evaluation.sourceValidation.sourceType}
- 来源评分：${evaluation.sourceValidation.sourceScore}/1.0
- 内容评分：${evaluation.scoreBreakdown.completeness.value}/1.0
- 时效性评分：${evaluation.scoreBreakdown.timeliness.value}/1.0

`;

    if (evaluation.warnings.length > 0) {
      markdown += `\n**注意事项：**\n`;
      for (const warning of evaluation.warnings) {
        markdown += `- ⚠️ ${warning}\n`;
      }
    }

    markdown += `\n---\n\n`;

    return markdown;
  }

  /**
   * 确保日期文件夹存在
   */
  async ensureDateFolder(date) {
    const folderPath = path.join(this.baseDir, "news_markdown", date);
    try {
      await fs.access(folderPath);
    } catch {
      await fs.mkdir(folderPath, { recursive: true });
    }
    return folderPath;
  }

  /**
   * 追加内容到文件
   */
  async appendToFile(filePath, content) {
    try {
      // 检查文件是否存在
      await fs.access(filePath);
      // 文件存在，追加内容
      await fs.appendFile(filePath, content, "utf-8");
      return { isNew: false };
    } catch {
      // 文件不存在，创建并写入
      const header = `# ${path.basename(filePath, ".md")} 资讯汇总\n\n`;
      await fs.writeFile(filePath, header + content, "utf-8");
      return { isNew: true };
    }
  }

  /**
   * 执行资讯处理
   */
  async execute(params) {
    const {
      content,
      source,
      publishDate = this.getTodayDate(),
      title = "未命名资讯",
      forceGenerate = false,
    } = params;

    try {
      // 1. 评估内容
      const evaluationResult = await this.evaluator.execute({
        content,
        source,
        publishDate,
        title,
      });

      if (!evaluationResult.success) {
        return {
          success: false,
          error: "内容评估失败",
          details: evaluationResult.error,
        };
      }

      const evaluation = evaluationResult.report;

      // 2. 检查是否应该生成
      if (!evaluation.shouldGenerate && !forceGenerate) {
        return {
          success: false,
          skipped: true,
          reason: evaluation.reason,
          evaluation: {
            score: evaluation.credibilityScore,
            category: evaluation.category,
            warnings: evaluation.warnings,
          },
        };
      }

      // 3. 确定类别和文件
      const category = evaluation.category;
      const filename = this.categoryFileMap[category];

      if (!filename) {
        return {
          success: false,
          error: `未知的资讯类别：${category}`,
        };
      }

      // 4. 创建日期文件夹
      const dateFolder = await this.ensureDateFolder(publishDate);

      // 5. 生成 markdown 内容
      const markdown = this.generateMarkdown({
        title,
        content,
        source,
        publishDate,
        category,
        evaluation,
      });

      // 6. 追加到文件
      const filePath = path.join(dateFolder, filename);
      const { isNew } = await this.appendToFile(filePath, markdown);

      // 7. 返回结果
      return {
        success: true,
        generated: true,
        filePath,
        isNewFile: isNew,
        category,
        categoryName: this.categoryNameMap[category],
        evaluation: {
          score: evaluation.credibilityScore,
          confidence: evaluation.confidence,
          warnings: evaluation.warnings,
          tags: evaluation.suggestedTags,
        },
        message: `资讯已成功${isNew ? "创建" : "追加"}到 ${path.relative(
          this.baseDir,
          filePath
        )}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack,
      };
    }
  }
}

export default ProcessNewsTool;
