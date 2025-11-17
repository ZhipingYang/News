# AI Agent 自动化工作流指南

> **给Cursor AI Agent的完整执行指南** - 一次性自动完成所有任务

---

## 🎯 工作流概述

作为AI Agent，你需要自动完成以下任务：

1. **执行自动化脚本** - 运行程序化的数据处理流程
2. **处理建议文件** - 自动执行web_search和内容评估
3. **生成和发布** - 完成网站生成和GitHub推送

**关键原则**：无需等待人工确认，自动完成所有步骤。

---

## 📋 完整执行流程

### 阶段一：执行自动化脚本

```bash
npm run auto
```

**脚本会自动完成**：
1. RSS资讯抓取（25个源）
2. 去重和可信度评估
3. 智能补充分析（生成建议文件）
4. 高影响力资讯扩展（生成建议文件）
5. 静态网站生成
6. GitHub推送

**输出**：
- `mcp-server/data/rss-fetch-YYYY-MM-DD.json` - 原始RSS数据
- `mcp-server/data/processed-rss-YYYY-MM-DD.json` - 处理后数据
- `mcp-server/data/supplement-suggestions-YYYY-MM-DD.json` - 补充建议（如有）
- `mcp-server/data/expansion-suggestions-YYYY-MM-DD.json` - 扩展建议（如有）

### 阶段二：AI自动处理建议文件

**检查是否有建议文件**：

脚本执行完成后，会显示：
```
🤖 AI Agent 后续任务
检测到建议文件，AI Agent请继续执行：
...
```

如果看到这个提示，**立即自动执行以下步骤**：

#### Step 1: 读取建议文件

```javascript
// 读取补充建议
const supplementFile = 'mcp-server/data/supplement-suggestions-YYYY-MM-DD.json';
const supplementData = JSON.parse(await readFile(supplementFile));

// 读取扩展建议
const expansionFile = 'mcp-server/data/expansion-suggestions-YYYY-MM-DD.json';
const expansionData = JSON.parse(await readFile(expansionFile));
```

#### Step 2: 处理补充建议

对于每个需要补充的类目：

```javascript
for (const [category, data] of Object.entries(supplementData.categories)) {
  if (data.searchQueries && data.searchQueries.length > 0) {
    // 执行搜索查询（限制为前2-3个查询，避免过多）
    for (const query of data.searchQueries.slice(0, 3)) {
      console.log(`🔍 搜索: ${query}`);
      
      // 使用 @web_search 执行查询
      const searchResults = await webSearch(query);
      
      // 对每个搜索结果评估和处理
      for (const result of searchResults.slice(0, 2)) { // 每个查询取前2个结果
        // 1. 评估内容
        const evaluation = await evaluateContent({
          content: result.content,
          source: result.url,
          publishDate: result.publishDate,
          title: result.title
        });
        
        // 2. 如果质量足够（credibility >= 0.85），处理资讯
        if (evaluation.credibility >= 0.85 && evaluation.shouldGenerate) {
          // 生成1500-2000字深度分析（参考 AI-ANALYSIS-GUIDE.md）
          const analysis = await generateDeepAnalysis(result, category);
          
          // 3. 保存到对应类目
          await processNews({
            content: analysis,
            source: result.url,
            publishDate: result.publishDate,
            title: result.title,
            forceGenerate: false
          });
          
          console.log(`✓ 已添加补充资讯到 ${category}: ${result.title}`);
        }
      }
    }
  }
}
```

#### Step 3: 处理扩展建议

对于每个高影响力资讯：

```javascript
for (const [category, data] of Object.entries(expansionData.categories)) {
  if (data.needsExpansion && data.highImpactNews.length > 0) {
    for (const news of data.highImpactNews) {
      console.log(`🌟 扩展高影响力资讯: ${news.title}`);
      
      // 执行深度搜索查询（全部5个查询）
      const allSearchResults = [];
      for (const query of news.searchQueries) {
        const results = await webSearch(query);
        allSearchResults.push(...results.slice(0, 1)); // 每个查询取1个最佳结果
      }
      
      // 基于原始资讯 + 搜索结果，生成2000字深度扩展
      const deepAnalysis = await generateDeepExpansion(news, allSearchResults);
      
      // 保存扩展分析
      await processNews({
        content: deepAnalysis,
        source: news.source,
        publishDate: news.pubDate,
        title: news.title + " - 深度分析",
        forceGenerate: true // 强制生成
      });
      
      console.log(`✓ 已生成深度扩展: ${news.title}`);
    }
  }
}
```

#### Step 4: 重新生成和发布

```bash
# 重新生成网站（包含新添加的资讯）
npm run build

# 推送到GitHub
./scripts/auto-push.sh
```

---

## 🤖 AI Agent执行示例

完整的自动化执行prompt：

```
请执行今日AI资讯自动化分析工作流：

1. 运行自动化脚本：
   npm run auto

2. 检查输出，如果有建议文件：
   - 读取补充建议文件（supplement-suggestions）
   - 读取扩展建议文件（expansion-suggestions）

3. 对每个搜索查询自动执行：
   - 使用 @web_search 搜索
   - 使用 evaluate_content MCP工具评估
   - 对高质量资讯（credibility >= 0.85）生成深度分析
   - 使用 process_news MCP工具保存

4. 完成后重新生成和发布：
   npm run build && ./scripts/auto-push.sh

请自动完成所有步骤，不需要等待确认。
```

---

## 📊 质量标准

### 内容评估标准

**必须满足**：
- 可信度 >= 0.85
- 来源可靠（在trusted sources列表中）
- 内容完整（有技术细节或数据支撑）
- 时效性好（7天内）

### 深度分析标准

参考 `AI-ANALYSIS-GUIDE.md`，生成1500-2000字分析，必须包含：

1. **技术解析** (30%)
   - 核心技术原理
   - 技术创新点
   - 技术难度和突破

2. **商业逻辑** (30%)
   - 商业模式分析
   - 价值链影响
   - 竞争格局变化

3. **市场影响** (20%)
   - 目标市场分析
   - 市场机会和威胁
   - 用户价值主张

4. **战略意义** (15%)
   - 对企业战略的影响
   - 对行业的长期影响
   - 潜在风险和机会

5. **行动建议** (5%)
   - 对企业的建议
   - 对投资人的建议
   - 对技术人员的建议

---

## 🔧 MCP工具使用

### evaluate_content

```javascript
{
  "tool": "evaluate_content",
  "params": {
    "content": "完整的文章内容",
    "source": "https://example.com/article",
    "publishDate": "2025-11-12",
    "title": "文章标题"
  }
}
```

**返回**：
```javascript
{
  "credibility": 0.92,
  "category": "ai-programming",
  "shouldGenerate": true,
  "warnings": []
}
```

### process_news

```javascript
{
  "tool": "process_news",
  "params": {
    "content": "1500-2000字的深度分析内容",
    "source": "https://example.com/article",
    "publishDate": "2025-11-12",
    "title": "文章标题",
    "forceGenerate": false
  }
}
```

**返回**：
```javascript
{
  "success": true,
  "category": "ai-programming",
  "file": "2025-11-12/ai-programming.md",
  "message": "资讯已添加"
}
```

---

## ⚡ 优化策略

### 搜索查询优化

**补充建议**：
- 每个类目最多执行3个搜索查询
- 每个查询取前2个结果
- 总共最多6篇新资讯

**扩展建议**：
- 对每个高影响力资讯执行全部5个查询
- 每个查询取1个最佳结果
- 综合生成1篇深度扩展

### 并行处理

可以并行处理不同类目的补充：

```javascript
const categories = Object.keys(supplementData.categories);
await Promise.all(categories.map(category => processCategory(category)));
```

### 错误处理

```javascript
try {
  // 执行搜索和处理
} catch (error) {
  console.error(`处理失败: ${error.message}`);
  // 继续处理下一个，不要中断整个流程
  continue;
}
```

---

## 📝 执行日志示例

```
🤖 AI Agent 开始执行工作流...

[1/4] 运行自动化脚本
  ✓ RSS 资讯抓取: 42条
  ✓ 去重和评估: 18条合格
  ✓ 智能补充分析: 检测到2个类目需要补充
  ✓ 高影响力扩展: 发现1条高影响力资讯

[2/4] 处理补充建议
  📋 ai-programming: 3个搜索查询
    🔍 AI coding tools 2025-11-12
      ✓ 添加: GitHub Copilot X发布...
      ✓ 添加: JetBrains AI Assistant更新...
    🔍 GitHub Copilot new features 2025-11-12
      ✓ 添加: Copilot Chat支持多模型...
  
  📋 ai-products: 3个搜索查询
    🔍 AI product launch 2025-11-12
      ✓ 添加: OpenAI发布GPT-5预览...
      ⊳ 跳过: 质量不足 (credibility=0.72)

[3/4] 处理扩展建议
  🌟 高影响力资讯: Anthropic推出Claude 3.5 Sonnet
    🔍 执行5个深度搜索...
    ✓ 生成2000字深度扩展分析

[4/4] 重新生成和发布
  ✓ 静态网站生成成功
  ✓ 推送到GitHub成功

✅ AI Agent工作流完成！
  • 原始资讯: 18条
  • 补充资讯: 5条
  • 扩展分析: 1条
  • 总计发布: 24条
```

---

## 🎯 成功标准

**自动化执行成功的标志**：

1. ✅ 所有步骤无需人工确认
2. ✅ 建议文件被自动处理
3. ✅ 新资讯被自动添加到对应类目
4. ✅ 网站自动重新生成并推送
5. ✅ 整个流程在10-15分钟内完成

**质量标准**：

1. ✅ 每个类目至少3-5条资讯
2. ✅ 所有资讯可信度 >= 0.85
3. ✅ 深度分析2000-3000字
4. ✅ 无重复资讯
5. ✅ 内容符合AI-ANALYSIS-GUIDE.md标准

---

## 💡 使用提示

### 在Cursor Chat中执行

只需要一句话：

```
@AI-AGENT-WORKFLOW.md 请执行今日AI资讯自动化工作流
```

AI Agent会：
1. 读取这个文件
2. 自动执行所有步骤
3. 处理所有建议文件
4. 生成和发布网站
5. 完成后报告结果

### 定时自动执行

添加到crontab：

```bash
# 每天早上8点，AI Agent自动执行
0 8 * * * cd /path/to/News && cursor chat "@AI-AGENT-WORKFLOW.md 执行工作流"
```

---

## 🔗 相关文档

- [AI分析指南](./AI-ANALYSIS-GUIDE.md) - 深度分析方法论
- [工具文档](./mcp-server/TOOLS.md) - MCP工具详细说明
- [README](./README.md) - 项目总览

---

**最后更新**: 2025-11-12  
**维护者**: ZhipingYang  
**目标**: AI Agent完全自动化执行

