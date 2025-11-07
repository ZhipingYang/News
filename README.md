# AI 资讯深度分析仓库

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue)](https://zhipingyang.github.io/News/)

本仓库收集和深度分析AI相关领域的最新资讯，使用AI进行专业级深度分析（1500-2000字），自动生成静态网站发布。

**质量原则：** 宁缺毋滥，只保留高质量、无重复的资讯（可信度≥0.85）

---

## 🚀 完全自动化工作流（一键执行）

### 🤖 AI全自动执行（推荐）

在Cursor Chat中输入：

```
@README.md 请执行今日AI资讯自动化分析工作流
```

**AI会自动完成以下步骤：**

1. **RSS源抓取** - 从47个高质量RSS源抓取最新资讯（7天内）
2. **去重检查** - 移除所有重复内容（相似度≥80%，检查最近7天）
3. **可信度评估** - 只接受可信度≥0.85的高质量资讯
4. **深度分析生成** - 生成1500-2000字专业分析（遵循分析框架）
5. **网站构建** - 自动生成静态网站
6. **Git提交推送** - 使用GitHub CLI或Token自动推送
7. **GitHub Pages更新** - 网站在2-3分钟后自动更新

**执行时间：** 25-35分钟（全程自动，无需人工干预）

---

## 📊 关注领域

- **AI 编程** - AI辅助编程工具、代码生成技术、编程范式创新（重点关注）
- **生成式AI** - 大模型发展、应用创新、技术突破
- **AI 芯片** - 芯片设计、性能突破、新产品发布
- **量子计算** - 量子计算技术进展、应用场景、硬件创新
- **机器人** - 机器人技术、应用案例、产业发展

---

## 🔐 首次配置（仅需一次）

### 方式1：GitHub CLI（推荐）

```bash
# 安装GitHub CLI
brew install gh

# 登录GitHub
gh auth login

# 验证
gh auth status
```

### 方式2：Personal Access Token（备选）

<details>
<summary>点击展开Token配置方法</summary>

1. **生成Token：**
   - 访问：https://github.com/settings/tokens
   - 点击"Generate new token (classic)"
   - 名称：`News Auto Push`
   - 勾选权限：`repo`（完整仓库访问）
   - 生成并复制token

2. **配置到本地：**
   ```bash
   cd /Users/xcodeyang/RC_Work/News
   echo "GITHUB_TOKEN=your_token_here" > .env
   chmod 600 .env
   ```

3. **验证：**
   ```bash
   ./scripts/auto-push.sh
   ```

</details>

**详细配置指南：** [docs/SETUP.md](./docs/SETUP.md)

---

## 📚 详细文档

| 文档 | 说明 |
|------|------|
| [WORKFLOW.md](./docs/WORKFLOW.md) | 自动化工作流详细说明，包含6个阶段的完整流程 |
| [RSS-SOURCES.md](./docs/RSS-SOURCES.md) | RSS源配置与管理，包含47个高质量RSS源列表 |
| [DEDUPLICATION.md](./docs/DEDUPLICATION.md) | 去重机制说明，双重检测确保移除所有重复内容 |
| [TOOLS.md](./docs/TOOLS.md) | 工具使用指南，包含所有工具的使用方法和示例 |
| [SETUP.md](./docs/SETUP.md) | 首次配置指南，包含环境配置和故障排查 |
| [FAQ.md](./docs/FAQ.md) | 常见问题解答，涵盖28个常见问题 |
| [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) | 故障排查指南，分类问题诊断和解决 |
| [AI-ANALYSIS-GUIDE.md](./AI-ANALYSIS-GUIDE.md) | AI分析框架，1500-2000字深度分析标准 |
| [templates.md](./templates.md) | 资讯类型模板，5大主题的定制化模板 |

---

## 🎯 质量保证标准

### 资讯来源

- **主要来源（80%）**：47个高质量RSS源
  - 官方博客：OpenAI, Anthropic, Google AI, NVIDIA等
  - 技术媒体：GitHub Blog, AnandTech, IEEE Spectrum等
  - 学术期刊：ArXiv, Nature, MIT News等
- **补充来源（20%）**：web_search搜索

### 可信度评估

**只接受可信度≥0.85的资讯，评估维度：**
- 来源可信度（40%）：官方0.95，技术媒体0.85-0.9，学术0.95
- 内容完整性（25%）：必须包含技术细节、数据支撑、引用来源
- 时效性（15%）：7天内的资讯
- 内容质量（20%）：逻辑清晰、无夸大宣传

### 去重机制

**双重检测确保无重复：**
- 标题相似度检测：Levenshtein距离≥80%
- 关键词重叠检测：重叠度≥70% + 标题相似度≥60%
- 历史对比范围：最近7天

### 分析深度

**1500-2000字专业分析，包含：**
- 📰 新闻背景（150字）
- ⚙️ 技术深度解析（400-500字）
- 🏭 行业应用与生态影响（350-400字）
- 💹 市场格局与商业逻辑（400-450字）
- 🌐 战略意义与未来推演（400-450字）
- ✅ 核心洞察与行动建议（200-250字）

---

## 🔧 手动执行工作流（备选）

如需手动控制，可分步执行：

```bash
# 1. 抓取RSS源
cd mcp-server
node tools/fetch-rss.js all

# 2. 去重和评估（可选，使用自动化工具）
node tools/process-rss-data.js data/rss-fetch-YYYY-MM-DD.json 0.85

# 3. 在Cursor Chat中请求分析
@WORKFLOW.md 请根据RSS抓取结果生成今日分析

# 4. 生成网站
npm run build

# 5. 推送（自动选择GitHub CLI或Token）
./scripts/auto-push.sh
```

**详细步骤：** [docs/WORKFLOW.md](./docs/WORKFLOW.md)

---

## 📁 目录结构

```
News/
├── README.md                    # 项目说明（本文档）
├── docs/                        # 详细文档目录
│   ├── WORKFLOW.md             # 工作流详解
│   ├── RSS-SOURCES.md          # RSS源管理
│   ├── DEDUPLICATION.md        # 去重机制
│   ├── SETUP.md                # 配置指南
│   ├── FAQ.md                  # 常见问题
│   └── TROUBLESHOOTING.md      # 故障排查
│
├── YYYY-MM-DD/                 # 按日期组织的资讯
│   ├── ai-programming.md       # AI编程资讯
│   ├── generative-ai.md        # 生成式AI资讯
│   ├── ai-chips.md             # AI芯片资讯
│   ├── quantum-computing.md    # 量子计算资讯
│   └── robotics.md             # 机器人资讯
│
├── mcp-server/                 # MCP服务器
│   ├── config/
│   │   ├── rss-sources.json    # RSS源配置（47个源）
│   │   └── evaluation-rules.json # 评估规则（可信度≥0.85）
│   ├── tools/
│   │   ├── fetch-rss.js        # RSS抓取工具
│   │   └── process-rss-data.js # RSS数据处理工具（去重+评估）
│   ├── utils/
│   │   └── deduplicator.js     # 去重工具
│   └── data/
│       ├── rss-fetch-*.json    # RSS抓取结果
│       ├── processed-rss-*.json # 处理结果（去重+评估）
│       └── deduplication.json  # 去重数据库
│
├── static-site/                # 静态网站生成器
│   ├── generator.js            # 生成器主程序
│   └── templates/              # HTML模板
│
├── docs/                       # 生成的静态网站（GitHub Pages）
│   ├── index.html              # 网站首页
│   ├── YYYY-MM-DD.html         # 每日汇总
│   └── news/YYYY-MM-DD/        # 资讯详情页
│
└── scripts/
    └── auto-push.sh            # 自动推送脚本（GitHub CLI优先）
```

---

## ❓ 常见问题 FAQ

<details>
<summary><strong>Q1：如何处理低质量或重复资讯？</strong></summary>

AI会自动过滤可信度<0.85的资讯，并移除所有重复内容（相似度≥80%）。所有过滤和去重记录都会保存在日志中。

</details>

<details>
<summary><strong>Q2：如何调整RSS源或质量标准？</strong></summary>

- **添加RSS源**：编辑 `mcp-server/config/rss-sources.json`
- **调整质量标准**：编辑 `mcp-server/config/evaluation-rules.json`
- **调整去重阈值**：编辑 `mcp-server/data/deduplication.json`

详见：[RSS-SOURCES.md](./docs/RSS-SOURCES.md)、[DEDUPLICATION.md](./docs/DEDUPLICATION.md)

</details>

<details>
<summary><strong>Q3：自动化失败怎么办？</strong></summary>

查看错误信息，常见原因和解决方法：
- **RSS抓取失败** → 检查网络，查看 [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md#rss抓取问题)
- **Git推送失败** → 检查GitHub CLI或Token，查看 [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md#git推送问题)
- **其他问题** → 查看 [FAQ.md](./docs/FAQ.md) 或提交Issue

</details>

<details>
<summary><strong>Q4：可以只执行部分流程吗？</strong></summary>

可以。手动执行步骤：
```bash
# 仅抓取RSS
node mcp-server/tools/fetch-rss.js all

# 仅生成网站
npm run build

# 仅推送
./scripts/auto-push.sh
```

或在Cursor Chat中指定具体步骤。

</details>

**更多问题：** [docs/FAQ.md](./docs/FAQ.md)

---

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/ZhipingYang/News.git
cd News
```

### 2. 安装依赖

```bash
npm install
cd mcp-server && npm install && cd ..
```

### 3. 配置GitHub认证

**使用GitHub CLI（推荐）：**
```bash
brew install gh
gh auth login
```

**或使用Token：**
```bash
echo "GITHUB_TOKEN=your_token" > .env
```

### 4. 执行自动化工作流

在Cursor Chat中输入：
```
@README.md 请执行今日AI资讯自动化分析工作流
```

---

## 📈 RSS源统计

- **总数**：47个高质量RSS源
- **AI编程**：8个源（可信度≥0.85）
- **生成式AI**：10个源（可信度≥0.85）
- **AI芯片**：10个源（可信度≥0.85）
- **量子计算**：9个源（可信度≥0.85）
- **机器人**：10个源（可信度≥0.85）

**详细列表：** [docs/RSS-SOURCES.md](./docs/RSS-SOURCES.md)

---

## 🔗 相关链接

- [在线网站](https://zhipingyang.github.io/News/)
- [GitHub仓库](https://github.com/ZhipingYang/News)
- [RSS订阅配置](./mcp-server/config/rss-sources.json)
- [质量标准配置](./mcp-server/config/evaluation-rules.json)

---

## 📄 许可证

MIT License

---

**最后更新：** 2025-11-07  
**维护者：** ZhipingYang

**改进亮点：**
- ✅ 47个高质量RSS源（主要来源）
- ✅ 双重去重检测（移除所有重复）
- ✅ 严格质量过滤（可信度≥0.85）
- ✅ GitHub CLI优先推送（更安全可靠）
- ✅ 模块化文档结构（便于AI按需阅读）
