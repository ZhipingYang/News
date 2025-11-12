# 每日资讯收集工作流

## 🎯 快速开始（2分钟版）

### 方式一：在 Cursor 中使用（推荐）

每天只需在 Cursor 中执行以下步骤：

1. **收集资讯**（@导入资讯内容）
```
@AI-ANALYSIS-GUIDE.md

请按照深度分析指南，对以下资讯进行专业分析：

【资讯内容粘贴在这里】

来源：[URL或来源名称]
发布日期：2024-11-06
```

2. **AI 自动处理**
   - AI 会根据指南生成1500-2000字的深度分析
   - 自动分类到对应类别
   - 自动评估质量并打分

3. **保存资讯**
   - 将生成的内容复制
   - 创建对应日期文件夹（如 `2024-11-06/`）
   - 保存到对应分类文件（如 `ai-programming.md`）

4. **生成网站**
```bash
npm run build
```

5. **推送发布**（可选）
```bash
git add .
git commit -m "Add news for $(date +%Y-%m-%d)"
git push
```

Done! GitHub Actions 会自动部署网站。

---

## 📋 完整工作流（详细版）

### Step 1: 资讯收集（15-30分钟）

**资讯来源清单：**

#### 中文来源
- [ ] 机器之心：https://www.jiqizhixin.com/
- [ ] 量子位：https://www.qbitai.com/
- [ ] AI科技评论：https://www.leiphone.com/category/ai
- [ ] 36氪：https://36kr.com/
- [ ] 新智元：https://mp.weixin.qq.com/s（公众号）

#### 英文来源
- [ ] TechCrunch AI：https://techcrunch.com/category/artificial-intelligence/
- [ ] The Verge AI：https://www.theverge.com/ai-artificial-intelligence
- [ ] MIT Technology Review：https://www.technologyreview.com/
- [ ] Hacker News：https://news.ycombinator.com/
- [ ] ArXiv：https://arxiv.org/list/cs.AI/recent

#### 官方渠道
- [ ] OpenAI Blog：https://openai.com/blog
- [ ] Google AI Blog：https://ai.googleblog.com/
- [ ] Microsoft AI Blog：https://blogs.microsoft.com/ai/
- [ ] GitHub Blog：https://github.blog/
- [ ] NVIDIA Blog：https://blogs.nvidia.com/

#### 社交媒体
- [ ] Twitter/X：关注 @sama, @ylecun, @goodfellow_ian 等
- [ ] LinkedIn：关注行业领袖
- [ ] 知乎：关注 AI 话题

**收集标准：**
```
必须满足：
✓ 发布时间在 7 天内
✓ 有明确的数据或事实
✓ 来源可靠
✓ 具有行业影响力

优先选择：
⭐ AI编程相关（重点关注）
⭐ 技术突破（性能提升>30%）
⭐ 产品发布（头部公司）
⭐ 融资信息（>$50M）
⭐ 政策法规（监管变化）

避免：
✗ 纯营销软文
✗ 二手信息（转载的转载）
✗ 无实质内容（标题党）
✗ 过时资讯（>7天）
```

---

### Step 2: AI 深度分析（使用 Cursor）

#### 2.1 准备工作

在 Cursor 中打开项目：
```bash
cd /Users/xcodeyang/RC_Work/News
code .  # 或 cursor .
```

#### 2.2 导入分析指南

在 Chat 中输入：
```
@AI-ANALYSIS-GUIDE.md

我将给你一条资讯，请按照这个指南进行深度分析。

准备好了请说"准备好了，请提供资讯内容"
```

#### 2.3 提供资讯内容

当 AI 确认后，粘贴资讯：
```
【原始资讯内容】

来源：https://example.com/article
发布日期：2024-11-06
标题：[标题]

[正文内容...]
```

#### 2.4 AI 生成分析

AI 会生成包含以下内容的深度分析：
- 🔥 标题（吸引力标题）
- 📰 新闻背景（150字，关键数据）
- ⚙️ 技术深度解析（400-500字）
- 🏭 行业应用与生态影响（350-400字）
- 💹 市场格局与商业逻辑（400-450字）
- 🌐 战略意义与未来推演（400-450字）
- ✅ 核心洞察与行动建议（200-250字）

总字数：1500-2000字

#### 2.5 质量检查

确认 AI 生成的内容包含：
- [ ] 具体数据和数字
- [ ] 多维度分析（技术/商业/战略）
- [ ] 案例佐证
- [ ] 前瞻预测
- [ ] 行动建议

如果不满意，追问：
```
请在以下方面进行补充：
1. 增加更多数据支撑
2. 深化技术原理分析
3. 补充竞争对手对比
4. 量化商业影响
```

---

### Step 3: 保存资讯

#### 3.1 创建/检查日期文件夹

```bash
# 自动创建今天的文件夹
mkdir -p $(date +%Y-%m-%d)
```

或手动创建：
```bash
mkdir -p 2024-11-06
```

#### 3.2 保存到对应文件

根据资讯类别，选择文件：
- `ai-programming.md` - AI 编程
- `ai-chips.md` - AI 芯片
- `quantum-computing.md` - 量子计算
- `robotics.md` - 机器人
- `generative-ai.md` - 生成式AI

**文件格式：**
```markdown
# [category] 资讯汇总


# 🔥 [资讯标题]

[AI 生成的完整分析内容]

---

```

**如果文件已存在**，追加到文件末尾（保留文件头部的"资讯汇总"标题）

#### 3.3 添加元数据

确保每条资讯包含：
```markdown
**发布日期：** 2024-11-06  
**来源：** [来源名称](URL)  
**分类：** [AI芯片/量子计算/机器人/生成式AI/AI编程]  
**可信度评分：** ⭐⭐⭐⭐⭐
```

---

### Step 4: 生成静态网站

```bash
# 安装依赖（首次运行）
npm install

# 生成网站
npm run build

# 本地预览（可选）
npm run serve
```

**输出确认：**
```
🚀 开始生成静态网站...
📁 找到 X 个日期文件夹
✅ 生成首页：index.html
✅ 生成每日页面：2024-11-06.html
   ├─ 生成 X 条资讯详情页
✨ 静态网站生成完成！
```

**本地预览：**
打开浏览器访问 http://localhost:8080

检查：
- [ ] 首页日期卡片正确
- [ ] 每日汇总页资讯完整
- [ ] 详情页排版正常
- [ ] 链接都可点击

---

### Step 5: 推送到 GitHub

```bash
# 检查状态
git status

# 添加所有变更
git add .

# 提交（自动生成日期）
git commit -m "Add AI news for $(date +%Y-%m-%d)"

# 推送到 GitHub
git push origin master
```

**GitHub Actions 自动部署：**
1. 推送后自动触发构建
2. 约 2-3 分钟完成部署
3. 访问 https://your-username.github.io/News/ 查看

**检查部署：**
- 进入 GitHub 仓库
- 点击 "Actions" 标签
- 查看最新 workflow 运行状态
- ✅ 绿色勾 = 部署成功
- ❌ 红叉 = 部署失败（查看日志）

---

## 🔧 故障排查

### 问题 1: 网站生成失败

**错误信息：**
```
❌ 生成失败： Error: ENOENT: no such file or directory
```

**解决方法：**
```bash
# 确认文件存在
ls 2024-11-06/*.md

# 检查文件格式
cat 2024-11-06/ai-programming.md | head -20

# 重新生成
npm run build
```

### 问题 2: 资讯内容为空

**原因：**
- Markdown 文件格式错误
- 内容被分隔符错误拆分

**解决：**
1. 检查分隔符：确保使用 `\n---\n\n` （换行+三个横线+换行）
2. 检查文件头：确保有 `# [category] 资讯汇总` 标题
3. 检查内容长度：至少 100 字符

### 问题 3: GitHub Actions 失败

**常见原因：**
1. **权限问题**：
   - Settings → Actions → General → Workflow permissions
   - 选择 "Read and write permissions"

2. **依赖安装失败**：
   - 检查 package.json 是否正确
   - 检查 npm 版本

3. **构建失败**：
   - 查看 Actions 日志
   - 本地先运行 `npm run build` 确认无误

---

## ⚡ 高级技巧

### 技巧 1: 批量处理多条资讯

```
@AI-ANALYSIS-GUIDE.md

我有 3 条资讯需要分析，请依次分析：

【资讯1】
来源：...
内容：...

【资讯2】
来源：...
内容：...

【资讯3】
来源：...
内容：...
```

### 技巧 2: 使用 AI 优化已有内容

```
@AI-ANALYSIS-GUIDE.md
@2024-11-06/ai-programming.md

请帮我优化这篇资讯分析：
1. 增加更多数据支撑
2. 深化商业逻辑分析
3. 补充竞争格局
4. 优化行动建议
```

### 技巧 3: 生成每日总结

```
@2024-11-06/*.md

请生成今日资讯的执行摘要（Executive Summary）：
1. 今日最重要的 3 条资讯
2. 共同趋势和模式
3. 对企业的综合建议
4. 需要持续关注的方向

字数：500-800字
```

### 技巧 4: 自动化脚本（进阶）

创建 `daily.sh`：
```bash
#!/bin/bash

# 每日自动化脚本

# 1. 创建今日文件夹
TODAY=$(date +%Y-%m-%d)
mkdir -p $TODAY

echo "📅 Today: $TODAY"
echo "🚀 Starting daily workflow..."

# 2. 提示收集资讯
echo ""
echo "📰 Please collect news and save to $TODAY/*.md"
echo "   - ai-programming.md"
echo "   - ai-chips.md"
echo "   - quantum-computing.md"
echo "   - robotics.md"
echo "   - generative-ai.md"
echo ""
read -p "Press Enter when ready to build..."

# 3. 生成网站
echo "🏗️  Building website..."
npm run build

# 4. 本地预览（可选）
echo ""
read -p "Preview locally? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run serve &
    echo "🌐 Opening http://localhost:8080"
    sleep 2
    open http://localhost:8080
    read -p "Press Enter to stop server..."
    killall node
fi

# 5. Git 提交
echo ""
read -p "Push to GitHub? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add .
    git commit -m "Add AI news for $TODAY"
    git push origin master
    echo "✅ Pushed to GitHub!"
    echo "🌐 Website will be live in 2-3 minutes"
fi

echo ""
echo "✨ Daily workflow completed!"
```

使用：
```bash
chmod +x daily.sh
./daily.sh
```

---

## 📊 效率优化

### 时间分配建议

| 任务 | 时间 | 占比 |
|------|------|------|
| 资讯收集 | 15-20分钟 | 30% |
| AI 分析生成 | 10-15分钟 | 25% |
| 内容审核优化 | 15-20分钟 | 30% |
| 生成和发布 | 5-10分钟 | 15% |
| **总计** | **45-65分钟** | **100%** |

### 效率提升技巧

1. **RSS 订阅**：使用 Feedly 订阅所有来源，集中查看
2. **浏览器书签**：创建"AI News"文件夹，收藏常用网站
3. **模板化**：准备常用 Prompt 模板
4. **定时**：每天固定时间处理（如早10点或晚8点）
5. **批量**：积累2-3条资讯一起处理，效率更高

---

## 📈 质量控制

### 每周检查（周五）

- [ ] 本周生成了几条资讯？
- [ ] 每条资讯字数是否达标（1500+）？
- [ ] 是否包含足够的数据支撑？
- [ ] 是否提供了行动建议？
- [ ] 网站是否正常显示？
- [ ] 是否有读者反馈？

### 每月回顾（月末）

- [ ] 本月最有价值的 3 条资讯？
- [ ] 哪些趋势被准确预测？
- [ ] 哪些分析有偏差？
- [ ] 如何改进分析质量？
- [ ] 是否需要调整关注方向？

---

## 🎓 持续改进

### 学习资源

- [ ] 订阅 AI 领域顶级 Newsletter
- [ ] 关注行业分析师的 Twitter
- [ ] 阅读投资机构的行业报告
- [ ] 参加线上技术分享会
- [ ] 加入 AI 社群交流

### 分析能力提升

1. **第1个月**：熟悉流程，保证产出
2. **第2-3个月**：提升深度，增加数据
3. **第4-6个月**：培养洞察，建立方法论
4. **6个月+**：形成风格，建立影响力

---

## 💡 最佳实践

1. **稳定输出**：每天至少1条高质量分析
2. **重点突出**：AI编程相关资讯优先
3. **数据驱动**：每条分析至少5个数据点
4. **行动导向**：始终提供可操作建议
5. **持续迭代**：根据反馈不断优化

---

## 🆘 需要帮助？

1. 查看 `README.md` - 项目总体说明
2. 查看 `AI-ANALYSIS-GUIDE.md` - 分析方法论
3. 查看 `SETUP_COMPLETE.md` - 技术文档
4. 在 GitHub Issues 提问

---

**记住：高质量的深度分析比数量更重要。宁可一天一条优质内容，也不要三条平庸内容。**

现在，开始你的每日资讯收集吧！🚀

