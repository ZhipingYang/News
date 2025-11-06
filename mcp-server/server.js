#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { EvaluateContentTool } from "./tools/evaluate-content.js";
import { ProcessNewsTool } from "./tools/process-news.js";

/**
 * MCP Server for AI News Processing
 *
 * 提供两个工具：
 * 1. evaluate_content - 评估资讯内容的可信度和价值
 * 2. process_news - 处理资讯并生成 markdown 文件
 */
class NewsProcessingServer {
  constructor() {
    this.server = new Server(
      {
        name: "news-processing-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // 初始化工具
    this.evaluateContentTool = new EvaluateContentTool();
    this.processNewsTool = new ProcessNewsTool();

    this.setupHandlers();
    this.setupErrorHandling();
  }

  /**
   * 设置请求处理器
   */
  setupHandlers() {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        EvaluateContentTool.getDefinition(),
        ProcessNewsTool.getDefinition(),
      ],
    }));

    // 调用工具
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "evaluate_content":
            return await this.handleEvaluateContent(args);

          case "process_news":
            return await this.handleProcessNews(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * 处理 evaluate_content 工具调用
   */
  async handleEvaluateContent(args) {
    const result = await this.evaluateContentTool.execute(args);

    if (!result.success) {
      return {
        content: [
          {
            type: "text",
            text: `评估失败：${result.error || result.report?.reason}`,
          },
        ],
        isError: true,
      };
    }

    const report = result.report;

    // 格式化输出
    let output = `# 资讯内容评估报告\n\n`;
    output += `## 评估结果\n\n`;
    output += `- **是否生成**：${
      report.shouldGenerate ? "✅ 建议生成" : "❌ 建议跳过"
    }\n`;
    output += `- **可信度评分**：${report.credibilityScore}/1.0 (${report.confidence})\n`;
    output += `- **资讯类别**：${report.category} (置信度：${report.categoryConfidence}%)\n`;
    output += `- **处理建议**：${report.recommendation}\n\n`;

    output += `## 来源验证\n\n`;
    output += `- **是否可信**：${
      report.sourceValidation.isTrusted ? "✅ 是" : "⚠️ 否"
    }\n`;
    output += `- **来源类型**：${report.sourceValidation.sourceType}\n`;
    output += `- **来源评分**：${report.sourceValidation.sourceScore}/1.0\n`;
    output += `- **域名**：${report.sourceValidation.domain || "N/A"}\n`;
    output += `- **说明**：${report.sourceValidation.reason}\n\n`;

    output += `## 内容分析\n\n`;
    output += `- **包含数据**：${
      report.contentAnalysis.hasNumbers ? "✅" : "❌"
    }\n`;
    output += `- **技术细节**：${
      report.contentAnalysis.hasTechnicalTerms ? "✅" : "❌"
    }\n`;
    output += `- **公司名称**：${
      report.contentAnalysis.hasCompanyNames ? "✅" : "❌"
    }\n`;
    output += `- **阅读时间**：约 ${report.contentAnalysis.estimatedReadingTime} 分钟\n\n`;

    output += `## 评分详情\n\n`;
    output += `- **来源可信度**：${report.scoreBreakdown.sourceScore.value}/1.0 (权重${report.scoreBreakdown.sourceScore.weight})\n`;
    output += `- **内容完整性**：${report.scoreBreakdown.completeness.value}/1.0 (权重${report.scoreBreakdown.completeness.weight})\n`;
    output += `  - ${report.scoreBreakdown.completeness.details}\n`;
    output += `- **时效性**：${report.scoreBreakdown.timeliness.value}/1.0 (权重${report.scoreBreakdown.timeliness.weight})\n`;
    output += `  - ${report.scoreBreakdown.timeliness.details}\n`;
    output += `- **内容质量**：${report.scoreBreakdown.quality.value}/1.0 (权重${report.scoreBreakdown.quality.weight})\n`;
    output += `  - ${report.scoreBreakdown.quality.details}\n\n`;

    if (report.warnings.length > 0) {
      output += `## ⚠️ 警告事项\n\n`;
      for (const warning of report.warnings) {
        output += `- ${warning}\n`;
      }
      output += `\n`;
    }

    output += `## 建议标签\n\n`;
    output += report.suggestedTags.join(" ") + "\n\n";

    output += `## 内容摘要\n\n`;
    output += report.summary + "\n";

    return {
      content: [
        {
          type: "text",
          text: output,
        },
      ],
    };
  }

  /**
   * 处理 process_news 工具调用
   */
  async handleProcessNews(args) {
    const result = await this.processNewsTool.execute(args);

    if (!result.success) {
      if (result.skipped) {
        return {
          content: [
            {
              type: "text",
              text: `⏭️ 资讯已跳过\n\n原因：${
                result.reason
              }\n\n评估详情：\n- 可信度评分：${
                result.evaluation.score
              }/1.0\n- 资讯类别：${
                result.evaluation.category
              }\n- 警告：${result.evaluation.warnings.join(
                "；"
              )}\n\n如需强制生成，请设置 forceGenerate: true`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `❌ 处理失败：${result.error}\n\n${result.details || ""}`,
          },
        ],
        isError: true,
      };
    }

    // 成功生成
    let output = `✅ 资讯处理成功！\n\n`;
    output += `## 文件信息\n\n`;
    output += `- **文件路径**：${result.filePath}\n`;
    output += `- **文件状态**：${result.isNewFile ? "新创建" : "已追加"}\n`;
    output += `- **资讯类别**：${result.categoryName} (${result.category})\n\n`;

    output += `## 评估信息\n\n`;
    output += `- **可信度评分**：${result.evaluation.score}/1.0\n`;
    output += `- **置信度**：${result.evaluation.confidence}\n`;
    output += `- **标签**：${result.evaluation.tags.join(" ")}\n\n`;

    if (result.evaluation.warnings.length > 0) {
      output += `## ⚠️ 注意事项\n\n`;
      for (const warning of result.evaluation.warnings) {
        output += `- ${warning}\n`;
      }
      output += `\n`;
    }

    output += `${result.message}\n`;

    return {
      content: [
        {
          type: "text",
          text: output,
        },
      ],
    };
  }

  /**
   * 设置错误处理
   */
  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * 启动服务器
   */
  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("News Processing MCP Server running on stdio");
  }
}

// 启动服务器
const server = new NewsProcessingServer();
server.run().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
