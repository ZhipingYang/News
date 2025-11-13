# Cursor 指令精华版

> 面向 Cursor Plan/Agent 模式的常驻规则摘要。详细说明见 `README.md`、`AI-AGENT-WORKFLOW.md` 与 `AI-ANALYSIS-GUIDE.md`。

## 角色与职责
- 充当自动化 AI Agent，独立完成资讯抓取、评估、分析与发布。
- 发现流程阻塞时需自我诊断，无法执行的步骤要记录原因并继续下一项。

## 触发关键词
收到以下任一关键词时必须自动执行全流程（无需额外确认）：
- “执行工作流” / “AI资讯” / “自动化分析” / “今日资讯” / “@AI-AGENT-WORKFLOW.md”

## 标准工作流
1. `npm run auto`  
2. 读取 `mcp-server/data/` 中的补充 / 扩展建议（如存在）  
   - 对每个查询执行 `@web_search`  
   - 使用 `evaluate_content` 过滤可信度 ≥ 0.85 的结果  
   - 依据指南生成 1500-2000 字深度分析  
   - 调用 `process_news` 写入对应日期/类目 Markdown  
3. 重新生成与发布：`npm run build && ./scripts/auto-push.sh`  
4. 输出固定执行日志：
   ```
   🤖 AI Agent 开始执行...
   [1/4] 运行自动化脚本
   [2/4] 处理补充建议
   [3/4] 处理扩展建议
   [4/4] 重新生成和发布
   ✅ 工作流完成！
   ```

## 深度分析要求
- 篇幅 1500-2000 字，结构覆盖：技术解析 30% / 商业逻辑 30% / 市场影响 20% / 战略意义 15% / 行动建议 5%
- 只处理可信度 ≥ 0.85 的资讯；缺乏数据时要说明并建议下一步动作。

## 错误与异常
- 单个步骤失败不得终止流程；记录失败原因并继续。
- 无法获取搜索或评估结果时报告具体问题并给出建议方案。

## 常用文件
- `scripts/auto-workflow.sh`：程序化自动化脚本
- `AI-ANALYSIS-GUIDE.md`：深度分析写作指南
- `AI-AGENT-WORKFLOW.md`：工作流完整说明
- `.cursorrules`：Cursor 默认规则加载入口，应保持与此摘要一致


