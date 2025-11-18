# 更新日志

## [4.0.0] - 2025-11-18

### 🎉 重大变更 - 简化版

完全重构工作流，简化项目结构，使用 AI WebSearch 替代 RSS 抓取。

### ✨ 新增功能

- **WebSearch 收集**: 使用 AI WebSearch 收集资讯，更灵活、更全面
- **智能筛选**: 自动评估影响力分数 (技术35% + 商业35% + 产品20% + 来源10%)
- **结构化大纲**: 自动生成完整的分析框架和数据收集清单
- **简化工具**: 只保留3个核心工具 (collect、filter、outline)

### 🗑️ 移除功能

- 移除 RSS 抓取和处理功能
- 移除去重机制 (依赖AI判断)
- 移除内容压缩工具
- 移除 MCP 服务器和相关工具
- 移除自动 push 到 GitHub 功能
- 移除智能补充和扩展机制

### 📝 文档更新

- 重写 README.md 为项目介绍
- 创建 AI-DAILY-WORKFLOW.md 作为 AI Agent 工作流指南
- 更新 .cursorrules 指向新的工作流文档
- 保留 AI-ANALYSIS-GUIDE.md (深度分析规范)

### 📂 目录结构变化

```
删除:
- mcp-server/server.js (MCP 服务器)
- mcp-server/tools/fetch-rss.js
- mcp-server/tools/process-rss-data.js
- mcp-server/tools/intelligent-supplement.js
- mcp-server/tools/expand-important-news.js
- mcp-server/tools/evaluate-content.js
- mcp-server/tools/process-news.js
- mcp-server/utils/* (所有工具类)
- mcp-server/config/* (所有配置)
- scripts/auto-workflow.sh
- scripts/auto-push.sh
- cursor-guidelines.md
- AI-AGENT-WORKFLOW.md (旧版)
- WORKFLOW.md
- TOOLS.md

新增:
- AI-DAILY-WORKFLOW.md (新工作流指南)
- mcp-server/tools/collect-news.js
- mcp-server/tools/filter-news.js
- mcp-server/tools/generate-outline.js
- mcp-server/README.md

保留:
- AI-ANALYSIS-GUIDE.md (深度分析规范)
- static-site/* (网站生成器)
- news_markdown/* (资讯源文件)
- docs/* (生成的网站)
```

### 🔧 工作流变化

**之前 (v3.0)**:
```
RSS 抓取 → 去重 → 评估 → 补充 → 扩展 → 深度分析 → 生成网站 → 自动push
```

**现在 (v4.0)**:
```
WebSearch 收集 → 筛选 → 生成大纲 → 深度分析 → 生成网站 → 手动发布
```

### 💡 设计理念

- **质量优于数量**: 每类只保留 1-3 篇最重要的资讯
- **深度优于广度**: 专注于 2000-3000 字的深度分析
- **简单优于复杂**: 移除不必要的自动化，保持工作流清晰
- **灵活优于固定**: WebSearch 可以覆盖任意来源

### 🎯 核心优势

1. **更简单**: 只有3个工具，工作流清晰明了
2. **更灵活**: 不依赖固定的 RSS 源
3. **更智能**: AI 评估影响力和可信度
4. **更可控**: 手动发布，避免意外

---

## [3.0.0] - 2025-11-12

### AI Agent 自动化版本

- 🤖 AI Agent 完全自动化工作流
- 🧠 智能补充和扩展机制
- ✅ 双重去重检测
- ✅ 25个精品RSS源

---

## [2.0.0] - 2025-11-10

### 初始版本

- 📡 RSS 资讯抓取
- 📊 去重和可信度评估
- 📝 AI 深度分析
- 🌐 静态网站生成

---

**版本说明**:
- v4.0: 简化版 (WebSearch Only)
- v3.0: AI Agent 自动化版本
- v2.0: RSS 自动化版本

