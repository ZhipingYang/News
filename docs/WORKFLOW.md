# AI资讯自动化工作流

## 工作流概述

完整的AI资讯自动化分析工作流包含9个阶段：

```
RSS源抓取 → 去重检查 → 可信度评估 → 智能补充 → 重要资讯扩展 → 内容压缩 → 深度分析 → 网站构建 → Git推送
```

**执行时间：** 25-40分钟（全程自动）  
**质量原则：** 宁缺毋滥，只保留高质量资讯（可信度≥0.85）  
**智能扩展：** 自动识别高影响力资讯并深度分析

---

## 第一阶段：RSS源抓取 + GitHub Trending（8-12分钟）

### 资讯来源
- **主要来源**：25个精品RSS源（成功率100%）
- **GitHub Trending**：每日AI开源项目趋势（新增）
- **补充来源**：web_search搜索（按需触发）

### 抓取流程
1. 读取 `mcp-server/config/rss-sources.json`
2. 按类目抓取所有RSS源
3. **通过web_search获取GitHub Trending AI项目**
4. 过滤7天内的资讯
5. 过滤可信度<0.8的源
6. 按发布日期排序

### RSS源类目
- **ai-programming**：10个源（GitHub、JetBrains、Microsoft、AWS ML、Hugging Face等）
- **ai-products**：9个源（Google AI、Microsoft AI、NVIDIA、AWS、LangChain等）
- **tech-general**：6个源（MIT Tech Review、IEEE、Nature、Science等）

### GitHub Trending评估标准（新增）

**评分体系（100分制）：**
- ⭐ Star数（30分）：病毒式传播≥5000、热门≥1000、上升≥100
- 📈 今日增长（20分）：爆发≥500/day、热门≥100/day、增长≥50/day
- 💥 颠覆性（20分）：revolutionary、breakthrough、novel、game-changing
- 🎨 创造性（15分）：innovative、unique、creative、unconventional
- 🎮 趣味性（10分）：fun、cool、amazing、engaging
- 🤖 AI相关性（5分）：llm、agent、transformer、generative

**添加标准：**
- ✅ 必须添加：评分≥70（行业颠覆性、技术创新显著、社区热度极高）
- 💡 推荐添加：评分≥50（有创新亮点、实用性强、增长势头好）
- ❌ 不推荐：评分<50（缺乏创新、实用性一般、热度不足）

**获取方式：**
```bash
# 方式1：在Cursor Chat中使用web_search
"搜索今天GitHub Trending中的AI项目，评估哪些值得添加到AI编程资讯"

# 方式2：查看评估指南
node tools/evaluate-github-trending.js
```

### 输出
- RSS抓取结果：`mcp-server/data/rss-fetch-YYYY-MM-DD.json`
- GitHub Trending：通过web_search获取，AI评估后直接整合到资讯中

---

## 第二阶段：去重检查（3-5分钟）

### 去重机制
1. **标题相似度检查**：Levenshtein距离算法，阈值80%
2. **关键词重叠检查**：重叠度70% + 标题相似60%
3. **历史对比**：对比最近7天的历史记录

### 去重数据库
- 位置：`mcp-server/data/deduplication.json`
- 保留：最近7天数据
- 自动清理：每次运行时清理过期数据

---

## 第三阶段：可信度评估（2-3分钟）

### 评估标准（可信度≥0.85才接受）

**评估维度：**
1. **来源可信度**（40%）：官方0.95、技术媒体0.85-0.9、学术0.95
2. **内容完整性**（25%）：技术细节、关键数据、引用来源
3. **时效性**（15%）：7天内1.0分、7-14天0.8分
4. **内容质量**（20%）：逻辑清晰、无夸大宣传、技术深度

### 筛选结果
- **可信度≥0.85**：进入下一阶段
- **可信度<0.85**：丢弃，记录原因

---

## 第四阶段：智能补充（5-10分钟）

### AI动态判断
- 分析每个类目的资讯数量和质量
- 触发条件：资讯<3条 或 质量分数<0.75
- 生成web_search搜索查询
- 补充至5-8条高质量资讯

### 使用工具
```bash
node tools/intelligent-supplement.js data/rss-fetch-YYYY-MM-DD.json
```

---

## 第五阶段：重要资讯扩展（5-10分钟）

### 影响力评估
- 自动评估每条资讯的影响力分数（0-100）
- 评估维度：
  - 关键词匹配（30分）：发布、突破、融资等
  - 来源可信度（20分）：≥0.9加分
  - 知名机构（15分）：OpenAI、Google等
  - 数据指标（10分）：包含具体数字
  - 内容详细度（10分）：>500字

### 触发条件
- 类目资讯数量<5条
- 存在影响力分数≥50的资讯

### 扩展策略
- 生成5个web_search查询：
  1. 原标题
  2. 标题 + 背景上下文
  3. 标题 + 技术细节
  4. 标题 + 市场反应
  5. 标题 + 专家评论
- AI收集并整合信息
- 生成1500-2000字完整深度分析

### 使用工具
```bash
node tools/expand-important-news.js data/processed-rss-YYYY-MM-DD.json
```

---

## 第六阶段：内容压缩（2-3分钟）

### 智能摘要提取
- 提取：标题、关键数据、核心句子、技术细节
- 移除：冗余描述、广告、无关段落
- 保留：技术细节、核心数据、商业逻辑
- 压缩至：原文的30-40%

### 使用工具
```bash
node utils/content-compressor.js data/processed-rss-YYYY-MM-DD.json
```

---

## 第七阶段：深度分析生成（15-20分钟）

### 分析框架（1500-2000字）

**文章结构：**
1. 📰 新闻背景（150字）
2. ⚙️ 技术深度解析（400-500字）
3. 🏭 行业应用与生态影响（350-400字）
4. 💹 市场格局与商业逻辑（400-450字）
5. 🌐 战略意义与未来推演（400-450字）
6. ✅ 核心洞察与行动建议（200-250字）

### 质量要求
- ✅ 数据支撑：性能指标、市场规模、对比表格
- ✅ 非共识洞察：不是显而易见的结论
- ✅ 可操作建议：分受众（企业/投资者/从业者）

---

## 第八阶段：网站构建（2-3分钟）

### 文件保存
- 目录：`news_markdown/YYYY-MM-DD/`
- 文件：
  - `ai-programming.md`
  - `ai-products.md`
  - `tech-general.md`

### 网站构建
```bash
npm run build
```

**生成内容：**
- `publish_site/index.html` - 首页索引
- `publish_site/YYYY-MM-DD.html` - 每日汇总
- `publish_site/news/YYYY-MM-DD/*.html` - 资讯详情页

---

## 第九阶段：Git推送（1-2分钟）

### 自动提交
```bash
git add .
git commit -m "Add AI news analysis for YYYY-MM-DD..."
```

### 自动推送（GitHub CLI优先）
```bash
gh repo set-default your-username/News
git push origin master
```

### 成功标志
- ✅ 本地提交成功
- ✅ 推送到GitHub成功
- 🌐 网站在2-3分钟后自动更新

---

## 手动执行步骤

如需手动控制，可分步执行：

```bash
# 1. 测试RSS源
cd mcp-server
node tools/test-rss-sources.js

# 2. 抓取RSS源
node tools/fetch-rss.js all

# 3. 智能补充判断
node tools/intelligent-supplement.js data/rss-fetch-YYYY-MM-DD.json

# 4. 去重和评估
node tools/process-rss-data.js data/rss-fetch-YYYY-MM-DD.json 0.85

# 5. 重要资讯扩展
node tools/expand-important-news.js data/processed-rss-YYYY-MM-DD.json

# 6. 内容压缩
node utils/content-compressor.js data/processed-rss-YYYY-MM-DD.json

# 7. 在Cursor Chat中请求分析
@WORKFLOW.md 请根据处理结果生成今日分析

# 8. 构建网站
cd ..
npm run build

# 9. 推送
./scripts/auto-push.sh
```

---

## 故障排查

**RSS抓取失败：**
- 检查网络连接
- 运行测试工具：`node tools/test-rss-sources.js`

**去重误判：**
- 调整相似度阈值（默认0.8）
- 检查去重数据库：`data/deduplication.json`

**质量评估过严：**
- 检查可信度阈值（默认0.85）
- 必要时降低至0.8

**Git推送失败：**
- 检查GitHub CLI：`gh auth status`
- 检查Token：`.env`文件中的`GITHUB_TOKEN`
- 手动推送：`git push`

---

## 质量保证检查点

### 自动检查
- [ ] RSS源抓取成功（每个类目至少3条）
- [ ] 去重检查完成，重复资讯已移除
- [ ] 所有资讯可信度≥0.85
- [ ] 智能补充已执行（如需要）
- [ ] 重要资讯扩展已执行（如有高影响力资讯）
- [ ] 内容已压缩至30-40%
- [ ] 每篇分析1500-2000字
- [ ] 静态网站已生成
- [ ] Git提交推送成功

---

**最后更新：** 2025-11-10
