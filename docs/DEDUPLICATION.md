# 去重机制说明

## 去重原理

使用基于标题相似度和关键词重叠的双重检测机制，确保移除所有重复内容。

---

## 去重算法

### 1. 标题相似度检测（Levenshtein距离）

**算法：**计算两个标题的编辑距离，归一化为相似度（0-1）

**阈值：**80%

**示例：**
```
标题A："GitHub Copilot Workspace全面开放"
标题B："GitHub Copilot Workspace正式发布"
相似度：87% → 判定为重复
```

### 2. 关键词重叠检测

**步骤：**
1. 提取关键词（去除停用词）
2. 计算关键词重叠度
3. 结合标题相似度综合判断

**阈值：**
- 关键词重叠度≥70% **且** 标题相似度≥60%

**示例：**
```
标题A："OpenAI发布GPT-4.5，性能提升45%"
关键词：[openai, gpt, 4.5, 性能, 提升, 45]

标题B："OpenAI推出GPT-4.5 Turbo，多模态能力提升"
关键词：[openai, gpt, 4.5, turbo, 多模态, 能力, 提升]

共同关键词：[openai, gpt, 4.5, 提升]
重叠度：4/6 = 67%
标题相似度：65%

判定：不重复（重叠度<70%）
```

---

## 去重数据库

**文件：**`mcp-server/data/deduplication.json`

**结构：**
```json
{
  "history": {
    "2025-11-07": [
      {
        "title": "...",
        "link": "...",
        "source": "...",
        "keywords": ["...", "..."],
        "addedAt": "2025-11-07T10:00:00Z"
      }
    ]
  },
  "stats": {
    "total_checked": 150,
    "duplicates_found": 12
  }
}
```

**数据保留：**最近7天

**自动清理：**每次运行时清理7天前的数据

---

## 使用方法

### 命令行使用

```bash
cd mcp-server

# 检查单条资讯
node -e "
import('./utils/deduplicator.js').then(m => {
  m.checkDuplicate({
    title: '...',
    description: '...',
    source: '...'
  }).then(console.log);
});
"

# 批量去重
node -e "
import('./utils/deduplicator.js').then(m => {
  const items = [...]; // 资讯列表
  m.deduplicateBatch(items).then(console.log);
});
"

# 获取统计信息
node -e "
import('./utils/deduplicator.js').then(m => {
  m.getStats().then(console.log);
});
"

# 清理过期数据
node -e "
import('./utils/deduplicator.js').then(m => {
  m.cleanupOldData(7).then(console.log);
});
"
```

### 编程使用

```javascript
import {
  checkDuplicate,
  deduplicateBatch,
  addToHistory,
  getStats
} from './utils/deduplicator.js';

// 检查是否重复
const result = await checkDuplicate(newsItem);
if (result.isDuplicate) {
  console.log(`重复：${result.reason}`);
  console.log(`相似项：${result.similarItem.title}`);
} else {
  // 添加到历史
  await addToHistory('2025-11-07', newsItem);
}

// 批量去重
const { unique, duplicates } = await deduplicateBatch(newsItems);
console.log(`唯一：${unique.length}，重复：${duplicates.length}`);
```

---

## 调整去重参数

### 调整相似度阈值

编辑 `mcp-server/data/deduplication.json`：

```json
{
  "settings": {
    "similarity_threshold": 0.8,  // 标题相似度阈值（0-1）
    "keyword_overlap_threshold": 0.7  // 关键词重叠阈值（0-1）
  }
}
```

**建议值：**
- **严格**：0.85（更多唯一资讯，可能漏掉部分重复）
- **平衡**：0.80（默认值，推荐）
- **宽松**：0.75（更少重复，可能误判部分唯一资讯）

### 调整历史保留天数

编辑 `mcp-server/data/deduplication.json`：

```json
{
  "settings": {
    "max_history_days": 7  // 保留天数（默认7天）
  }
}
```

**建议值：**
- **短期项目**：3天
- **常规项目**：7天（默认）
- **长期跟踪**：14天

---

## 去重统计

### 查看统计信息

```bash
cd mcp-server
node -e "
import('./utils/deduplicator.js').then(m => {
  m.getStats().then(stats => {
    console.log('总检查数：', stats.total_checked);
    console.log('发现重复：', stats.duplicates_found);
    console.log('重复率：', stats.duplicate_rate);
    console.log('历史记录数：', stats.history_items);
    console.log('历史天数：', stats.history_dates);
  });
});
"
```

### 典型统计数据

```
总检查数：150
发现重复：12
重复率：8%
历史记录数：45
历史天数：7
```

---

## 去重效果评估

### 良好指标
- ✅ 重复率<10%
- ✅ 误判率<5%
- ✅ 处理时间<5秒/100条

### 需要调整的情况
- ⚠️ 重复率>20%：可能需要提高阈值
- ⚠️ 误判率>10%：可能需要降低阈值
- ⚠️ 处理时间>10秒/100条：考虑优化算法

---

## 边界情况处理

### 相似但不重复
- 同一公司不同产品
- 同一技术不同应用
- 同一事件不同角度

**处理：**降低阈值至0.75，或手动审核

### 不同但误判为重复
- 标题格式类似（如"XX发布YY"）
- 通用关键词过多

**处理：**提高阈值至0.85，或优化关键词提取

### 系列报道
- 同一事件的后续报道
- 同一技术的更新迭代

**处理：**
1. 检查发布日期差异
2. 检查内容是否有实质性更新
3. 如有新信息，保留

---

## 故障排查

**问题：所有资讯都被判定为重复**
- 检查去重数据库是否损坏
- 检查阈值是否设置过低
- 清空数据库重新开始

**问题：明显重复的资讯未被检测**
- 检查标题是否差异过大
- 检查关键词提取是否正确
- 考虑降低阈值

**问题：去重速度过慢**
- 检查历史记录数量
- 清理过期数据
- 考虑使用索引优化

**问题：数据库文件损坏**
```bash
# 备份现有数据库
cp mcp-server/data/deduplication.json mcp-server/data/deduplication.json.bak

# 重新初始化
cat > mcp-server/data/deduplication.json << 'EOF'
{
  "history": {},
  "stats": {
    "total_checked": 0,
    "duplicates_found": 0
  }
}
EOF
```

---

## 最佳实践

1. **定期清理**：每周清理一次过期数据
2. **监控统计**：关注重复率变化
3. **人工审核**：定期抽查去重结果
4. **调整阈值**：根据实际情况动态调整
5. **备份数据**：定期备份去重数据库

---

## 相关文档

- [WORKFLOW.md](./WORKFLOW.md) - 完整工作流
- [RSS-SOURCES.md](./RSS-SOURCES.md) - RSS源管理
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 故障排查

