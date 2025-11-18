# 更新日志

## [4.1.0] - 2025-11-18

### 🎯 质量控制与国际视角增强

本次更新重点提升资讯质量标准，加强国际视角，并引入去重机制。

### ✨ 新增功能

- **去重检查工具**: 新增 `deduplicate-news.js` 工具和历史资讯数据库
  - 自动检测与历史资讯的相似度（标题关键词匹配）
  - 相似度 ≥ 80% 自动过滤重复资讯
  - 维护历史资讯数据库 `news-history.json`
  - 新增 npm 命令: `npm run dedupe`

- **数据丰富度评分**: 在筛选工具中新增数据丰富度评估
  - 数字和数据点 (40分): 融资金额、性能指标、市场规模
  - 具体实体名称 (30分): 公司名、产品名
  - 技术细节关键词 (30分): 架构、算法、模型等
  - 最低阈值: 30分（低于此分数的资讯不予收录）

- **国际视角要求**: 工作流文档新增国际视角指南
  - 70%国际 + 30%国内的搜索比例
  - 优先使用英文关键词搜索
  - 强调国际对比和全球竞争格局分析

### 🔧 改进

- **筛选标准升级**: 三重标准筛选
  - 影响力分数 ≥ 50
  - 可信度 ≥ 0.85
  - 数据丰富度 ≥ 30 ⭐ 新增
  
- **工作流文档更新**: `AI-DAILY-WORKFLOW.md`
  - 新增"第一步半：去重检查"步骤
  - 更新搜索查询示例（国际视角优先）
  - 新增数据丰富度评分标准说明
  - 新增"国际视角优先原则"章节

- **路径处理修复**: 修复所有工具的路径处理逻辑
  - 正确处理从项目根目录调用的相对路径
  - 统一输出路径处理逻辑

### 📝 质量标准

- **宁缺毋滥**: 不满足标准的资讯不予收录
- **数据支撑**: 必须包含具体数字、案例、技术细节
- **国际视野**: 优先关注国际AI巨头动态
- **深度分析**: 避免表层报道，强调洞察和对比

### 📦 文件变更

- 新增: `mcp-server/data/news-history.json`
- 新增: `mcp-server/tools/deduplicate-news.js`
- 修改: `mcp-server/tools/filter-news.js` (新增数据丰富度评分)
- 修改: `AI-DAILY-WORKFLOW.md` (多处更新)
- 修改: `package.json` (新增 dedupe 命令)

---

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

