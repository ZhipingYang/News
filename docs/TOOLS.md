# 工具使用指南

本文档介绍项目中各种工具的使用方法。

---

## RSS数据处理工具

### `mcp-server/tools/process-rss-data.js`

**功能：** 整合去重检查和可信度评估流程，自动化处理RSS抓取数据

**用法：**
```bash
cd mcp-server
node tools/process-rss-data.js <rss文件路径> [可信度阈值]
```

**参数：**
- `rss文件路径`：RSS抓取结果文件（必需）
  - 示例：`data/rss-fetch-2025-11-07.json`
- `可信度阈值`：最低可信度分数（可选，默认0.85）
  - 示例：`0.85`（只接受≥0.85的资讯）

**示例：**
```bash
# 使用默认阈值（0.85）
node tools/process-rss-data.js data/rss-fetch-2025-11-07.json

# 自定义阈值（0.80）
node tools/process-rss-data.js data/rss-fetch-2025-11-07.json 0.80
```

**处理流程：**
1. 读取RSS抓取数据
2. 清理过期去重数据（7天前）
3. 按主题处理：
   - 去重检查（相似度阈值0.8）
   - 可信度评估（四维评估体系）
   - 筛选高质量资讯（≥阈值）
4. 按日期分组
5. 保存处理结果

**输出：**
- 控制台：处理统计信息
- 文件：`data/processed-rss-YYYY-MM-DD.json`

**输出格式：**
```json
{
  "byDate": {
    "2025-11-06": [
      {
        "title": "...",
        "link": "...",
        "evaluation": {
          "credibilityScore": 0.86,
          "category": "ai-programming",
          ...
        }
      }
    ]
  },
  "processed": {
    "ai_programming": [...],
    "generative_ai": [...],
    ...
  }
}
```

**优势：**
- ✅ 自动化处理，减少手动步骤
- ✅ 提供详细的处理统计
- ✅ 支持自定义可信度阈值
- ✅ 按日期和主题组织结果

**使用场景：**
- 批量处理RSS数据
- 快速筛选高质量资讯
- 分析资讯质量分布
- 调试去重和评估流程

---

## RSS抓取工具

### `mcp-server/tools/fetch-rss.js`

**功能：** 从配置的RSS源抓取最新资讯

**用法：**
```bash
cd mcp-server
node tools/fetch-rss.js [主题] [最大天数]
```

**参数：**
- `主题`：可选，指定主题或 `all`（默认：`all`）
  - 可选值：`ai_programming`, `generative_ai`, `ai_chips`, `quantum_computing`, `robotics`, `all`
- `最大天数`：可选，抓取最近N天的资讯（默认：7）

**示例：**
```bash
# 抓取所有主题，最近7天
node tools/fetch-rss.js all

# 抓取AI编程主题，最近2天
node tools/fetch-rss.js ai_programming 2

# 抓取所有主题，最近30天
node tools/fetch-rss.js all 30
```

**输出：**
- 控制台：抓取进度和统计
- 文件：`data/rss-fetch-YYYY-MM-DD.json`

---

## 去重工具

### `mcp-server/utils/deduplicator.js`

**功能：** 检测和移除重复资讯

**主要函数：**
- `checkDuplicate(newsItem, threshold, maxDays)` - 检查单条资讯是否重复
- `deduplicateBatch(newsItems, threshold)` - 批量去重
- `addToHistory(date, newsItem)` - 添加到历史记录
- `getStats()` - 获取统计信息
- `cleanupOldData(maxDays)` - 清理过期数据

**使用示例：**
```javascript
import { deduplicateBatch, getStats } from './utils/deduplicator.js';

// 批量去重
const { unique, duplicates } = await deduplicateBatch(newsItems, 0.8);
console.log(`唯一：${unique.length}，重复：${duplicates.length}`);

// 获取统计
const stats = await getStats();
console.log(`重复率：${stats.duplicate_rate}`);
```

**详细文档：** [DEDUPLICATION.md](./DEDUPLICATION.md)

---

## 评估工具

### `mcp-server/tools/evaluate-content.js`

**功能：** 评估资讯内容的可信度和价值

**主要类：** `EvaluateContentTool`

**评估维度：**
1. 来源可信度（40%）
2. 内容完整性（25%）
3. 时效性（15%）
4. 内容质量（20%）

**使用示例：**
```javascript
import { EvaluateContentTool } from './tools/evaluate-content.js';

const evaluator = new EvaluateContentTool();
const result = await evaluator.execute({
  content: "...",
  source: "https://...",
  publishDate: "2025-11-07",
  title: "..."
});

if (result.report.credibilityScore >= 0.85) {
  console.log("高质量资讯，建议生成");
}
```

**详细配置：** `mcp-server/config/evaluation-rules.json`

---

## 网站生成工具

### `static-site/generator.js`

**功能：** 将markdown文件转换为静态HTML网站

**用法：**
```bash
npm run build
```

**功能：**
- 扫描所有日期文件夹
- 解析markdown文件
- 生成HTML页面
- 创建索引和导航

**输出：**
- `docs/index.html` - 首页
- `docs/YYYY-MM-DD.html` - 每日汇总
- `docs/news/YYYY-MM-DD/*.html` - 资讯详情页

---

## Git推送工具

### `scripts/auto-push.sh`

**功能：** 自动提交并推送到GitHub

**用法：**
```bash
./scripts/auto-push.sh
```

**功能：**
- 检查是否有更改
- 自动提交（带日期信息）
- 优先使用GitHub CLI推送
- Fallback到Token方式

**要求：**
- GitHub CLI已安装并登录，或
- `.env`文件中配置了`GITHUB_TOKEN`

---

## 工具组合使用

### 完整工作流

```bash
# 1. 抓取RSS
cd mcp-server
node tools/fetch-rss.js all 2

# 2. 处理数据（去重+评估）
node tools/process-rss-data.js data/rss-fetch-2025-11-07.json 0.85

# 3. 查看处理结果
cat data/processed-rss-2025-11-07.json | jq '.byDate'

# 4. 生成网站
cd ..
npm run build

# 5. 推送
./scripts/auto-push.sh
```

### 快速检查

```bash
# 只抓取和评估，不生成分析
cd mcp-server
node tools/fetch-rss.js all
node tools/process-rss-data.js data/rss-fetch-$(date +%Y-%m-%d).json

# 查看统计
cat data/processed-rss-$(date +%Y-%m-%d).json | jq '{
  total: [.processed | to_entries[] | .value | length] | add,
  byTopic: [.processed | to_entries[] | {topic: .key, count: (.value | length)}]
}'
```

---

## 故障排查

**问题：process-rss-data.js执行失败**

1. 检查RSS文件是否存在：
   ```bash
   ls mcp-server/data/rss-fetch-*.json
   ```

2. 检查文件格式：
   ```bash
   cat mcp-server/data/rss-fetch-*.json | jq .
   ```

3. 检查依赖：
   ```bash
   cd mcp-server && npm install
   ```

**问题：处理结果为空**

1. 检查可信度阈值是否过高
2. 查看控制台输出，了解过滤原因
3. 尝试降低阈值：
   ```bash
   node tools/process-rss-data.js data/rss-fetch-*.json 0.80
   ```

**问题：去重结果异常**

1. 检查去重数据库：
   ```bash
   cat mcp-server/data/deduplication.json
   ```

2. 清理并重新开始：
   ```bash
   rm mcp-server/data/deduplication.json
   ```

---

## 相关文档

- [WORKFLOW.md](./WORKFLOW.md) - 完整工作流说明
- [DEDUPLICATION.md](./DEDUPLICATION.md) - 去重机制详解
- [RSS-SOURCES.md](./RSS-SOURCES.md) - RSS源管理
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 故障排查

