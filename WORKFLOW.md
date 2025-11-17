# AI Agent 自动化工作流

> **AI Agent专用工作流** - 让Cursor AI自动完成所有工作

---

## 🎯 工作流概览

**一个工作流，完全自动化**：

🤖 **AI Agent自动化** - Cursor AI自动执行所有步骤，包括：
- 程序化数据处理（RSS抓取、去重、评估）
- AI智能处理（补充搜索、内容评估、深度分析）
- 自动生成和发布（网站生成、GitHub推送）

---

## 🤖 AI Agent 完全自动化工作流

### 快速开始

在Cursor Chat中输入：

```
@AI-AGENT-WORKFLOW.md 请执行今日AI资讯自动化工作流
```

**就这么简单！** AI Agent会自动完成所有工作。

### 工作流执行步骤

AI Agent会自动执行：

#### 阶段一：程序化自动处理

1. **📡 抓取RSS资讯** - 从25个精品源获取最新资讯
2. **🔍 处理和过滤** - 去重、可信度评估、更新历史
3. **🧠 智能补充分析** - 检测资讯不足，生成补充建议
4. **🌟 高影响力扩展** - 识别重要资讯，生成扩展建议
5. **🌐 生成静态网站** - 将Markdown转换为HTML
6. **🚀 推送到GitHub** - 自动提交并发布

#### 阶段二：AI自动处理（如有建议）

7. **🔍 自动搜索** - 对每个搜索查询执行@web_search
8. **📊 自动评估** - 使用evaluate_content评估内容质量
9. **✍️ 自动生成** - 生成1500-2000字深度分析
10. **💾 自动保存** - 使用process_news保存到对应类目
11. **🔄 重新发布** - 重新生成网站并推送

### 特点

- 🎯 **完全自动化** - AI Agent自动处理所有步骤，无需人工确认
- 🧠 **智能判断** - 自动检测是否需要补充或扩展
- 📊 **质量保证** - 只保留可信度≥0.85的高质量资讯
- ⚡ **高效执行** - 10-15分钟完成整个工作流
- 🔄 **自动重试** - 失败时自动跳过，继续处理下一个

---

## 🛠️ 技术细节

### 程序化脚本（调试用）

如果需要单独运行程序化部分：

```bash
npm run auto
```

脚本会自动执行7个步骤，并在结束时提示AI Agent需要处理的建议文件。

### 工作流各步骤说明

#### Step 1: 抓取RSS资讯

```bash
cd mcp-server
node tools/fetch-rss.js all
```

**输出**: `data/rss-fetch-YYYY-MM-DD.json`

---

#### Step 2: 处理与过滤

```bash
node tools/process-rss-data.js data/rss-fetch-YYYY-MM-DD.json
```

**输出**: `data/processed-rss-YYYY-MM-DD.json`

**自动完成**：
1. 清理7天前的旧数据
2. 去重检查（相似度≥80%视为重复）
3. 可信度评分（只保留≥0.8的资讯）
4. **更新去重历史** ✅ 重要！记录本次资讯，防止明天重复
5. 内容分析和分类

**注意**: 此步骤使用RSS的description（100-200字）进行评估，主要用于初筛。

---

#### Step 3: 智能补充分析（自动执行）

```bash
node tools/intelligent-supplement.js data/processed-rss-YYYY-MM-DD.json
```

**输出**: `data/supplement-suggestions-YYYY-MM-DD.json`

**自动判断条件**：
- 某个类目资讯 < 3条
- 某个类目平均质量分数 < 0.75

**如果需要补充**：
1. 工具会生成5个搜索查询并保存到建议文件
2. 在Cursor Chat中使用web_search执行这些查询
3. 使用MCP工具将搜索结果添加到资讯列表

**注意**: 全自动化脚本会自动执行此步骤并提示你是否需要手动补充。

---

#### Step 4: 高影响力资讯扩展（自动执行）

```bash
node tools/expand-important-news.js data/processed-rss-YYYY-MM-DD.json
```

**输出**: `data/expansion-suggestions-YYYY-MM-DD.json`

**自动判断条件**：
- 类目资讯 < 5条
- 存在影响力分数 ≥ 50的重要资讯

**如果需要扩展**：
1. 工具识别高影响力资讯（包含"发布"、"突破"、知名公司等关键词）
2. 生成5个深度搜索查询（背景、技术细节、市场反应、专家评论）
3. 在Cursor Chat中使用web_search收集更多信息
4. AI进行1500-2000字深度扩展分析

**注意**: 全自动化脚本会自动执行此步骤并提示你是否需要手动扩展。

---

#### Step 5: AI深度分析

使用Cursor Chat或其他AI工具：

```
@AI-ANALYSIS-GUIDE.md @data/processed-rss-YYYY-MM-DD.json

请对今天的资讯进行深度分析，生成1500-2000字的专业分析。
按类目分别生成markdown文件到 news_markdown/YYYY-MM-DD/ 目录。
```

**AI自动完成**：
- 为每条资讯生成深度分析
- 自动分类到对应的md文件
- 创建日期文件夹

#### Step 6: 生成静态网站

```bash
cd ..
npm run build
```

**输出**: 静态网站文件到 `docs/` 目录

---

#### Step 7: 推送发布

```bash
./scripts/auto-push.sh
```

**自动完成**：
- Git提交（自动生成commit message）
- 推送到GitHub（优先使用GitHub CLI）
- 触发GitHub Pages部署

---

## 📊 数据流图

```
┌─────────────┐
│ RSS Sources │ (25个精品RSS源)
└──────┬──────┘
       │ Step 1: fetch-rss.js
       ↓
┌─────────────────────┐
│ rss-fetch-YYYY.json │ ← 原始RSS数据（未过滤）
└──────┬──────────────┘
       │ Step 2: process-rss-data.js
       │ ├─ cleanupOldData() - 清理7天前数据
       │ ├─ deduplicateBatch() - 去重（相似度≥80%）
       │ ├─ evaluator.execute() - 评估（基于description）
       │ └─ addToHistory() - 更新去重历史 ✅
       ↓
┌────────────────────────┐
│ processed-rss-YYYY.json│ ← 高质量资讯（已去重+评分≥0.8）
└──────┬─────────────────┘
       │
       ├─→ Step 3: intelligent-supplement.js (自动)
       │   └─→ supplement-suggestions-YYYY.json
       │       └─→ 检测资讯不足，生成补充建议
       │
       ├─→ Step 4: expand-important-news.js (自动)
       │   └─→ expansion-suggestions-YYYY.json
       │       └─→ 识别高影响力资讯，生成扩展查询
       │
       ↓
   Step 5: AI深度分析 (可选)
   (Cursor Chat + web_search + 补充/扩展建议)
       ↓
┌─────────────────────────┐
│ news_markdown/YYYY-MM-DD/*.md│ ← 最终资讯（1500-2000字深度分析）
└────────────┬────────────┘
         │ Step 6: generator.js
         ↓
┌────────────────┐
│  docs/*.html   │ ← 静态网站（GitHub Pages）
└────────┬───────┘
         │ Step 7: auto-push.sh
         ↓
┌────────────────┐
│ GitHub Pages   │ ← 在线发布
└────────────────┘
```

**副作用文件**：
- `data/deduplication.json` - 去重历史数据库（自动更新）
- `data/supplement-suggestions-*.json` - 补充建议（如果执行）
- `data/expansion-suggestions-*.json` - 扩展建议（如果执行）

---

## 📊 核心类目说明

项目支持3个核心类目：

| 类目ID | 中文名称 | 文件名 | RSS源数量 |
|--------|---------|--------|----------|
| `ai-programming` | AI编程 | ai-programming.md | 10个 |
| `ai-products` | AI产品 | ai-products.md | 9个 |
| `tech-general` | 科技综合 | tech-general.md | 6个 |

---

## 🔑 质量标准

### 可信度评分（0-1.0）

- **≥0.85** - 高质量，建议生成
- **0.70-0.84** - 中等质量，可生成但需标注
- **<0.70** - 低质量，建议跳过

### 评分维度

1. **来源可信度** (40%) - 基于RSS源配置的credibility
2. **内容完整性** (25%) - 是否包含数据、技术细节
3. **时效性** (20%) - 发布时间是否在7天内
4. **内容质量** (15%) - 是否包含专业术语、公司名称

---

## 🧠 智能功能

### 智能补充

**触发条件**：
- 资讯数量 < 3条
- 平均质量分数 < 0.75

**AI Agent自动操作**：
- 生成5个搜索查询
- 执行web_search
- 评估内容质量
- 生成深度分析
- 保存到对应类目

### 高影响力扩展

**触发条件**：
- 类目资讯 < 5条
- 存在影响力分数 ≥ 50的资讯

**AI Agent自动操作**：
- 识别高影响力资讯
- 生成5个深度搜索查询
- 综合搜索结果
- 生成2000字扩展分析

---

## 📁 文件组织

```
News/
├── news_markdown/           # Markdown 资讯源文件目录
│   └── YYYY-MM-DD/         # 日期文件夹
│       ├── ai-programming.md    # AI编程资讯
│       ├── ai-products.md       # AI产品资讯
│       └── tech-general.md      # 科技综合资讯
│
├── mcp-server/              # 后端工具
│   ├── tools/               # CLI工具
│   │   ├── fetch-rss.js     # RSS抓取
│   │   ├── process-rss-data.js  # 数据处理
│   │   └── ...
│   └── data/                # 数据文件
│       ├── rss-fetch-YYYY-MM-DD.json      # RSS原始数据
│       └── processed-rss-YYYY-MM-DD.json  # 处理后数据
│
├── docs/                    # 生成的网站（GitHub Pages）
│   ├── index.html
│   ├── YYYY-MM-DD.html
│   └── news/YYYY-MM-DD/
│
└── archive_docs/            # 历史文档归档
```

---

## ⚡ 快速命令参考

### 🤖 AI Agent自动化（推荐）

在Cursor Chat中：

```
@AI-AGENT-WORKFLOW.md 请执行今日AI资讯自动化工作流
```

### 🛠️ 程序化脚本（调试用）

```bash
# 运行程序化部分
npm run auto

# 测试RSS源
cd mcp-server && node tools/test-rss-sources.js

# 本地预览网站
npm run serve

# 查看去重统计
cd mcp-server
node -e "import('./utils/deduplicator.js').then(m => m.getStats().then(console.log))"
```

---

## 🆘 故障排查

### 问题1: RSS抓取失败

```bash
# 测试RSS源可用性
cd mcp-server
node tools/test-rss-sources.js
```

### 问题2: 类目识别错误

检查资讯内容是否包含明确的技术关键词，或手动指定类目。

### 问题3: MCP工具无响应

确认MCP服务器已启动：

```bash
cd mcp-server
npm start
```

---

## 📚 相关文档

- [AI Agent工作流](./AI-AGENT-WORKFLOW.md) - AI Agent完整执行指南⭐
- [AI分析指南](./AI-ANALYSIS-GUIDE.md) - 深度分析方法论（1500-2000字）
- [工具文档](./mcp-server/TOOLS.md) - MCP工具详细说明
- [RSS源配置](./mcp-server/config/rss-sources.json) - 25个精品RSS源
- [自动推送脚本](./scripts/auto-push.sh) - GitHub部署说明

---

**最后更新**: 2025-11-12  
**工作流版本**: 3.0 (AI Agent自动化版本)

