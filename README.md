# AI 资讯深度分析仓库

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue)](https://your-username.github.io/News/)

本仓库收集和深度分析 AI 相关领域的最新资讯，使用 AI 进行专业级深度分析（1500-2000字），自动生成静态网站发布。

## 🚀 完全自动化工作流（一键执行）

### 🤖 AI 全自动执行（推荐）

只需在 Cursor Chat 中输入：

```
@README.md 请执行今日AI资讯自动化分析工作流
```

**AI 会自动完成：**
1. ✅ 搜集五大主题的最新资讯（AI编程、生成式AI、AI芯片、量子计算、机器人）
2. ✅ 评估内容可信度（使用 sources.json 标准）
3. ✅ 生成 1500-2000 字深度分析（遵循 AI-ANALYSIS-GUIDE.md）
4. ✅ 保存到对应的 markdown 文件
5. ✅ 构建静态网站
6. ✅ Git 提交并推送

**执行时间：** 35-50 分钟（全程自动，无需人工干预）

---

### 📋 AI 自动化执行详细步骤

#### 第一阶段：资讯搜集
- 使用 `web_search` 工具自动搜索五大主题的最新资讯
- 搜索关键词：
  - **AI编程**：AI programming tools, GitHub Copilot, code generation
  - **生成式AI**：GPT model, LLM breakthrough, OpenAI Anthropic
  - **AI芯片**：AI chip, NVIDIA GPU, TPU hardware
  - **量子计算**：quantum computing breakthrough, qubit
  - **机器人**：robotics AI, humanoid robot, automation
- 结合 `mcp-server/config/sources.json` 中的可信来源

#### 第二阶段：内容评估
使用可信度评分标准（sources.json）：
- **来源可信度（40%）**：官方网站 0.95，技术媒体 0.85-0.9，学术 0.95
- **内容完整性（25%）**：关键数据、技术细节、引用来源
- **时效性（15%）**：7天内的资讯
- **内容质量（20%）**：逻辑清晰、无夸大宣传
- **筛选标准**：综合评分 ≥ 0.8

#### 第三阶段：深度分析生成
按照 `AI-ANALYSIS-GUIDE.md` 框架，使用 `templates.md` 对应模板：

**分析结构（1500-2000字）：**
1. **📰 新闻背景**（150字）：时间、机构、关键数据、趋势背景
2. **⚙️ 技术深度解析**（400-500字）：
   - 技术原理与创新突破
   - 与前代/竞品对比（数据表格）
   - 技术成熟度评估
   - 局限性深度剖析
3. **🏭 行业应用与生态影响**（350-400字）：
   - 应用场景深度剖析（具体用例、价值主张、ROI）
   - 落地案例（成功/挑战/失败案例）
   - 生态链重构分析
4. **💹 市场格局与商业逻辑**（400-450字）：
   - 市场机会量化（TAM/SAM/SOM）
   - 竞争格局分析
   - 商业模式创新
   - 投资价值判断
5. **🌐 战略意义与未来推演**（400-450字）：
   - 战略定位分析
   - 情景推演（乐观/基准/悲观，概率加权）
   - 时间线预测（短期/中期/长期）
6. **✅ 核心洞察与行动建议**（200-250字）：
   - 3-5条关键结论（有数据支撑、反共识）
   - 分受众的行动建议（企业/投资者/从业者/政府）

#### 第四阶段：文件保存
- 保存路径：`YYYY-MM-DD/` 目录（如 `2024-11-06/`）
- 文件命名：
  - `ai-programming.md` - AI编程资讯
  - `generative-ai.md` - 生成式AI资讯
  - `ai-chips.md` - AI芯片资讯
  - `quantum-computing.md` - 量子计算资讯
  - `robotics.md` - 机器人资讯
- 如文件已存在，则追加新内容（用 `---` 分隔）

#### 第五阶段：网站构建
```bash
npm run build
```
自动生成：
- `docs/index.html` - 首页索引
- `docs/YYYY-MM-DD.html` - 每日资讯汇总
- `docs/news/YYYY-MM-DD/*.html` - 各资讯详情页
- `docs/feed.xml` - RSS订阅

#### 第六阶段：Git 提交
```bash
git add .
git commit -m "Add AI news analysis for YYYY-MM-DD

- AI Programming: [资讯标题]
- Generative AI: [资讯标题]
- AI Chips: [资讯标题]
- Quantum Computing: [资讯标题]
- Robotics: [资讯标题]"
git push origin master
```

---

### 🎯 质量保证标准

AI 自动化执行遵循以下质量标准：

**可信度评估：**
- ✅ 来源评分 ≥ 0.8
- ✅ 包含关键数据和技术细节
- ✅ 时效性在 7 天内
- ✅ 无明显夸大宣传

**分析深度：**
- ✅ 字数 1500-2000 字
- ✅ 包含数据支撑（性能指标、市场规模、对比表格）
- ✅ 提供非共识洞察（不是显而易见的结论）
- ✅ 具体可操作建议（分受众）

**格式规范：**
- ✅ 使用对应的模板结构
- ✅ 善用 emoji、表格、分点增强可读性
- ✅ 包含来源链接和可信度评分

---

### ❓ 常见问题 FAQ

**Q1：如何处理低质量资讯？**
A：AI 会自动过滤可信度评分 < 0.8 的资讯，并记录原因。如某个主题当天没有高质量资讯，会标注说明。

**Q2：如何调整搜索关键词？**
A：编辑本 README 的"AI 自动化执行详细步骤 → 第一阶段"部分，AI 会读取并使用新关键词。

**Q3：如何自定义分析侧重点？**
A：修改 `AI-ANALYSIS-GUIDE.md` 或 `templates.md`，AI 会自动遵循新的分析框架。

**Q4：自动化失败怎么办？**
A：查看错误信息，通常原因：
- 网络问题（web_search 失败）→ 重试
- 文件权限问题 → 检查目录权限
- Git 冲突 → 手动解决冲突后重新执行

**Q5：可以只执行部分流程吗？**
A：可以，在 Cursor Chat 中指定：
```
@README.md 请仅搜集资讯（不生成分析）
@README.md 请仅生成网站（不提交 Git）
```

---

### 🔧 手动执行工作流（备选）

如需手动控制，可分步执行：

```bash
# 1. 收集资讯后，在 Cursor Chat 中
@AI-ANALYSIS-GUIDE.md 请分析以下资讯：[粘贴资讯]

# 2. 保存 AI 生成的分析到对应文件
# 2024-11-06/ai-programming.md (或其他分类)

# 3. 生成并发布网站
npm run build && git add . && git commit -m "Add news for $(date +%Y-%m-%d)" && git push
```

**详细工作流请查看：[DAILY-WORKFLOW.md](./DAILY-WORKFLOW.md)**  
**分析方法论请查看：[AI-ANALYSIS-GUIDE.md](./AI-ANALYSIS-GUIDE.md)**

## 📊 关注领域

- **AI 芯片**：芯片设计、性能突破、新产品发布等
- **量子计算**：量子计算技术进展、应用场景、硬件创新等
- **机器人**：机器人技术、应用案例、产业发展等
- **生成式AI**：大模型发展、应用创新、技术突破等
- **AI 编程**：AI 辅助编程工具、代码生成技术、编程范式创新等（**重点关注**）

## 📁 目录结构

```
News/
├── README.md                          # 项目说明文档
├── .gitignore                         # Git忽略配置
├── package.json                       # 项目依赖和脚本
├── templates.md                       # 资讯类型模板定义
│
├── 2024-11-06/                        # 按日期组织的资讯文件夹
│   ├── ai-chips.md                    # AI芯片资讯
│   ├── quantum-computing.md           # 量子计算资讯
│   ├── robotics.md                    # 机器人资讯
│   ├── generative-ai.md               # 生成式AI资讯
│   └── ai-programming.md              # AI编程资讯
│
├── mcp-server/                        # MCP服务器
│   ├── server.js                      # 服务器入口
│   ├── package.json                   # 依赖配置
│   ├── config/
│   │   ├── sources.json               # 可信来源配置
│   │   └── evaluation-rules.json      # 评估规则配置
│   ├── tools/
│   │   ├── process-news.js            # 资讯处理工具
│   │   ├── evaluate-content.js        # 内容评估工具
│   │   └── source-validator.js        # 来源验证工具
│   └── utils/
│       ├── credibility-scorer.js      # 可信度评分器
│       └── content-analyzer.js        # 内容分析器
│
├── static-site/                       # 静态网站生成器
│   ├── generator.js                   # 生成器主程序
│   ├── templates/
│   │   ├── index.html                 # 首页模板
│   │   ├── daily.html                 # 每日汇总模板
│   │   └── news-item.html             # 资讯详情模板
│   └── styles/
│       └── main.css                   # 样式文件
│
├── docs/                              # 生成的静态网站（GitHub Pages）
│   ├── index.html                     # 网站首页
│   ├── search.html                    # 搜索页面
│   ├── stats.html                     # 统计页面
│   ├── feed.xml                       # RSS订阅
│   ├── 2024-11-06.html                # 每日资讯页面
│   └── news/
│       └── 2024-11-06/
│           ├── ai-chips.html          # 资讯详情页
│           └── ...
│
└── .github/
    └── workflows/
        └── deploy.yml                 # GitHub Actions部署配置
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 MCP 服务器

MCP 服务器用于自动处理资讯内容，包括来源验证、可信度评估和内容生成。

```bash
cd mcp-server
npm install
```

### 3. 收集资讯

使用 MCP 工具处理资讯：

```javascript
// 通过 Cursor 或其他支持 MCP 的工具调用
process_news({
  content: "资讯内容...",
  source: "https://techcrunch.com/...",
  publishDate: "2024-11-06"
})
```

### 4. 生成静态网站

```bash
npm run build
```

### 5. 本地预览

```bash
npm run serve
```

## 📝 资讯格式规范

### 文件命名规范

- **日期文件夹**：`YYYY-MM-DD/` （如：`2024-11-06/`）
- **资讯文件**：固定英文文件名
  - `ai-chips.md` - AI芯片资讯
  - `quantum-computing.md` - 量子计算资讯
  - `robotics.md` - 机器人资讯
  - `generative-ai.md` - 生成式AI资讯
  - `ai-programming.md` - AI编程资讯

### 资讯内容模板

每种资讯类型都有定制化的模板（详见 `templates.md`），基本结构如下：

```markdown
# 🔥 资讯标题

**发布日期：** YYYY-MM-DD  
**来源：** [来源名称](链接)  
**分类：** AI芯片/量子计算/机器人/生成式AI/AI编程  
**可信度评分：** ⭐⭐⭐⭐⭐

---

## 📰 新闻背景

- 时间、机构/企业、产品或技术、核心事件
- 关键数据或亮点

## ⚙️ 技术现状

- 技术原理、创新点
- 与现有技术的突破
- 可能存在的局限或挑战

## 🏭 行业应用现状

- 具体应用场景与行业
- 已落地或试点案例
- 行业现状总结

## 💹 市场与商业影响

- 对企业、投资者、市场的短期影响
- 对生态或产业链的潜在影响

## 🌐 战略与未来展望

- 短期、中期、长期发展趋势
- 技术、行业或政策的机遇与风险
- 对产业、企业或全球市场的战略意义

## ✅ 结论

[用一两句话总结核心洞察]

---

**标签：** #AI芯片 #技术突破 #新产品
```

### 不同资讯类型的侧重点

#### AI 编程（重点关注）
- **侧重**：技术现状、开发者工具、代码示例、技术影响
- **关注点**：编程效率提升、新工具特性、实际应用案例

#### AI 芯片 / 量子计算
- **侧重**：技术突破、性能指标、行业影响、市场影响
- **关注点**：技术参数、商业化进展、产业影响

#### 机器人 / 生成式AI
- **侧重**：平衡技术现状和行业应用
- **关注点**：应用场景、实际效果、市场反馈

## 🤖 MCP 工具使用

### process_news - 处理资讯

自动分析、评估和生成资讯内容。

**功能：**
- 分析资讯类型（AI芯片/量子计算/机器人/生成式AI/AI编程）
- 评估内容可信度和质量
- 过滤低质量或不可信内容
- 使用定制模板生成 markdown
- 追加到对应日期的文件

**使用方式：**
```
请帮我处理以下资讯：

[粘贴资讯内容]

来源：[URL或来源名称]
发布日期：2024-11-06
```

### evaluate_content - 评估内容

评估资讯内容的可信度和价值。

**评估维度：**
1. **来源可信度**（40%）- 域名验证、官方vs第三方
2. **内容完整性**（25%）- 数据、技术细节、引用来源
3. **时效性**（15%）- 发布时间（7天内）
4. **内容质量**（20%）- 逻辑清晰、无夸大宣传

**评估结果：**
- **高可信度**（≥0.8）：直接生成，使用完整模板
- **中等可信度**（0.7-0.8）：生成但标注来源
- **低可信度**（<0.7）：跳过，记录原因

## 🌐 静态网站功能

### 自动生成功能

- ✅ 每日资讯汇总页面
- ✅ 资讯详情页面（markdown转HTML）
- ✅ 首页索引（按日期列表）
- ✅ 全文搜索功能（lunr.js）
- ✅ RSS订阅（feed.xml）
- ✅ 统计分析页面（资讯趋势图表）
- ✅ 响应式设计（移动端适配）

### 访问网站

- **在线访问**：https://your-username.github.io/News/
- **本地预览**：`npm run serve`

## 🔄 GitHub Pages 自动部署

### 自动化流程

1. **推送 markdown 文件**到仓库
2. **GitHub Actions 自动触发**构建
3. **运行静态网站生成器**
4. **部署到 GitHub Pages**
5. **网站自动更新**

### 部署配置

在仓库 Settings → Pages 中：
- **Source**: Deploy from a branch
- **Branch**: master
- **Folder**: /docs

### 手动部署

```bash
npm run build        # 生成静态网站
git add docs/
git commit -m "Update website"
git push
```

## 📊 使用统计

- **总资讯数**：实时统计
- **分类分布**：饼图展示
- **更新趋势**：折线图展示

## 🛠️ 开发指南

### 添加新的资讯类型

1. 在 `templates.md` 中定义新模板
2. 更新 MCP 工具的分类逻辑
3. 更新静态网站生成器
4. 更新 README

### 自定义评估规则

编辑 `mcp-server/config/evaluation-rules.json`：

```json
{
  "minimum_requirements": {
    "min_length": 200,
    "require_data_points": true
  },
  "red_flags": {
    "excessive_hype": ["revolutionary", "game-changing"],
    "lack_of_details": true
  }
}
```

### 添加可信来源

编辑 `mcp-server/config/sources.json`：

```json
{
  "trusted_domains": {
    "example.com": {
      "score": 0.9,
      "category": "tech_news"
    }
  }
}
```

## 📖 使用示例

### 典型工作流

1. **每天早上**：收集资讯
2. **使用 MCP 工具**：自动处理和评估
3. **高质量资讯**：自动生成 markdown
4. **推送到仓库**：触发自动部署
5. **网站更新**：自动发布新内容

### 命令速查

```bash
# 安装依赖
npm install

# 构建静态网站
npm run build

# 本地预览
npm run serve

# 运行 MCP 服务器
npm run mcp

# 清理构建文件
npm run clean
```

## 🔗 相关链接

- [在线网站](https://your-username.github.io/News/)
- [RSS 订阅](https://your-username.github.io/News/feed.xml)
- [MCP 协议文档](https://modelcontextprotocol.io/)

## 📄 许可证

MIT License

---

**最后更新：** 2024-11-06  
**维护者：** Your Name
