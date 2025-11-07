# 故障排查指南

## 快速诊断

### 问题分类

| 问题类型 | 症状 | 跳转 |
|---------|------|------|
| RSS抓取失败 | 无法获取资讯 | [→](#rss抓取问题) |
| 去重问题 | 重复/误判 | [→](#去重问题) |
| 质量评估问题 | 过滤过严/过松 | [→](#质量评估问题) |
| 分析生成问题 | 质量不佳/失败 | [→](#分析生成问题) |
| 网站构建问题 | 构建失败/样式错误 | [→](#网站构建问题) |
| Git推送问题 | 403/认证失败 | [→](#git推送问题) |

---

## RSS抓取问题

### 症状：所有RSS源抓取失败

**可能原因：**
- 网络连接问题
- 防火墙阻止
- DNS解析失败

**诊断：**
```bash
# 测试网络
ping github.com

# 测试单个RSS源
curl https://github.blog/feed/

# 测试Node.js网络
cd mcp-server
node -e "fetch('https://github.blog/feed/').then(r => r.text()).then(console.log)"
```

**解决：**
1. 检查网络连接
2. 配置代理（如需要）
3. 检查防火墙设置

---

### 症状：部分RSS源抓取失败

**可能原因：**
- 源暂时不可用
- 源URL已变更
- 超时

**诊断：**
```bash
cd mcp-server
node tools/fetch-rss.js ai_programming

# 查看详细错误
node tools/fetch-rss.js all 2>&1 | grep "✗"
```

**解决：**
1. 在浏览器中访问失败的RSS URL
2. 如果404，更新或移除该源
3. 如果超时，增加timeout设置：
```json
// mcp-server/config/rss-sources.json
{
  "settings": {
    "fetch_timeout": 15000  // 增加至15秒
  }
}
```

---

### 症状：RSS内容解析错误

**可能原因：**
- RSS格式不标准
- 编码问题
- 解析器不支持

**诊断：**
```bash
# 下载RSS内容
curl https://example.com/feed/ > test.xml

# 检查格式
head -50 test.xml
```

**解决：**
1. 使用RSS验证工具验证格式
2. 检查编码（应为UTF-8）
3. 考虑移除问题源或使用其他解析器

---

## 去重问题

### 症状：明显重复的资讯未被检测

**可能原因：**
- 标题差异过大
- 阈值设置过高
- 关键词提取不准确

**诊断：**
```bash
cd mcp-server
node -e "
import('./utils/deduplicator.js').then(m => {
  const similarity = m.calculateSimilarity('标题A', '标题B');
  console.log('相似度：', similarity);
});
"
```

**解决：**
1. 降低相似度阈值：
```json
// mcp-server/data/deduplication.json
{
  "settings": {
    "similarity_threshold": 0.75  // 从0.8降低至0.75
  }
}
```
2. 手动审核并添加到历史
3. 优化关键词提取算法

---

### 症状：不同资讯被误判为重复

**可能原因：**
- 标题格式类似
- 通用关键词过多
- 阈值设置过低

**诊断：**
```bash
cd mcp-server
node -e "
import('./utils/deduplicator.js').then(m => {
  m.checkDuplicate({
    title: '测试标题',
    description: '...',
    source: '...'
  }).then(result => {
    console.log('是否重复：', result.isDuplicate);
    console.log('原因：', result.reason);
    if (result.similarItem) {
      console.log('相似项：', result.similarItem.title);
      console.log('相似度：', result.similarItem.similarity);
    }
  });
});
"
```

**解决：**
1. 提高相似度阈值：
```json
{
  "settings": {
    "similarity_threshold": 0.85  // 从0.8提高至0.85
  }
}
```
2. 优化关键词提取（排除通用词）
3. 手动审核边界情况

---

### 症状：去重数据库损坏

**可能原因：**
- 文件写入中断
- JSON格式错误
- 磁盘空间不足

**诊断：**
```bash
# 检查JSON格式
cat mcp-server/data/deduplication.json | jq .

# 检查磁盘空间
df -h
```

**解决：**
```bash
# 备份损坏文件
cp mcp-server/data/deduplication.json mcp-server/data/deduplication.json.bak

# 重新初始化
cat > mcp-server/data/deduplication.json << 'EOF'
{
  "history": {},
  "stats": {
    "total_checked": 0,
    "duplicates_found": 0
  },
  "settings": {
    "similarity_threshold": 0.8,
    "max_history_days": 7,
    "keyword_overlap_threshold": 0.7
  }
}
EOF
```

---

## 质量评估问题

### 症状：所有资讯都被过滤

**可能原因：**
- 质量阈值设置过高
- 评估规则过严
- RSS源可信度过低

**诊断：**
```bash
# 检查评估规则
cat mcp-server/config/evaluation-rules.json | jq '.quality_thresholds'

# 检查RSS源可信度
cat mcp-server/config/rss-sources.json | jq '.ai_programming[].credibility'
```

**解决：**
1. 降低质量阈值：
```json
// mcp-server/config/evaluation-rules.json
{
  "quality_thresholds": {
    "accept_threshold": 0.80  // 从0.85降低至0.80
  }
}
```
2. 检查RSS源可信度（应≥0.85）
3. 放宽最低要求

---

### 症状：低质量资讯未被过滤

**可能原因：**
- 质量阈值设置过低
- 评估规则过松
- 红旗检测未生效

**诊断：**
查看资讯评分详情

**解决：**
1. 提高质量阈值至0.90
2. 增加红旗关键词
3. 提高最低要求（最小长度、数据点数量）

---

## 分析生成问题

### 症状：分析字数不足

**可能原因：**
- AI理解有误
- 上下文信息不足
- 模板未正确应用

**解决：**
1. 在prompt中明确字数要求："必须生成1500-2000字"
2. 提供更多上下文信息
3. 检查 `AI-ANALYSIS-GUIDE.md` 和 `templates.md`

---

### 症状：分析质量不符合预期

**可能原因：**
- 资讯质量本身不高
- 分析框架不适用
- AI理解偏差

**解决：**
1. 提高资讯质量过滤标准
2. 调整分析框架（`AI-ANALYSIS-GUIDE.md`）
3. 提供更详细的模板（`templates.md`）
4. 增加具体示例

---

### 症状：分析生成失败

**可能原因：**
- AI token限制
- 网络问题
- 上下文过长

**解决：**
1. 减少上下文长度
2. 分批生成（先生成大纲，再逐section生成）
3. 检查网络连接

---

## 网站构建问题

### 症状：npm run build失败

**可能原因：**
- Node.js版本过低
- 依赖缺失
- markdown文件格式错误

**诊断：**
```bash
# 检查Node.js版本
node --version  # 需≥18.0

# 检查依赖
npm list marked

# 手动测试生成器
cd static-site
node generator.js
```

**解决：**
1. 升级Node.js：`brew upgrade node`
2. 重新安装依赖：`npm install`
3. 检查markdown文件格式

---

### 症状：网站样式错误

**可能原因：**
- CSS文件缺失
- 路径错误
- 浏览器缓存

**诊断：**
```bash
# 检查CSS文件
ls -l docs/styles/main.css
ls -l static-site/styles/main.css

# 检查HTML中的CSS引用
grep -r "main.css" docs/
```

**解决：**
1. 确保CSS文件存在
2. 清除浏览器缓存
3. 检查路径引用

---

### 症状：部分页面404

**可能原因：**
- 文件未生成
- 文件名不匹配
- 链接错误

**诊断：**
```bash
# 检查生成的文件
ls -lR docs/news/

# 检查链接
grep -r "href=" docs/*.html | grep "404"
```

**解决：**
1. 重新运行 `npm run build`
2. 检查 `static-site/generator.js` 逻辑
3. 验证markdown文件名格式

---

## Git推送问题

### 症状：Git推送403错误

**可能原因：**
- GitHub CLI未登录
- Token无效或权限不足
- Token过期

**诊断：**
```bash
# 检查GitHub CLI
gh auth status

# 检查token（如使用）
cat .env | grep GITHUB_TOKEN

# 测试token
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
```

**解决方法1：使用GitHub CLI（推荐）**
```bash
# 安装（如未安装）
brew install gh

# 登录
gh auth login

# 刷新认证
gh auth refresh

# 测试
gh repo view
```

**解决方法2：更新Token**
```bash
# 1. 生成新token
# 访问：https://github.com/settings/tokens
# 生成新token，确保勾选 "repo" 权限

# 2. 更新.env
echo "GITHUB_TOKEN=your_new_token" > .env
chmod 600 .env

# 3. 测试
./scripts/auto-push.sh
```

**解决方法3：手动推送**
```bash
git push origin master
```

---

### 症状：Git冲突

**可能原因：**
- 多处修改同一文件
- 远程有新提交

**诊断：**
```bash
git status
git log --oneline --graph --all
```

**解决：**
```bash
# 拉取远程更改
git pull origin master

# 解决冲突
# 编辑冲突文件，移除冲突标记

# 完成合并
git add .
git commit -m "Resolve conflicts"
git push origin master
```

---

### 症状：推送被拒绝（non-fast-forward）

**可能原因：**
- 本地落后于远程
- 历史不一致

**解决：**
```bash
# 拉取并合并
git pull --rebase origin master
git push origin master

# 或者强制推送（慎用！）
git push --force origin master
```

---

## 环境问题

### 症状：command not found

**可能原因：**
- 工具未安装
- PATH环境变量未设置

**解决：**
```bash
# Node.js
brew install node

# GitHub CLI
brew install gh

# 验证
which node
which npm
which gh
```

---

### 症状：权限错误

**可能原因：**
- 文件权限不足
- 目录权限不足

**解决：**
```bash
# 修复文件权限
chmod +x scripts/auto-push.sh

# 修复目录权限
chmod 755 mcp-server/data

# 修复.env权限
chmod 600 .env
```

---

## 性能问题

### 症状：执行速度过慢

**可能原因：**
- RSS源过多
- 网络延迟
- 历史数据过多

**优化：**
1. 减少RSS源数量
2. 增加并发请求
3. 清理过期历史数据：
```bash
cd mcp-server
node -e "import('./utils/deduplicator.js').then(m => m.cleanupOldData(7))"
```

---

## 数据问题

### 症状：数据丢失

**可能原因：**
- 文件被删除
- Git回滚
- 构建覆盖

**恢复：**
```bash
# 从Git历史恢复
git log --all --full-history -- "YYYY-MM-DD/*.md"
git checkout <commit-hash> -- "YYYY-MM-DD/*.md"

# 从备份恢复（如有）
cp backup/* ./
```

**预防：**
- 定期备份重要数据
- 使用Git版本控制
- 不要使用 `--force` 选项

---

## 还是无法解决？

1. **查看日志**：检查错误信息
2. **搜索Issue**：查看GitHub Issues
3. **提交Issue**：描述问题、贴出错误信息、说明已尝试的解决方法
4. **联系支持**：通过GitHub Discussion讨论

---

**最后更新：** 2025-11-07

