# AI资讯深度分析工作流

> **统一工作流文档** - 整合自动化和手动流程

---

## 🎯 工作流概览

本项目支持两种工作模式：

1. **自动化模式**（推荐）- 使用CLI工具批量处理RSS源
2. **手动模式** - 使用MCP工具处理单条资讯

---

## 🚀 模式一：自动化批量处理（推荐）

### 适用场景
- 每日定时收集和处理大量RSS资讯
- 批量处理多个类目的资讯
- 自动化部署和发布

### 工作流步骤（5步）

#### Step 1: 抓取RSS资讯

```bash
cd mcp-server
node tools/fetch-rss.js all
```

**输出**: `data/rss-fetch-YYYY-MM-DD.json`

#### Step 2: 处理与过滤

```bash
# 运行处理脚本（包含去重、评分）
node tools/process-rss-data.js data/rss-fetch-YYYY-MM-DD.json
```

**输出**: `data/processed-rss-YYYY-MM-DD.json`

**自动完成**：
- 去重检查（相似度≥80%视为重复）
- 可信度评分（只保留≥0.85的资讯）
- 内容分析和分类

#### Step 3: AI深度分析

使用Cursor Chat或其他AI工具：

```
@AI-ANALYSIS-GUIDE.md @data/processed-rss-YYYY-MM-DD.json

请对今天的资讯进行深度分析，生成1500-2000字的专业分析。
按类目分别生成markdown文件到 YYYY-MM-DD/ 目录。
```

**AI自动完成**：
- 为每条资讯生成深度分析
- 自动分类到对应的md文件
- 创建日期文件夹

#### Step 4: 生成静态网站

```bash
cd ..
npm run build
```

**输出**: 静态网站文件到 `docs/` 目录

#### Step 5: 推送发布

```bash
./scripts/auto-push.sh
```

**自动完成**：
- Git提交（自动生成commit message）
- 推送到GitHub（优先使用GitHub CLI）
- 触发GitHub Pages部署

---

## 🔧 模式二：手动单条处理

### 适用场景
- 处理高质量的个别资讯
- 对特定资讯进行深度定制分析
- 测试和验证流程

### 使用MCP工具

#### 工具1: evaluate_content

评估资讯质量和可信度：

```javascript
// 在支持MCP的AI工具中调用
{
  "tool": "evaluate_content",
  "params": {
    "content": "资讯的完整内容",
    "source": "https://example.com/article",
    "publishDate": "2025-11-12",
    "title": "资讯标题"
  }
}
```

**返回**：
- 可信度评分
- 资讯类别
- 是否建议生成
- 警告信息

#### 工具2: process_news

处理资讯并生成markdown文件：

```javascript
{
  "tool": "process_news",
  "params": {
    "content": "AI生成的1500-2000字深度分析",
    "source": "https://example.com/article",
    "publishDate": "2025-11-12",
    "title": "资讯标题",
    "forceGenerate": false
  }
}
```

**自动完成**：
- 评估内容质量
- 确定资讯类别
- 创建日期文件夹
- 生成/追加到md文件

### 手动流程（5步）

1. **收集资讯** - 从可靠来源复制资讯内容
2. **评估质量** - 使用 `evaluate_content` MCP工具
3. **AI分析** - 参考 `AI-ANALYSIS-GUIDE.md` 生成深度分析
4. **保存文件** - 使用 `process_news` MCP工具
5. **生成网站** - 运行 `npm run build`

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

## 🛠️ 高级功能

### 智能补充

当某个类目资讯不足时，AI可以使用web_search补充：

```bash
node tools/intelligent-supplement.js data/rss-fetch-YYYY-MM-DD.json
```

**触发条件**：
- 资讯数量 < 3条
- 平均质量分数 < 0.75

### 重要资讯扩展

对高影响力资讯进行深度扩展：

```bash
node tools/expand-important-news.js data/processed-rss-YYYY-MM-DD.json
```

**触发条件**：
- 类目资讯 < 5条
- 存在影响力分数 ≥ 50的资讯

---

## 📁 文件组织

```
News/
├── YYYY-MM-DD/              # 日期文件夹
│   ├── ai-programming.md    # AI编程资讯
│   ├── ai-products.md       # AI产品资讯
│   └── tech-general.md      # 科技综合资讯
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
└── docs/                    # 生成的网站
    ├── index.html
    ├── YYYY-MM-DD.html
    └── news/YYYY-MM-DD/
```

---

## ⚡ 快速命令参考

```bash
# 完整自动化流程（5步）
cd mcp-server && node tools/fetch-rss.js all
node tools/process-rss-data.js data/rss-fetch-$(date +%Y-%m-%d).json
# [AI分析步骤需要手动在Cursor中执行]
cd .. && npm run build
./scripts/auto-push.sh

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

- [AI分析指南](./AI-ANALYSIS-GUIDE.md) - 深度分析方法论（1500-2000字）
- [RSS源配置](./mcp-server/config/rss-sources.json) - 25个精品RSS源
- [自动推送脚本](./scripts/auto-push.sh) - GitHub部署说明

---

**最后更新**: 2025-11-12  
**工作流版本**: 2.0 (统一版本)

