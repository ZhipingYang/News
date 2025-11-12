# 工具文件职责说明

本文档明确各工具文件的职责和使用场景。

---

## 📁 目录结构

```
mcp-server/
├── server.js                    # MCP服务器入口
├── tools/                       # 工具脚本
│   ├── fetch-rss.js             # RSS源抓取（CLI）
│   ├── process-rss-data.js      # 数据处理（CLI）
│   ├── process-news.js          # 资讯处理（MCP工具）
│   ├── evaluate-content.js      # 内容评估（MCP工具）
│   ├── intelligent-supplement.js # 智能补充分析（CLI）
│   ├── expand-important-news.js # 重要资讯扩展（CLI）
│   ├── test-rss-sources.js      # RSS源测试（CLI）
│   └── source-validator.js      # 来源验证器（库）
└── utils/                       # 工具库
    ├── deduplicator.js          # 去重工具（库）
    ├── content-compressor.js    # 内容压缩（库/CLI）
    ├── credibility-scorer.js    # 可信度评分（库）
    └── content-analyzer.js      # 内容分析（库）
```

---

## 🔧 CLI 工具（命令行）

### 1. fetch-rss.js - RSS源抓取

**职责**: 从配置的RSS源抓取最新资讯

**使用场景**: 自动化批量处理的第一步

**命令**:
```bash
cd mcp-server
node tools/fetch-rss.js all              # 抓取所有主题
node tools/fetch-rss.js ai-programming   # 抓取单个主题
node tools/fetch-rss.js all 3            # 抓取最近3天
```

**输出**: `data/rss-fetch-YYYY-MM-DD.json`

**数据结构**:
```json
{
  "ai-programming": [
    {
      "title": "资讯标题",
      "link": "https://...",
      "description": "内容",
      "pubDate": "2025-11-12T...",
      "source": "GitHub Blog",
      "credibility": 0.95,
      "category": "company_official"
    }
  ],
  "ai-products": [...],
  "tech-general": [...]
}
```

---

### 2. process-rss-data.js - 数据处理

**职责**: 对RSS数据进行去重、评估、筛选

**使用场景**: 自动化批量处理的第二步

**命令**:
```bash
node tools/process-rss-data.js data/rss-fetch-2025-11-12.json
node tools/process-rss-data.js data/rss-fetch-2025-11-12.json 0.85  # 自定义可信度阈值
```

**执行流程**:
1. 读取RSS抓取数据
2. 清理7天前的旧数据
3. 对每个类目进行去重（相似度≥80%）
4. 评估每条资讯的可信度
5. 筛选出可信度≥0.8的资讯

**输出**: `data/processed-rss-YYYY-MM-DD.json`

**数据结构**:
```json
{
  "byDate": {
    "2025-11-12": [...]
  },
  "processed": {
    "ai-programming": [
      {
        ...原始数据,
        "evaluation": {
          "credibilityScore": 0.92,
          "category": "ai-programming",
          "suggestedTags": ["#AI", "#编程"]
        }
      }
    ]
  }
}
```

---

### 3. intelligent-supplement.js - 智能补充分析

**职责**: 分析资讯数量和质量，建议是否需要web_search补充

**使用场景**: 当某个类目资讯不足时，给出补充建议

**命令**:
```bash
node tools/intelligent-supplement.js data/rss-fetch-2025-11-12.json
```

**触发条件**:
- 资讯数量 < 3条
- 平均质量分数 < 0.75

**输出**: `data/supplement-suggestions-YYYY-MM-DD.json`

**建议内容**:
```json
{
  "categories": {
    "ai-programming": {
      "needsSupplement": true,
      "searchQueries": [
        "AI coding tools 2025-11-12",
        "GitHub Copilot new features",
        ...
      ],
      "targetCount": 3
    }
  }
}
```

---

### 4. expand-important-news.js - 重要资讯扩展

**职责**: 识别高影响力资讯，生成深度搜索查询

**使用场景**: 对重大资讯进行深度扩展分析

**命令**:
```bash
node tools/expand-important-news.js data/processed-rss-2025-11-12.json
```

**评估维度**:
- 关键词（发布、突破、融资等）
- 来源可信度
- 知名机构
- 数据指标
- 内容详细度

**影响力评分**:
- ≥50分：高影响力，需要扩展
- <50分：普通资讯

**输出**: `data/expansion-suggestions-YYYY-MM-DD.json`

---

### 5. test-rss-sources.js - RSS源测试

**职责**: 测试所有RSS源的可用性

**使用场景**: 维护RSS源配置，检查失效源

**命令**:
```bash
node tools/test-rss-sources.js          # 测试所有源
node tools/test-rss-sources.js --remove # 测试并移除失败的源
```

**输出**: `data/rss-test-report.json` + 控制台报告

---

## 🔌 MCP 工具（Model Context Protocol）

### 1. evaluate_content - 内容评估

**职责**: 评估单条资讯的可信度和质量

**使用场景**: 手动模式处理单条资讯时

**调用方式**:
```javascript
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

**返回**:
```json
{
  "success": true,
  "report": {
    "shouldGenerate": true,
    "credibilityScore": 0.92,
    "category": "ai-programming",
    "sourceValidation": {...},
    "contentAnalysis": {...},
    "warnings": [],
    "suggestedTags": ["#AI", "#编程"]
  }
}
```

**实现**: `tools/evaluate-content.js`

---

### 2. process_news - 资讯处理

**职责**: 评估并保存单条资讯到markdown文件

**使用场景**: 手动模式处理单条高质量资讯时

**调用方式**:
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

**执行流程**:
1. 调用 `evaluate_content` 评估质量
2. 如果可信度≥0.85（或forceGenerate=true）
3. 确定资讯类别
4. 创建/检查日期文件夹
5. 生成markdown内容
6. 追加到对应的类目文件

**返回**:
```json
{
  "success": true,
  "filePath": "2025-11-12/ai-programming.md",
  "isNewFile": false,
  "category": "ai-programming"
}
```

**实现**: `tools/process-news.js`

---

## 📚 工具库（Library）

### 1. deduplicator.js - 去重工具

**职责**: 检测和移除重复资讯

**使用方式**:
```javascript
import { deduplicateBatch, checkDuplicate, addToHistory } from './utils/deduplicator.js';

// 批量去重
const { unique, duplicates } = await deduplicateBatch(newsItems, 0.8);

// 单条检查
const result = await checkDuplicate(newsItem, 0.8);

// 添加到历史
await addToHistory('2025-11-12', newsItem);
```

**去重策略**:
1. 标题相似度 ≥ 80%
2. 关键词重叠 ≥ 70% + 标题相似 ≥ 60%
3. 历史对比：最近7天

**数据库**: `data/deduplication.json`

---

### 2. content-compressor.js - 内容压缩

**职责**: 智能提取关键信息，压缩内容

**使用方式**:
```javascript
import { compressNewsItem } from './utils/content-compressor.js';

const compressed = compressNewsItem(newsItem);
// compressed.compressionRatio: "35%"
```

**压缩策略**:
- 提取关键数据点（数字、百分比、金额）
- 提取关键句子（包含重要关键词）
- 提取技术细节
- 目标压缩率：30-40%

**注意**: 当前版本未集成到主流程，可选使用

---

### 3. credibility-scorer.js - 可信度评分

**职责**: 计算资讯可信度分数

**评分维度**:
- 来源可信度 (40%)
- 内容完整性 (25%)
- 时效性 (20%)
- 内容质量 (15%)

**使用方式**:
```javascript
import { CredibilityScorer } from './utils/credibility-scorer.js';

const scorer = new CredibilityScorer();
const result = await scorer.calculateScore({
  sourceScore: 0.9,
  content: "...",
  publishDate: "2025-11-12"
});
```

---

### 4. content-analyzer.js - 内容分析

**职责**: 分析内容类型、提取关键信息、生成标签

**功能**:
- 识别资讯类别（ai-programming/ai-products/tech-general）
- 提取技术关键词
- 生成建议标签
- 生成内容摘要

---

### 5. source-validator.js - 来源验证

**职责**: 验证资讯来源的可信度

**配置**: `config/sources.json`

**功能**:
- 检查可信域名
- 匹配来源模式
- 计算来源评分

---

## 🔄 工具调用流程

### 自动化批量处理流程

```
1. fetch-rss.js 
   ↓ rss-fetch-YYYY-MM-DD.json
   
2. process-rss-data.js 
   ├─ deduplicator.js (去重)
   ├─ evaluate-content.js (评估)
   └─ credibility-scorer.js (评分)
   ↓ processed-rss-YYYY-MM-DD.json
   
3. [AI深度分析] → markdown文件
   
4. generator.js → 静态网站
   
5. auto-push.sh → GitHub发布
```

### 手动单条处理流程

```
1. 收集资讯
   
2. MCP: evaluate_content
   ├─ source-validator.js
   ├─ content-analyzer.js
   └─ credibility-scorer.js
   
3. [AI深度分析]
   
4. MCP: process_news
   ├─ evaluate_content
   └─ 保存到markdown
   
5. generator.js → 静态网站
```

---

## 📝 数据文件命名规范

| 文件名 | 内容 | 生成工具 |
|--------|------|---------|
| `rss-fetch-YYYY-MM-DD.json` | RSS原始数据 | fetch-rss.js |
| `processed-rss-YYYY-MM-DD.json` | 处理后数据 | process-rss-data.js |
| `supplement-suggestions-YYYY-MM-DD.json` | 补充建议 | intelligent-supplement.js |
| `expansion-suggestions-YYYY-MM-DD.json` | 扩展建议 | expand-important-news.js |
| `deduplication.json` | 去重历史 | deduplicator.js |
| `rss-test-report.json` | RSS测试报告 | test-rss-sources.js |

---

## 🎯 工具选择指南

**什么时候用CLI工具？**
- 批量处理大量资讯
- 自动化定时任务
- 测试和维护

**什么时候用MCP工具？**
- 处理单条高质量资讯
- 需要AI深度分析
- 精细化控制

**什么时候用工具库？**
- 开发新工具
- 自定义处理流程
- 集成到其他系统

---

## ⚙️ 配置文件

| 文件 | 用途 |
|------|------|
| `config/rss-sources.json` | RSS源列表（25个精品源） |
| `config/sources.json` | 可信域名和评分规则 |
| `config/evaluation-rules.json` | 内容评估规则 |

---

**最后更新**: 2025-11-12  
**版本**: 2.0

