# 常见问题FAQ

## 基本使用

**Q1：如何执行今日资讯自动化分析？**

在Cursor Chat中输入：
```
@README.md 请执行今日AI资讯自动化分析工作流
```

AI会自动完成：RSS抓取 → 去重 → 评估 → 分析 → 构建 → 推送

---

**Q2：执行需要多长时间？**

**全自动执行：**25-35分钟
- RSS抓取：5-8分钟
- 去重检查：3-5分钟
- 质量评估：2-3分钟
- 深度分析：15-20分钟
- 网站构建：2-3分钟
- Git推送：1-2分钟

---

**Q3：如何处理低质量资讯？**

AI会自动过滤可信度<0.85的资讯并记录原因。如某个主题当天没有高质量资讯，会在对应文件中标注说明。

---

**Q4：如何处理重复资讯？**

去重机制会自动检测并移除重复资讯（相似度≥80%）。所有重复项会被记录在去重日志中，包含原因和相似项信息。

---

## RSS源管理

**Q5：如何调整搜索关键词？**

现在主要使用RSS源订阅（占80%），web_search仅作为补充（占20%）。如需调整：
- RSS源：编辑 `mcp-server/config/rss-sources.json`
- 搜索关键词：修改README第一阶段部分

---

**Q6：如何添加新的RSS源？**

1. 编辑 `mcp-server/config/rss-sources.json`
2. 添加新源配置（name, url, credibility, category, description）
3. 测试：`cd mcp-server && node tools/fetch-rss.js [topic]`

详见：[RSS-SOURCES.md](./RSS-SOURCES.md)

---

**Q7：RSS源抓取失败怎么办？**

**常见原因：**
- 网络问题 → 检查网络连接
- RSS源失效 → 访问URL验证
- 格式错误 → 检查RSS格式

**解决方法：**
1. 查看错误日志
2. 手动访问RSS URL测试
3. 必要时移除或替换该源

---

## 质量控制

**Q8：如何自定义分析侧重点？**

编辑以下文件：
- `AI-ANALYSIS-GUIDE.md`：分析框架和深度要求
- `templates.md`：各类型资讯模板
- `mcp-server/config/evaluation-rules.json`：质量标准

AI会自动遵循新的分析框架。

---

**Q9：可以调整质量标准吗？**

可以。编辑 `mcp-server/config/evaluation-rules.json`：
- `quality_thresholds.accept_threshold`：接受阈值（默认0.85）
- `minimum_requirements.min_length`：最小长度（默认300字）
- `scoring_weights`：各维度权重

---

**Q10：如何提高或降低质量标准？**

**提高标准：**
```json
{
  "quality_thresholds": {
    "accept_threshold": 0.90  // 提高至0.90
  },
  "minimum_requirements": {
    "min_length": 500  // 提高至500字
  }
}
```

**降低标准：**
```json
{
  "quality_thresholds": {
    "accept_threshold": 0.80  // 降低至0.80
  },
  "minimum_requirements": {
    "min_length": 200  // 降低至200字
  }
}
```

---

## 去重机制

**Q11：去重是如何工作的？**

双重检测机制：
1. **标题相似度**：Levenshtein距离算法，阈值80%
2. **关键词重叠**：重叠度70% + 标题相似60%

检查范围：最近7天历史记录

详见：[DEDUPLICATION.md](./DEDUPLICATION.md)

---

**Q12：如何调整去重阈值？**

编辑 `mcp-server/data/deduplication.json`：
```json
{
  "settings": {
    "similarity_threshold": 0.8,  // 标题相似度阈值
    "keyword_overlap_threshold": 0.7  // 关键词重叠阈值
  }
}
```

---

**Q13：去重误判怎么办？**

**误判为重复：**
- 提高阈值至0.85
- 检查是否确实重复
- 手动审核边界情况

**未检测到重复：**
- 降低阈值至0.75
- 检查标题和关键词
- 优化关键词提取

---

## Git推送

**Q14：自动化失败怎么办？**

**查看错误信息，常见原因：**
- 网络问题（RSS抓取失败） → 重试
- 文件权限问题 → 检查目录权限
- Git冲突 → 手动解决冲突后重新执行
- GitHub认证失败 → 检查GitHub CLI或token

---

**Q15：Git推送403错误？**

**原因：**
- GitHub CLI未登录
- Token权限不足
- Token过期

**解决：**
```bash
# 方法1：使用GitHub CLI（推荐）
gh auth login

# 方法2：检查token
cat .env  # 确认GITHUB_TOKEN存在
# 访问 https://github.com/settings/tokens 检查权限

# 方法3：手动推送
git push origin master
```

---

**Q16：可以只执行部分流程吗？**

可以。在Cursor Chat中指定：

**仅搜集资讯（不生成分析）：**
```
@README.md 请仅抓取RSS源和搜集资讯
```

**仅生成分析（假设已有资讯）：**
```
@AI-ANALYSIS-GUIDE.md 请分析以下资讯：[粘贴资讯]
```

**仅生成网站（不提交Git）：**
```bash
npm run build
```

**仅提交推送：**
```bash
./scripts/auto-push.sh
```

---

## 网站发布

**Q17：网站多久更新一次？**

- **本地构建**：`npm run build` 立即生成
- **GitHub Pages**：推送后2-3分钟自动更新

---

**Q18：网站无法访问？**

**检查清单：**
1. GitHub Pages是否已启用（Settings → Pages）
2. 分支设置是否正确（master分支，/docs目录）
3. 等待2-3分钟（构建需要时间）
4. 检查`docs/`目录是否有内容

---

**Q19：如何本地预览网站？**

```bash
npm run serve
# 访问：http://localhost:8080
```

---

## 自定义配置

**Q20：可以修改分析字数要求吗？**

可以。在 `AI-ANALYSIS-GUIDE.md` 中修改：
```markdown
## 分析框架（1500-2000字）  ← 修改此处
```

AI会自动遵循新的字数要求。

---

**Q21：可以添加新的资讯分类吗？**

可以。步骤：
1. 在 `templates.md` 中定义新模板
2. 在 `mcp-server/config/rss-sources.json` 添加新主题
3. 更新 `static-site/generator.js` 的分类逻辑
4. 更新README说明

---

**Q22：可以修改网站样式吗？**

可以。编辑：
- `static-site/styles/main.css`：全局样式
- `static-site/templates/*.html`：页面模板

修改后运行 `npm run build` 重新生成。

---

## 故障排查

**Q23：npm install失败？**

```bash
# 检查Node.js版本
node --version  # 需要≥18.0

# 清理缓存
npm cache clean --force

# 重新安装
rm -rf node_modules package-lock.json
npm install
```

---

**Q24：RSS抓取全部失败？**

**检查：**
1. 网络连接是否正常
2. 防火墙是否阻止
3. RSS源是否全部失效（不太可能）

**解决：**
```bash
# 测试单个源
cd mcp-server
node tools/fetch-rss.js ai_programming

# 查看详细错误
node tools/fetch-rss.js all 2>&1 | tee fetch-log.txt
```

---

**Q25：分析质量不符合预期？**

**调整方法：**
1. 编辑 `AI-ANALYSIS-GUIDE.md` 调整分析框架
2. 编辑 `templates.md` 调整模板结构
3. 提供更多上下文信息
4. 调整字数要求和侧重点

---

## 高级使用

**Q26：可以定时自动执行吗？**

可以。使用cron或GitHub Actions：

**方法1：macOS cron**
```bash
# 编辑crontab
crontab -e

# 添加（每天早上9点执行）
0 9 * * * cd /path/to/News && /path/to/cursor --command "execute_workflow"
```

**方法2：GitHub Actions**
创建 `.github/workflows/daily.yml`（需要自行实现）

---

**Q27：如何批量分析历史资讯？**

```bash
# 1. 收集历史RSS数据
cd mcp-server
node tools/fetch-rss.js all 30  # 最近30天

# 2. 批量分析
# 在Cursor中逐个分析或编写批处理脚本
```

---

**Q28：可以导出数据吗？**

可以。所有数据都是markdown格式：
- 资讯文件：`YYYY-MM-DD/*.md`
- RSS数据：`mcp-server/data/rss-fetch-*.json`
- 去重数据：`mcp-server/data/deduplication.json`

可以用脚本批量处理或导入其他系统。

---

## 更多帮助

**找不到答案？**

1. 查看 [WORKFLOW.md](./WORKFLOW.md) - 详细工作流
2. 查看 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 故障排查
3. 查看 [SETUP.md](./SETUP.md) - 配置指南
4. 提交GitHub Issue

---

**最后更新：** 2025-11-07

