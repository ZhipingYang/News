# AI 资讯每日工作流 (简化版)

> **AI Agent 每日执行指南** - 使用 WebSearch 收集和深度分析 AI 资讯

---

## 🎯 工作流概述

每天使用 AI WebSearch 收集三个方向的最新资讯,筛选重要内容并生成深度分析。

**三大核心类目**:
- 🔧 **AI编程** (ai-programming) - AI辅助编程工具、代码生成、开发实践
- 🚀 **AI产品** (ai-products) - 新产品发布、商业模式、市场策略
- 📡 **科技综合** (tech-general) - 科技资讯、行业动态、技术趋势

---

## 📋 完整执行步骤

### 第一步: 收集资讯 (使用 WebSearch)

**目标**: 每个类别收集 10 条新闻 (最近 7 天内)

**筛选维度**:
- 技术突破性 (技术创新、性能提升、架构改进)
- 商业影响力 (市场价值、用户规模、收入模式)
- 产品颠覆性 (用户体验、行业格局、竞争优势)

**搜索查询示例**:

```
AI编程类:
- "AI coding assistant 2025 breakthrough"
- "GitHub Copilot new features last week"
- "AI code generation tools November 2025"
- "programming AI tools technical innovation"

AI产品类:
- "AI product launch November 2025"
- "OpenAI Claude Anthropic new release"
- "AI application commercial success"
- "generative AI product market"

科技综合类:
- "AI technology breakthrough this week"
- "artificial intelligence research paper"
- "tech industry AI trend November 2025"
- "machine learning advancement"
```

**执行命令**:

```bash
npm run collect
# 或
node mcp-server/tools/collect-news.js
```

这个工具会创建一个模板文件，引导 AI 使用 WebSearch 填充资讯内容。
结果保存到: `mcp-server/data/collected-news-YYYY-MM-DD.json`

---

### 第二步: 筛选重要资讯

**目标**: 每个类别选择 1-3 篇最重要的资讯 (可以是 0 篇)

**筛选标准**:
- ⭐ 可信度 ≥ 0.85 (官方发布、权威媒体)
- 🎯 影响力分数 ≥ 50 (技术突破、商业重大、产品创新)
- 📊 内容完整 (有数据、细节、案例)
- 🕐 时效性好 (7天内)

**影响力评分维度**:

| 维度 | 权重 | 评分标准 |
|------|------|---------|
| 技术创新 | 35% | 是否有技术突破、新架构、性能提升 |
| 商业价值 | 35% | 市场规模、用户量、收入潜力 |
| 产品颠覆 | 20% | 用户体验改进、行业格局变化 |
| 来源可信 | 10% | 官方发布、权威媒体、行业专家 |

**执行命令**:

```bash
npm run filter
# 或
node mcp-server/tools/filter-news.js data/collected-news-YYYY-MM-DD.json
```

这个工具会:
1. 自动评估每条新闻的影响力分数 (技术创新+商业价值+产品颠覆+来源可信)
2. 计算可信度评分
3. 推荐需要深度分析的资讯 (影响力≥50, 可信度≥0.85)
4. 保存筛选结果到: `mcp-server/data/filtered-news-YYYY-MM-DD.json`

---

### 第三步: 生成资讯大纲

**目标**: 为每篇筛选出的资讯生成结构化大纲

**大纲结构**:

```markdown
## [Emoji] [标题]：[副标题]

**基础信息**
- 发布日期: YYYY-MM-DD
- 来源: [名称](URL)
- 分类: AI编程/AI产品/科技综合
- 可信度: ⭐⭐⭐⭐⭐
- 影响力分数: XX/100

**大纲框架**

### 1. 执行摘要 (200-300字)
- 核心论点是什么?
- 战略问题是什么?
- 关键数据有哪些?

### 2. 技术解析 (400-500字)
- 采用什么技术?
- 为什么这个路线?
- 如何实现的?
- 攻克了什么难点?

### 3. 商业逻辑 (600-800字)
- 收入模式是什么?
- 成本结构如何?
- 竞争壁垒在哪?
- 市场机会多大?

### 4. 战略意义 (400-450字)
- 在行业中的位置?
- 未来演进路径?
- 乐观/基准/悲观情景?

### 5. 行动建议 (200-250字)
- 企业应该怎么做?
- 投资者应该关注什么?
- 技术人员应该学什么?

**需要补充的数据**:
- [ ] 性能数据 (提升百分比、具体数字)
- [ ] 市场数据 (规模、增长率、份额)
- [ ] 财务数据 (收入、成本、ROI)
- [ ] 竞品对比 (功能、价格、用户量)
```

**执行命令**:

```bash
npm run outline
# 或
node mcp-server/tools/generate-outline.js data/filtered-news-YYYY-MM-DD.json
```

自动为每篇推荐的资讯生成结构化大纲，包含：
- 分析框架 (技术、商业、战略、建议)
- 数据收集清单
- 质量检查清单

保存到: `mcp-server/data/outlines-YYYY-MM-DD.json`

---

### 第四步: 深度分析和数据收集

**目标**: 根据大纲,收集补充数据,生成完整深度分析

**参考**: `@AI-ANALYSIS-GUIDE.md` - 严格遵守格式和质量要求

**关键要求**:
- ✅ 总字数: 2000-3000 字
- ✅ 至少 3 个数据表格
- ✅ 至少 1 个代码/架构图
- ✅ 商业模式深度分析 (收入+成本+ROI)
- ✅ 针对不同人群的行动建议 (时间+金额+收益)
- ✅ 案例 + 具体数字佐证

**数据收集策略**:

对于每篇资讯,执行 5-8 个补充搜索:
1. "[产品名] technical details architecture"
2. "[产品名] pricing cost business model"
3. "[产品名] market size revenue"
4. "[产品名] vs competitors comparison"
5. "[产品名] user feedback reviews"
6. "[产品名] expert analysis opinion"
7. "[公司名] financial report earnings"
8. "[技术名] performance benchmarks"

**执行**: 在 Cursor Chat 中:

```
@AI-ANALYSIS-GUIDE.md @data/outlines-YYYY-MM-DD.json

请根据大纲,为每篇资讯:
1. 执行补充搜索查询,收集数据
2. 生成 2000-3000 字深度分析
3. 确保符合格式规范和质量标准
4. 保存到 news_markdown/YYYY-MM-DD/ 对应类别的 md 文件
```

AI 会自动:
- 读取大纲文件
- 执行 web_search 补充数据
- 生成符合规范的深度分析
- 保存到对应文件:
  - `news_markdown/YYYY-MM-DD/ai-programming.md`
  - `news_markdown/YYYY-MM-DD/ai-products.md`
  - `news_markdown/YYYY-MM-DD/tech-general.md`

---

### 第五步: 生成静态网站

**目标**: 将 Markdown 转换为 HTML 静态网站

```bash
npm run build
```

这个命令会:
1. 读取 `news_markdown/` 中的所有 Markdown 文件
2. 生成每日汇总页面 (`docs/YYYY-MM-DD.html`)
3. 生成资讯详情页面 (`docs/news/YYYY-MM-DD/*.html`)
4. 更新首页 (`docs/index.html`)

**输出**: `docs/` 目录下的所有 HTML 文件

---

### 第六步: 本地预览 (可选)

```bash
npm run serve
```

在浏览器中打开 `http://localhost:8080` 预览生成的网站。

---

### 第七步: 手动发布 (可选)

```bash
# 提交更改
git add .
git commit -m "docs: update news YYYY-MM-DD"

# 推送到 GitHub
git push origin main
```

GitHub Pages 会在 2-3 分钟内自动部署更新。

---

## 🎯 一键执行 (推荐)

在 Cursor Chat 中输入:

```
@AI-DAILY-WORKFLOW.md 请执行今日资讯收集和分析
```

AI Agent 会自动:
1. ✅ 执行 WebSearch 收集资讯 (每类10条)
2. ✅ 评估和筛选重要资讯 (每类1-3篇)
3. ✅ 生成资讯大纲
4. ✅ 收集补充数据
5. ✅ 生成深度分析 (2000-3000字)
6. ✅ 保存到对应 Markdown 文件
7. ✅ 生成静态网站
8. ✅ 提示手动发布 (如需要)

**执行时间**: 15-25 分钟

---

## 📊 质量检查清单

**格式检查** (发布前必做):
- [ ] 包含"发布日期" (格式: **发布日期:** YYYY-MM-DD)
- [ ] 包含"来源" (格式: [名称](URL))
- [ ] 包含"分类" (三选一)
- [ ] 包含"可信度评分" (1-5星)
- [ ] 包含"执行摘要" (战略问题+表格+判断)
- [ ] 使用 `---` 分隔符
- [ ] 格式一致性

**内容检查**:
- [ ] 至少 3 个数据表格
- [ ] 至少 1 个代码/架构图
- [ ] 商业模式分析 (收入+成本+ROI)
- [ ] 行动建议 (时间+金额+收益)
- [ ] 案例 + 数字佐证
- [ ] 总字数 2000-3000 字

**深度检查**:
- [ ] 每个论断有数据支撑
- [ ] 分析了"为什么"
- [ ] 深入商业逻辑
- [ ] 多种情景分析
- [ ] 可操作的建议

---

## 🔧 工具说明

### collect-news.js
收集资讯的交互式工具，创建模板文件并引导 AI 使用 WebSearch 填充内容。

**使用**: `npm run collect`

### filter-news.js
筛选资讯工具，自动评估影响力分数和可信度，推荐需要深度分析的资讯。

**评估维度**:
- 技术创新 (35%): 突破、创新、架构、性能
- 商业价值 (35%): 市场、收入、用户、商业
- 产品颠覆 (20%): 发布、革命、改变
- 来源可信 (10%): 官方、权威机构

**使用**: `npm run filter`

### generate-outline.js
生成大纲工具，为每篇推荐的资讯创建结构化分析框架。

**输出内容**:
- 完整的分析大纲 (技术、商业、战略、建议)
- 数据收集查询列表
- 质量检查清单

**使用**: `npm run outline`

---

## 📁 文件组织

```
News/
├── AI-DAILY-WORKFLOW.md      # 本文件 - 每日工作流指南
├── AI-ANALYSIS-GUIDE.md      # 深度分析写作指南
├── README.md                 # 项目介绍
│
├── mcp-server/
│   ├── tools/
│   │   ├── collect-news.js   # 收集资讯
│   │   ├── filter-news.js    # 筛选资讯
│   │   └── generate-outline.js  # 生成大纲
│   └── data/
│       ├── collected-news-YYYY-MM-DD.json   # 收集的资讯
│       ├── filtered-news-YYYY-MM-DD.json    # 筛选后的资讯
│       └── outlines-YYYY-MM-DD.json         # 资讯大纲
│
├── news_markdown/
│   └── YYYY-MM-DD/
│       ├── ai-programming.md   # AI编程资讯
│       ├── ai-products.md      # AI产品资讯
│       └── tech-general.md     # 科技综合资讯
│
├── docs/                      # 生成的静态网站
│   ├── index.html
│   ├── YYYY-MM-DD.html
│   └── news/YYYY-MM-DD/
│
└── static-site/
    ├── generator.js          # 网站生成器
    └── templates/            # HTML 模板
```

---

## 💡 最佳实践

### 搜索查询优化
- 使用英文关键词 (信息质量更高)
- 包含时间范围 (this week, November 2025)
- 包含具体产品名/公司名
- 组合技术词和商业词

### 筛选标准把握
- 宁缺毋滥,质量优先
- 关注技术突破和商业重大事件
- 避免纯新闻报道,选择有深度的分析
- 优先选择官方发布和权威解读

### 深度分析技巧
- 先搜集数据,再开始写作
- 多角度搜索 (技术+商业+市场+竞品)
- 关注具体数字和案例
- 分析"为什么"而非"是什么"
- 提供可操作的建议

---

## 📚 相关文档

- [AI 深度分析指南](./AI-ANALYSIS-GUIDE.md) - 写作规范和质量标准
- [项目介绍](./README.md) - 项目概述和快速开始

---

**最后更新**: 2025-11-18  
**工作流版本**: 4.0 (简化版 - WebSearch Only)  
**维护者**: ZhipingYang

---

**核心理念**: 质量优于数量,深度优于广度,洞察优于信息。

