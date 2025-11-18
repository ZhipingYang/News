# AI 资讯深度分析项目

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue)](https://zhipingyang.github.io/News/)

> **使用 AI WebSearch 收集和深度分析 AI 领域最新资讯**

本项目专注于 AI 领域的高质量资讯收集和专业级深度分析(2000-3000字)，自动生成静态网站发布。

**核心理念**: 质量优于数量，深度优于广度，洞察优于信息。

---

## 🎯 项目特点

- 🔍 **智能收集**: 使用 AI WebSearch 收集最新资讯 (最近7天)
- 📊 **严格筛选**: 按影响力和可信度筛选，只保留高质量内容
- 📝 **深度分析**: 2000-3000字专业分析，包含数据、案例、洞察
- 🎨 **精美展示**: 自动生成静态网站，响应式设计
- ⚡ **高效流程**: 完整工作流 15-25 分钟完成

---

## 📂 关注类目

本项目覆盖三大核心类目:

| 类目 | 说明 | 关注重点 |
|------|------|----------|
| 🔧 **AI编程** | AI辅助编程工具和技术 | 代码生成、开发工具、编程实践、效率提升 |
| 🚀 **AI产品** | AI产品和商业应用 | 新品发布、商业模式、市场策略、行业应用 |
| 📡 **科技综合** | 通用科技和技术趋势 | 技术突破、行业动态、学术研究、政策法规 |

**收集标准**: 每个类别每日收集 10 条资讯，筛选 1-3 篇最重要的进行深度分析。

**筛选维度**:
- ⚡ 技术突破性 (创新、性能、架构)
- 💰 商业影响力 (市场、收入、用户)
- 🎯 产品颠覆性 (体验、格局、竞争)
- ⭐ 来源可信度 (官方、权威、专家)

---

## 🚀 快速开始

### 前置要求

- Node.js 16+ 
- Git
- Cursor AI (推荐用于执行工作流)

### 安装

```bash
# 克隆仓库
git clone https://github.com/ZhipingYang/News.git
cd News

# 安装依赖
npm install
cd mcp-server && npm install && cd ..
```

### 一键执行 (推荐)

在 Cursor Chat 中输入:

```
@AI-DAILY-WORKFLOW.md 请执行今日资讯收集和分析
```

AI Agent 会自动完成:
1. ✅ 收集资讯 (每类10条，使用 WebSearch)
2. ✅ 评估和筛选 (影响力+可信度)
3. ✅ 生成资讯大纲
4. ✅ 收集补充数据
5. ✅ 生成深度分析 (2000-3000字)
6. ✅ 保存到 Markdown 文件
7. ✅ 生成静态网站

**执行时间**: 15-25 分钟

---

## 📋 手动执行流程

如果需要分步骤执行:

### 1. 收集资讯

```bash
node mcp-server/tools/collect-news.js
```

这会创建一个模板文件，然后在 Cursor Chat 中使用 WebSearch 填充资讯内容。

### 2. 筛选资讯

```bash
node mcp-server/tools/filter-news.js data/collected-news-YYYY-MM-DD.json
```

自动评估影响力分数和可信度，推荐需要深度分析的资讯。

### 3. 生成大纲

```bash
node mcp-server/tools/generate-outline.js data/filtered-news-YYYY-MM-DD.json
```

为筛选出的资讯生成结构化大纲，包含分析框架和数据收集清单。

### 4. 深度分析

在 Cursor Chat 中:

```
@AI-ANALYSIS-GUIDE.md @data/outlines-YYYY-MM-DD.json

请根据大纲生成深度分析，保存到对应类别的 markdown 文件。
```

AI 会自动执行 WebSearch 收集补充数据，生成符合规范的深度分析。

### 5. 生成网站

```bash
npm run build
```

将 Markdown 文件转换为 HTML 静态网站。

### 6. 本地预览

```bash
npm run serve
```

在浏览器打开 `http://localhost:8080` 查看效果。

### 7. 发布到 GitHub

```bash
git add .
git commit -m "docs: update news YYYY-MM-DD"
git push origin main
```

GitHub Pages 会在 2-3 分钟内自动部署更新。

---

## 📁 项目结构

```
News/
├── README.md                 # 项目介绍 (本文件)
├── AI-DAILY-WORKFLOW.md      # 每日工作流指南 (AI Agent 必读)
├── AI-ANALYSIS-GUIDE.md      # 深度分析写作指南
│
├── mcp-server/               # 工具和数据 (已重命名为 tools 目录)
│   ├── tools/
│   │   ├── collect-news.js   # 收集资讯工具
│   │   ├── filter-news.js    # 筛选资讯工具
│   │   └── generate-outline.js  # 生成大纲工具
│   └── data/                 # 数据文件目录
│       ├── collected-news-YYYY-MM-DD.json   # 收集的资讯
│       ├── filtered-news-YYYY-MM-DD.json    # 筛选后资讯
│       └── outlines-YYYY-MM-DD.json         # 资讯大纲
│
├── news_markdown/            # Markdown 资讯源文件
│   └── YYYY-MM-DD/
│       ├── ai-programming.md   # AI编程资讯
│       ├── ai-products.md      # AI产品资讯
│       └── tech-general.md     # 科技综合资讯
│
├── docs/                     # 生成的静态网站 (GitHub Pages)
│   ├── index.html            # 首页
│   ├── YYYY-MM-DD.html       # 每日汇总页
│   └── news/YYYY-MM-DD/      # 资讯详情页
│
└── static-site/              # 网站生成器
    ├── generator.js          # 生成器主程序
    ├── templates/            # HTML 模板
    └── styles/               # CSS 样式
```

---

## 🎯 质量标准

### 资讯筛选标准

- ⭐ **可信度 ≥ 0.85**: 官方发布、权威媒体、学术机构
- 🎯 **影响力 ≥ 50**: 技术创新35% + 商业价值35% + 产品颠覆20% + 来源可信10%
- 📊 **内容完整**: 包含技术细节、数据、案例
- 🕐 **时效性好**: 最近 7 天内

### 深度分析标准

参考 [AI-ANALYSIS-GUIDE.md](./AI-ANALYSIS-GUIDE.md)，严格遵守:

**格式要求**:
- 标准开头 (发布日期、来源、分类、可信度评分)
- 执行摘要 (战略问题、关键数据、战略判断)
- 使用 `---` 分隔符

**内容要求**:
- 总字数: 2000-3000 字
- 至少 3 个数据表格
- 至少 1 个代码/架构图
- 商业模式深度分析 (收入+成本+ROI)
- 针对不同人群的行动建议 (时间+金额+收益)
- 案例 + 具体数字佐证

**分析深度**:
- 技术解析 (30%): What, Why, How, So What
- 商业逻辑 (30%): 收入、成本、竞争、市场
- 市场影响 (20%): 目标市场、机会、威胁
- 战略意义 (15%): 行业地位、演进路径、情景推演
- 行动建议 (5%): 企业、投资者、技术人员

---

## 🛠️ 核心工具说明

### collect-news.js
收集资讯的交互式工具，引导 AI 使用 WebSearch 收集资讯。

**输出**: `data/collected-news-YYYY-MM-DD.json`

### filter-news.js
筛选资讯工具，自动评估影响力分数和可信度。

**输入**: `data/collected-news-YYYY-MM-DD.json`  
**输出**: `data/filtered-news-YYYY-MM-DD.json`

### generate-outline.js
生成资讯大纲，提供结构化分析框架和数据收集清单。

**输入**: `data/filtered-news-YYYY-MM-DD.json`  
**输出**: `data/outlines-YYYY-MM-DD.json`


---

## 💡 最佳实践

### 搜索查询优化
- ✅ 使用英文关键词 (信息质量更高)
- ✅ 包含时间范围 (this week, last 7 days)
- ✅ 包含具体产品名/公司名
- ✅ 组合技术词和商业词

### 筛选标准把握
- ✅ 宁缺毋滥，质量优先
- ✅ 关注技术突破和商业重大事件
- ✅ 避免纯新闻报道，选择有深度的内容
- ✅ 优先选择官方发布和权威解读

### 深度分析技巧
- ✅ 先搜集数据，再开始写作
- ✅ 多角度搜索 (技术+商业+市场+竞品)
- ✅ 关注具体数字和案例
- ✅ 分析"为什么"而非"是什么"
- ✅ 提供可操作的建议

---

## 📚 相关文档

- [每日工作流指南](./AI-DAILY-WORKFLOW.md) - AI Agent 执行指南 ⭐
- [深度分析指南](./AI-ANALYSIS-GUIDE.md) - 写作规范和质量标准
- [在线网站](https://zhipingyang.github.io/News/) - 查看已发布的资讯

---

## 🔧 开发和调试

### 本地开发

```bash
# 安装依赖
npm install

# 生成网站
npm run build

# 本地预览
npm run serve
```

### 测试工具

```bash
# 测试收集工具
node mcp-server/tools/collect-news.js

# 测试筛选工具
node mcp-server/tools/filter-news.js data/collected-news-YYYY-MM-DD.json

# 测试大纲生成
node mcp-server/tools/generate-outline.js data/filtered-news-YYYY-MM-DD.json
```

---

## ❓ 常见问题

**Q1: 如何调整收集的资讯数量？**

修改 `mcp-server/tools/collect-news.js` 中的 `targetPerCategory` 参数。

**Q2: 如何调整筛选标准？**

修改 `mcp-server/tools/filter-news.js` 中的:
- `IMPACT_DIMENSIONS`: 影响力评分维度和权重
- `metadata.minImpactScore`: 最低影响力分数 (默认50)
- `metadata.minCredibility`: 最低可信度 (默认0.85)

**Q3: 如何添加新的类目？**

1. 在 `collect-news.js` 中添加类目配置
2. 在 `filter-news.js` 中更新类目处理逻辑
3. 更新网站生成器模板

**Q4: 网站多久更新一次？**

推送到 GitHub 后，GitHub Pages 在 2-3 分钟内自动更新。

**Q5: 如何自定义网站样式？**

编辑 `static-site/styles/main.css` 和 `static-site/templates/` 中的模板文件。

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request!

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

---

## 📞 联系方式

- **作者**: ZhipingYang
- **GitHub**: [@ZhipingYang](https://github.com/ZhipingYang)
- **网站**: [https://zhipingyang.github.io/News/](https://zhipingyang.github.io/News/)

---

## 🌟 致谢

感谢所有为开源社区做出贡献的开发者和组织。

---

**最后更新**: 2025-11-18  
**项目版本**: 4.0 (简化版 - WebSearch Only)

---

## 📈 更新日志

### v4.0 (2025-11-18) - 简化版

- ✨ 使用 AI WebSearch 替代 RSS 抓取
- ✨ 简化工作流，只保留核心功能
- ✨ 创建新的工作流文档 (AI-DAILY-WORKFLOW.md)
- 🗑️ 移除 RSS 相关工具和配置
- 🗑️ 移除自动 push 功能
- 🗑️ 清理无关文件和脚本
- 📝 重构 README 为项目介绍

### v3.0 (2025-11-12) - AI Agent 自动化

- 🤖 AI Agent 完全自动化工作流
- 🧠 智能补充和扩展机制
- ✅ 双重去重检测
- ✅ 25个精品RSS源

### v2.0 (2025-11-10) - 初始版本

- 📡 RSS 资讯抓取
- 📊 去重和可信度评估
- 📝 AI 深度分析
- 🌐 静态网站生成

---

**让 AI 帮你发现最有价值的资讯洞察！** 🚀
